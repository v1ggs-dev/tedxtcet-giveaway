import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const participants = await DatabaseService.getParticipants();
    const latestDraw = await DatabaseService.getLatestDraw();
    const draws = await DatabaseService.getDrawRecords();

    return NextResponse.json({
      count: participants.length,
      participants: participants.slice(0, 100),
      totalCount: participants.length,
      totalDraws: draws.length,
      latestDraw,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch participants';
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
