'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Person, ROSTER } from '@/lib/constants';

type AttData = {
  month: string;
  shared_plan_total: number;
  line_totals: Record<Person, number>;
};

const emptyLineTotals = Object.fromEntries(ROSTER.map((p) => [p, 0])) as Record<Person, number>;

export default function HomePage() {
  const [month, setMonth] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [recurring, setRecurring] = useState({
    fiber: 0,
    waterIndoor: 0,
    waterOutdoor: 0,
    electricity: 0,
    naturalGas: 0,
    netflix: 0
  });
  const [att, setAtt] = useState<AttData | null>(null);
  const [status, setStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const canParse = month.length > 0 && file;
  const canGenerate = Boolean(att && month);

  const recurringFields = useMemo(
    () => [
      { key: 'fiber', label: 'Fiber' },
      { key: 'waterIndoor', label: 'Water Indoor' },
      { key: 'waterOutdoor', label: 'Water Outdoor' },
      { key: 'electricity', label: 'Electricity' },
      { key: 'naturalGas', label: 'Natural Gas' },
      { key: 'netflix', label: 'Netflix' }
    ] as const,
    []
  );

  async function handleParse(event: FormEvent) {
    event.preventDefault();
    if (!canParse) return;

    const formData = new FormData();
    formData.set('month', month);
    formData.set('file', file);

    setStatus('Parsing AT&T PDF...');
    const response = await fetch('/api/att/parse', { method: 'POST', body: formData });
    const json = await response.json();

    if (!response.ok) {
      setStatus(`Parse failed: ${json.error ?? 'Unknown error'}`);
      return;
    }

    setAtt(json as AttData);
    setStatus('AT&T parsed. Review and edit any values below before generating report.');
  }

  async function handleGenerate() {
    if (!att) return;

    setStatus('Generating Excel report...');
    const response = await fetch('/api/report/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, att, recurring })
    });

    if (!response.ok) {
      const json = await response.json();
      setStatus(`Generate failed: ${json.error ?? 'Unknown error'}`);
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
    setStatus('Report generated successfully.');
  }

  return (
    <main>
      <h1>Family Expense Report (v1)</h1>

      <section>
        <label htmlFor="month">Month (YYYY-MM)</label>
        <input id="month" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="2026-01" required />

        <label htmlFor="att-pdf">Upload AT&T PDF</label>
        <input
          id="att-pdf"
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />

        <div className="grid">
          {recurringFields.map((field) => (
            <div key={field.key}>
              <label htmlFor={field.key}>{field.label}</label>
              <input
                id={field.key}
                type="number"
                step="0.01"
                min="0"
                value={recurring[field.key]}
                onChange={(e) =>
                  setRecurring((prev) => ({
                    ...prev,
                    [field.key]: Number(e.target.value)
                  }))
                }
              />
            </div>
          ))}
        </div>

        <button onClick={handleParse} disabled={!canParse}>Parse AT&T</button>
        <p className="status">{status}</p>
      </section>

      <section>
        <h2>AT&T Values (Editable)</h2>
        <label htmlFor="shared-plan">Shared plan total</label>
        <input
          id="shared-plan"
          type="number"
          step="0.01"
          min="0"
          value={att?.shared_plan_total ?? 0}
          onChange={(e) =>
            setAtt((prev) => ({
              month,
              shared_plan_total: Number(e.target.value),
              line_totals: prev?.line_totals ?? emptyLineTotals
            }))
          }
        />

        <table>
          <thead>
            <tr>
              <th>Person</th>
              <th>Line total</th>
            </tr>
          </thead>
          <tbody>
            {ROSTER.map((person) => (
              <tr key={person}>
                <td>{person}</td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={att?.line_totals[person] ?? 0}
                    onChange={(e) =>
                      setAtt((prev) => ({
                        month,
                        shared_plan_total: prev?.shared_plan_total ?? 0,
                        line_totals: {
                          ...(prev?.line_totals ?? emptyLineTotals),
                          [person]: Number(e.target.value)
                        }
                      }))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={handleGenerate} disabled={!canGenerate}>Generate Report (.xlsx)</button>
        {downloadUrl && (
          <p>
            <a href={downloadUrl} download={`expense-report-${month}.xlsx`}>
              Download report
            </a>
          </p>
        )}
      </section>
    </main>
  );
}
