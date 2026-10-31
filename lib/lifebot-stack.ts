import {
  Aws,
  CfnCondition,
  CfnOutput,
  CfnParameter,
  Fn,
  Stack,
  StackProps,
  aws_lightsail as lightsail,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class LifebotStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const instanceName = new CfnParameter(this, 'InstanceName', {
      type: 'String',
      default: 'lifebot',
      minLength: 2,
      maxLength: 254,
      allowedPattern: '[a-zA-Z0-9][a-zA-Z0-9_.-]*[a-zA-Z0-9]',
      description: 'Unique Lightsail instance name within the deployment region.',
    });
    const blueprintId = new CfnParameter(this, 'BlueprintId', {
      type: 'String',
      default: 'ubuntu_24_04',
      minLength: 1,
      description: 'Linux blueprint ID available in the target Lightsail region.',
    });
    const bundleId = new CfnParameter(this, 'BundleId', {
      type: 'String',
      default: 'small_3_1',
      minLength: 1,
      description: 'Lightsail bundle ID; verify availability and pricing before deployment.',
    });
    const octet = '(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])';
    const sshAllowedCidr = new CfnParameter(this, 'SshAllowedCidr', {
      type: 'String',
      allowedPattern: `${octet}(\\.${octet}){3}/([0-9]|[12][0-9]|3[0-2])`,
      constraintDescription: 'Enter an IPv4 CIDR, for example 203.0.113.10/32.',
      description: 'IPv4 CIDR permitted to connect over SSH; use your public IP with /32.',
    });
    const keyPairName = new CfnParameter(this, 'KeyPairName', {
      type: 'String',
      default: 'default',
      description: 'Existing Lightsail key pair in this region; default selects the regional default.',
    });
    const hasKeyPair = new CfnCondition(this, 'HasKeyPair', {
      expression: Fn.conditionNot(Fn.conditionEquals(keyPairName.valueAsString, 'default')),
    });

    const instance = new lightsail.CfnInstance(this, 'Instance', {
      instanceName: instanceName.valueAsString,
      blueprintId: blueprintId.valueAsString,
      bundleId: bundleId.valueAsString,
      keyPairName: Fn.conditionIf(
        hasKeyPair.logicalId,
        keyPairName.valueAsString,
        Aws.NO_VALUE,
      ).toString(),
      networking: {
        ports: [{
          fromPort: 22,
          toPort: 22,
          protocol: 'tcp',
          accessDirection: 'inbound',
          accessType: 'Public',
          cidrs: [sshAllowedCidr.valueAsString],
          ipv6Cidrs: [],
        }],
      },
      tags: [{ key: 'Project', value: 'lifebot' }],
    });

    new CfnOutput(this, 'InstanceNameOutput', { value: instanceName.valueAsString });
    new CfnOutput(this, 'PublicIpAddress', { value: instance.attrPublicIpAddress });
    new CfnOutput(this, 'SshUser', { value: instance.attrUserName });
    new CfnOutput(this, 'InstanceArn', { value: instance.attrInstanceArn });
  }
}
