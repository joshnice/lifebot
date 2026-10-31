import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cdkArguments } from '../scripts/cdk.mjs';

const env = { SSH_ALLOWED_CIDR: '203.0.113.10/32' };

test('passes environment CIDR to deployment and preview', () => {
  for (const command of ['deploy', 'diff']) {
    assert.deepEqual(cdkArguments([command], env), [
      command, '--parameters', 'LifebotStack:SshAllowedCidr=203.0.113.10/32',
    ]);
  }
});

test('preserves explicit parameter overrides', () => {
  for (const parameter of [
    ['--parameters', 'SshAllowedCidr=192.0.2.1/32'],
    ['--parameters=LifebotStack:SshAllowedCidr=192.0.2.1/32'],
  ]) {
    const args = ['deploy', ...parameter];
    assert.deepEqual(cdkArguments(args, env), args);
  }
});

test('leaves bootstrap, synthesis, and missing environment values unchanged', () => {
  for (const command of ['bootstrap', 'synth']) {
    assert.deepEqual(cdkArguments([command], env), [command]);
  }
  assert.deepEqual(cdkArguments(['deploy'], {}), ['deploy']);
});
