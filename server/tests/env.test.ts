import assert from 'node:assert/strict';
import { test } from 'node:test';

import { warnOnMissingProductionEnv } from '../src/config/env';

function captureConsoleLog(fn: () => void): string[] {
  const original = console.log;
  const lines: string[] = [];
  console.log = (...args: unknown[]) => {
    lines.push(args.map(String).join(' '));
  };
  try {
    fn();
  } finally {
    console.log = original;
  }
  return lines;
}

test('warnOnMissingProductionEnv logs a single redacted JSON line naming missing vars, never their values', () => {
  const lines = captureConsoleLog(() => {
    warnOnMissingProductionEnv();
  });
  assert.equal(lines.length, 1);
  const parsed = JSON.parse(lines[0]);
  assert.equal(parsed.event, 'env_check');
  assert.ok(parsed.status === 'ok' || parsed.status === 'incomplete');
  if (parsed.status === 'incomplete') {
    assert.ok(Array.isArray(parsed.missing));
    // Every entry should be a var name (or "Graph (partially set): ..."), never contain
    // anything that looks like a real secret value (a Graph client secret, HIOBuy key, etc).
    const serialized = JSON.stringify(parsed.missing);
    assert.ok(!/hio_(test|live)_/.test(serialized));
  }
});
