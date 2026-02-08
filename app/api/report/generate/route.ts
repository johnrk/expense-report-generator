import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ROSTER } from '@/lib/constants';
import { buildWorkbookBytes } from '@/lib/report';
import { parseMonth } from '@/lib/split';

const lineTotalsSchema = z.object({
  Errol: z.number(),
  Azira: z.number(),
  Mark: z.number(),
  John: z.number(),
  Zach: z.number(),
  Michelle: z.number()
});

const bodySchema = z.object({
  month: z.string(),
  att: z.object({
    shared_plan_total: z.number(),
    line_totals: lineTotalsSchema
  }),
  recurring: z.object({
    fiber: z.number(),
    waterIndoor: z.number(),
    waterOutdoor: z.number(),
    electricity: z.number(),
    naturalGas: z.number(),
    netflix: z.number()
  })
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = bodySchema.parse(json);
    parseMonth(body.month);

    for (const person of ROSTER) {
      if (!(person in body.att.line_totals)) {
        return NextResponse.json({ error: `Missing line total for ${person}` }, { status: 400 });
      }
    }

    const bytes = await buildWorkbookBytes(body);

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="expense-report-${body.month}.xlsx"`
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
