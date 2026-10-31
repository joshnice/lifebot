import { App } from 'aws-cdk-lib';
import { LifebotStack } from '../lib/lifebot-stack';

const app = new App();

new LifebotStack(app, 'LifebotStack', {
  description: 'Lightsail infrastructure for the Lifebot Hermes agent',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-south-1',
  },
});
