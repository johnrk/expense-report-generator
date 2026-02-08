import { Person, ROSTER } from './constants';

export type AttExtraction = {
  month: string;
  shared_plan_total: number;
  line_totals: Record<Person, number>;
};

function validate(data: unknown, month: string): AttExtraction {
  if (!data || typeof data !== 'object') {
    throw new Error('Extractor returned invalid payload');
  }
  const record = data as Record<string, unknown>;
  const sharedPlan = Number(record.shared_plan_total);
  const lineTotals = record.line_totals as Record<string, unknown>;
  if (!Number.isFinite(sharedPlan) || !lineTotals || typeof lineTotals !== 'object') {
    throw new Error('Missing totals in extracted result');
  }
  const normalizedLineTotals = {} as Record<Person, number>;
  for (const person of ROSTER) {
    const value = Number(lineTotals[person]);
    if (!Number.isFinite(value)) {
      throw new Error(`Missing line total for ${person}`);
    }
    normalizedLineTotals[person] = Number(value.toFixed(2));
  }

  return {
    month,
    shared_plan_total: Number(sharedPlan.toFixed(2)),
    line_totals: normalizedLineTotals
  };
}

function mockExtract(month: string): AttExtraction {
  return {
    month,
    shared_plan_total: 120,
    line_totals: {
      Errol: 40,
      Azira: 40,
      Mark: 30,
      John: 30,
      Zach: 35,
      Michelle: 25
    }
  };
}

export async function extractAttFromText(text: string, month: string): Promise<AttExtraction> {
  if (process.env.OPENAI_MOCK_MODE === 'true') {
    return mockExtract(month);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required unless OPENAI_MOCK_MODE=true');
  }

  const model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Extract AT&T bill values into JSON. Return keys shared_plan_total and line_totals with exact people: Errol, Azira, Mark, John, Zach, Michelle. Use numbers only.'
        },
        {
          role: 'user',
          content: `Month: ${month}\n\nBill text:\n${text.slice(0, 20000)}`
        }
      ]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI response did not include content');
  }

  const parsed = JSON.parse(content) as unknown;
  return validate(parsed, month);
}
