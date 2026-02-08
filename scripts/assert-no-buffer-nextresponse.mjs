import { readFileSync } from 'node:fs';

const target = 'app/api/report/generate/route.ts';
const source = readFileSync(target, 'utf8');

const forbiddenPatterns = [
  /new\s+NextResponse\s*\(\s*buffer\b/m,
  /const\s+buffer\s*=\s*await\s+buildWorkbookBuffer\(/m,
  /buildWorkbookBuffer\(/m
];

const violations = forbiddenPatterns
  .map((pattern) => ({ pattern, matched: pattern.test(source) }))
  .filter((item) => item.matched);

if (violations.length > 0) {
  console.error('Found forbidden Buffer-based response usage in', target);
  process.exit(1);
}

console.log('No Buffer-based NextResponse patterns found in', target);
