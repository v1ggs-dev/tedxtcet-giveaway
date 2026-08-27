import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await DatabaseService.resetDraws();

    return NextResponse.json({
      success: true,
      message: 'Draw records reset successfully.',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to reset draw records.';
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
