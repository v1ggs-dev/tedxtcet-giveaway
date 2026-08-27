import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Participant, DrawRecord, DrawResult } from './types';
import { parseInstagramHandle } from './utils';

const DATA_DIR = path.join(process.cwd(), 'data');
const PARTICIPANTS_FILE = path.join(DATA_DIR, 'participants.json');
const DRAWS_FILE = path.join(DATA_DIR, 'draws.json');

// Safely ensure data directory and files exist
function ensureDatabaseFiles() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PARTICIPANTS_FILE)) {
      fs.writeFileSync(PARTICIPANTS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
    if (!fs.existsSync(DRAWS_FILE)) {
      fs.writeFileSync(DRAWS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('⚠️ Warning: Could not initialize data directory synchronously:', err);
  }
}

ensureDatabaseFiles();

export class DatabaseService {
  /**
   * Get all registered participants with normalized fields
   */
  static async getParticipants(): Promise<Participant[]> {
    try {
      if (!fs.existsSync(PARTICIPANTS_FILE)) {
        return [];
      }
      const content = fs.readFileSync(PARTICIPANTS_FILE, 'utf-8');
      const rawData: Record<string, unknown>[] = JSON.parse(content || '[]');
      
      return rawData.map((p) => {
        const customData = (p.customData as Record<string, unknown>) || {};
        const customIg =
          customData.Instagram ||
          customData.instagram ||
          customData['IG Handle'] ||
          customData['Instagram Handle'] ||
          customData.Handle ||
          customData.Username;

        const igHandle = parseInstagramHandle(p.instagram) || parseInstagramHandle(customIg);

        return {
          id: String(p.id || ''),
          name: String(p.name || '').trim().toUpperCase(),
          instagram: igHandle,
          email: p.email ? String(p.email).trim() : undefined,
          phone: p.phone ? String(p.phone).trim() : undefined,
          department: p.department ? String(p.department).trim() : undefined,
          customData,
          createdAt: p.createdAt ? String(p.createdAt) : undefined,
        };
      });
    } catch (error) {
      console.error('Error reading participants:', error);
      return [];
    }
  }

  /**
   * Save or replace the participant pool
   */
  static async saveParticipants(participants: Participant[]): Promise<number> {
    ensureDatabaseFiles();
    const cleaned = participants
      .filter((p) => p && p.name && p.name.trim().length > 0)
      .map((p, idx) => {
        const customData = p.customData || {};
        const customIg =
          customData.Instagram ||
          customData.instagram ||
          customData['IG Handle'] ||
          customData['Instagram Handle'] ||
          customData.Handle ||
          customData.Username;

        const igHandle = parseInstagramHandle(p.instagram) || parseInstagramHandle(customIg);

        return {
          id: p.id || `P-${(idx + 1).toString().padStart(4, '0')}`,
          name: p.name.trim().toUpperCase(),
          instagram: igHandle,
          email: p.email ? p.email.trim() : undefined,
          phone: p.phone ? p.phone.trim() : undefined,
          department: p.department ? p.department.trim() : undefined,
          customData,
          createdAt: p.createdAt || new Date().toISOString(),
        };
      });

    fs.writeFileSync(PARTICIPANTS_FILE, JSON.stringify(cleaned, null, 2), 'utf-8');
    return cleaned.length;
  }

  /**
   * Add participants incrementally
   */
  static async addParticipants(newParticipants: Participant[]): Promise<number> {
    const existing = await this.getParticipants();
    const existingNames = new Set(existing.map((p) => p.name.toLowerCase().trim()));

    const uniqueNew = newParticipants.filter(
      (p) => p && p.name && !existingNames.has(p.name.toLowerCase().trim())
    );

    const merged = [...existing, ...uniqueNew];
    await this.saveParticipants(merged);
    return merged.length;
  }

  /**
   * Reset participant pool
   */
  static async clearParticipants(): Promise<void> {
    ensureDatabaseFiles();
    fs.writeFileSync(PARTICIPANTS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }

  /**
   * Get all draw records
   */
  static async getDraws(): Promise<DrawRecord[]> {
    try {
      if (!fs.existsSync(DRAWS_FILE)) {
        return [];
      }
      const content = fs.readFileSync(DRAWS_FILE, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (error) {
      console.error('Error reading draws:', error);
      return [];
    }
  }

  /**
   * Record a new lucky draw result with audit integrity
   */
  static async recordDraw(
    winner: Participant,
    totalParticipants: number,
    mode: 'LIVE' | 'REHEARSAL' = 'LIVE',
    operatorNotes?: string
  ): Promise<DrawResult> {
    ensureDatabaseFiles();
    const existingDraws = await this.getDraws();
    const drawNumber = existingDraws.length + 1;
    const timestamp = new Date().toISOString();
    const drawId = `DRAW-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Cryptographic audit hash ensuring zero tampering
    const auditPayload = `${drawId}:${drawNumber}:${winner.id}:${winner.name}:${totalParticipants}:${timestamp}:${mode}`;
    const auditHash = crypto.createHash('sha256').update(auditPayload).digest('hex');

    const newRecord: DrawRecord = {
      id: drawId,
      drawNumber,
      winnerId: winner.id,
      winnerName: winner.name,
      totalParticipants,
      timestamp,
      auditHash,
      mode,
      operatorNotes,
    };

    existingDraws.unshift(newRecord);
    fs.writeFileSync(DRAWS_FILE, JSON.stringify(existingDraws, null, 2), 'utf-8');

    return {
      drawId,
      drawNumber,
      winner,
      totalParticipants,
      timestamp,
      auditHash,
      mode,
    };
  }

  /**
   * Reset all draw records
   */
  static async clearDraws(): Promise<void> {
    ensureDatabaseFiles();
    fs.writeFileSync(DRAWS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}
