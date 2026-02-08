import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import { extractAttFromText } from '@/lib/att';
import { parseMonth } from '@/lib/split';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const month = String(formData.get('month') ?? '');
    parseMonth(month);

    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'PDF file is required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfData = await pdfParse(Buffer.from(arrayBuffer));
    const extracted = await extractAttFromText(pdfData.text, month);

    return NextResponse.json(extracted);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
