# Expense Report Generator (v1)

Single-page Next.js app to parse AT&T bill data, combine manual recurring totals, and generate an `.xlsx` report.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `OPENAI_MOCK_MODE=true` for deterministic local/test parsing without network calls.

## API

- `POST /api/att/parse` (multipart with `month`, `file`)
- `POST /api/report/generate` (json body with month/att/recurring)
