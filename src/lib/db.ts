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
    console.warn('⚠️ Warning: Data directory initialization notice:', err);
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
    const existingNames = new Set(existing.map((p) => p.name.toUpperCase()));

    const toAdd = newParticipants
      .filter((p) => p.name && p.name.trim().length > 0)
      .filter((p) => !existingNames.has(p.name.trim().toUpperCase()))
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
          id: p.id || `P-${(existing.length + idx + 1).toString().padStart(4, '0')}`,
          name: p.name.trim().toUpperCase(),
          instagram: igHandle,
          email: p.email ? p.email.trim() : undefined,
          phone: p.phone ? p.phone.trim() : undefined,
          department: p.department ? p.department.trim() : undefined,
          customData,
          createdAt: new Date().toISOString(),
        };
      });

    const combined = [...existing, ...toAdd];
    fs.writeFileSync(PARTICIPANTS_FILE, JSON.stringify(combined, null, 2), 'utf-8');
    return combined.length;
  }

  /**
   * Get all draw records
   */
  static async getDrawRecords(): Promise<DrawRecord[]> {
    try {
      if (!fs.existsSync(DRAWS_FILE)) {
        return [];
      }
      const content = fs.readFileSync(DRAWS_FILE, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (error) {
      console.error('Error reading draw records:', error);
      return [];
    }
  }

  /**
   * Get the latest draw
   */
  static async getLatestDraw(): Promise<DrawRecord | null> {
    const draws = await this.getDrawRecords();
    if (draws.length === 0) return null;
    return draws[draws.length - 1];
  }

  /**
   * FAIRNESS ENGINE: Perform Cryptographically Secure Server-Side Draw
   */
  static async executeDraw(): Promise<DrawResult> {
    ensureDatabaseFiles();
    // 1. Fetch eligible participants
    const participants = await this.getParticipants();
    if (!participants || participants.length === 0) {
      throw new Error('No eligible participants found in the database. Please import participant data.');
    }

    // 2. Cryptographically secure random selection (CSPRNG)
    const totalCount = participants.length;
    const winnerIndex = crypto.randomInt(0, totalCount);
    const winner = participants[winnerIndex];

    // 3. Generate audit hash & record
    const drawId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const existingDraws = await this.getDrawRecords();
    const nextDrawNumber = existingDraws.length + 1;

    const auditPayload = `${drawId}:${winner.id}:${winner.name}:${totalCount}:${timestamp}:${nextDrawNumber}`;
    const auditHash = crypto.createHash('sha256').update(auditPayload).digest('hex');

    const record: DrawRecord = {
      id: drawId,
      drawNumber: nextDrawNumber,
      winnerId: winner.id,
      winnerName: winner.name,
      totalParticipants: totalCount,
      timestamp,
      auditHash,
      mode: 'LIVE',
    };

    // 4. Persist record immediately
    existingDraws.push(record);
    fs.writeFileSync(DRAWS_FILE, JSON.stringify(existingDraws, null, 2), 'utf-8');

    return {
      drawId,
      drawNumber: nextDrawNumber,
      winner,
      totalParticipants: totalCount,
      timestamp,
      auditHash,
      mode: 'LIVE',
    };
  }

  /**
   * Reset draws
   */
  static async resetDraws(): Promise<void> {
    ensureDatabaseFiles();
    fs.writeFileSync(DRAWS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}
