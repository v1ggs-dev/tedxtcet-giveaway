import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const draws = await DatabaseService.getDrawRecords();
    return NextResponse.json({ draws });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch draw logs';
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
