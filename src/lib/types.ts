export interface Participant {
  id: string;
  name: string;
  instagram?: string;
  email?: string;
  phone?: string;
  department?: string;
  customData?: Record<string, unknown>;
  createdAt?: string;
}

export interface DrawRecord {
  id: string;
  drawNumber: number;
  winnerId: string;
  winnerName: string;
  totalParticipants: number;
  timestamp: string;
  auditHash: string;
  mode: 'LIVE' | 'REHEARSAL';
  operatorNotes?: string;
}

export type DrawState =
  | 'INITIALIZING'
  | 'READY'
  | 'ARMING'
  | 'ARMED'
  | 'SELECTING'
  | 'SPINNING'
  | 'REVEALING'
  | 'WINNER_REVEALED'
  | 'COMPLETED_LOCKED'
  | 'ERROR';

export interface DrawResult {
  drawId: string;
  drawNumber: number;
  winner: Participant;
  totalParticipants: number;
  timestamp: string;
  auditHash: string;
  mode: 'LIVE' | 'REHEARSAL';
}

export interface MachineStats {
  participantCount: number;
  hasActiveDraw: boolean;
  latestDraw: DrawRecord | null;
  mode: 'LIVE' | 'REHEARSAL';
}
