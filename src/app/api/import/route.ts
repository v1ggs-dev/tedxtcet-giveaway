import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { DatabaseService } from '@/lib/db';
import { Participant } from '@/lib/types';
import { parseInstagramHandle } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let participantsToAdd: Participant[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

      if (!rawRows || rawRows.length === 0) {
        return NextResponse.json({ error: 'Uploaded sheet contains no data rows.' }, { status: 400 });
      }

      // Map rows intelligently (handles First Name + Last Name or Full Name)
      participantsToAdd = rawRows
        .map((row, idx) => {
          const keys = Object.keys(row);
          
          // Check for separate First Name and Last Name columns
          const firstNameKey = keys.find((k) => /first\s*name|fname/i.test(k));
          const lastNameKey = keys.find((k) => /last\s*name|lname|surname/i.test(k));

          let fullName = '';

          if (firstNameKey && row[firstNameKey]) {
            const first = String(row[firstNameKey]).trim();
            const last = lastNameKey && row[lastNameKey] ? String(row[lastNameKey]).trim() : '';
            fullName = `${first} ${last}`.trim();
          } else {
            // Find generic name column
            const nameKey = keys.find(
              (k) => /full\s*name|name|attendee|participant/i.test(k)
            ) || keys[0];

            if (row[nameKey]) {
              fullName = String(row[nameKey]).trim();
            }
          }

          if (!fullName || fullName.length === 0) {
            return null;
          }

          const emailKey = keys.find((k) => /email|mail/i.test(k));
          const phoneKey = keys.find((k) => /phone|contact|mobile|number/i.test(k));
          const deptKey = keys.find((k) => /dept|department|branch|org|class/i.test(k));
          const igKey = keys.find((k) => /instagram|ig\s*handle|ig\s*id|ig|handle|username|insta/i.test(k));

          const igHandle = igKey ? parseInstagramHandle(row[igKey]) : undefined;

          return {
            id: `P-${(idx + 1).toString().padStart(4, '0')}`,
            name: fullName.toUpperCase(),
            instagram: igHandle,
            email: emailKey && row[emailKey] ? String(row[emailKey]).trim() : undefined,
            phone: phoneKey && row[phoneKey] ? String(row[phoneKey]).trim() : undefined,
            department: deptKey && row[deptKey] ? String(row[deptKey]).trim() : undefined,
            customData: row,
          };
        })
        .filter(Boolean) as Participant[];
    } else {
      const body = await req.json();
      if (Array.isArray(body.participants)) {
        participantsToAdd = body.participants;
      }
    }

    if (participantsToAdd.length === 0) {
      return NextResponse.json(
        { error: 'No valid participants could be parsed from the input.' },
        { status: 400 }
      );
    }

    const totalSaved = await DatabaseService.saveParticipants(participantsToAdd);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${totalSaved} participants.`,
      count: totalSaved,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to process participant import.';
    console.error('Import error:', error);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
