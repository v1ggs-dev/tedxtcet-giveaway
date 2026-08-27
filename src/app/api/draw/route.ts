import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Execute cryptographically secure server-side draw
    const result = await DatabaseService.executeDraw();

    return NextResponse.json({
      success: true,
      draw: result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'An error occurred while executing the lucky draw.';
    console.error('API Draw execution error:', error);
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 400 }
    );
  }
}
