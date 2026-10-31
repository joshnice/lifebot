import assert from 'node:assert/strict';
import { test } from 'node:test';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { LifebotStack } from '../lib/lifebot-stack';

function template(): Template {
  return Template.fromStack(new LifebotStack(new App(), 'TestStack'));
}

test('creates one instance with only caller-restricted SSH ingress', () => {
  const result = template();
  result.resourceCountIs('AWS::Lightsail::Instance', 1);
  const instance = Object.values(result.findResources('AWS::Lightsail::Instance'))[0];
  assert.deepEqual(instance.Properties.Networking.Ports, [{
    FromPort: 22,
    ToPort: 22,
    Protocol: 'tcp',
    AccessDirection: 'inbound',
    AccessType: 'Public',
    Cidrs: [{ Ref: 'SshAllowedCidr' }],
    Ipv6Cidrs: [],
  }]);
  assert.equal(result.toJSON().Parameters.SshAllowedCidr.Default, undefined);
});

test('supports regional default and explicitly supplied Lightsail keys', () => {
  const result = template();
  result.hasResourceProperties('AWS::Lightsail::Instance', {
    KeyPairName: {
      'Fn::If': ['HasKeyPair', { Ref: 'KeyPairName' }, { Ref: 'AWS::NoValue' }],
    },
  });
  assert.deepEqual(result.toJSON().Conditions.HasKeyPair, {
    'Fn::Not': [{ 'Fn::Equals': [{ Ref: 'KeyPairName' }, 'default'] }],
  });
});

test('validates SSH CIDR input and exports connection details', () => {
  const result = template();
  const pattern = new RegExp(`^(?:${result.toJSON().Parameters.SshAllowedCidr.AllowedPattern})$`);
  for (const valid of ['203.0.113.10/32', '10.0.0.0/24']) {
    assert.ok(pattern.test(valid));
  }
  for (const invalid of ['', '256.1.2.3/32', '1.2.3.4/33', '::/0']) {
    assert.ok(!pattern.test(invalid));
  }
  result.hasOutput('PublicIpAddress', {});
  result.hasOutput('SshUser', {});
});
