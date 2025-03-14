// cdk-websocket/app.ts
import * as cdk from 'aws-cdk-lib';
import { WebSocketApiStack } from './websocket-api-stack';

const app = new cdk.App();
new WebSocketApiStack(app, 'ScriptRunnerWebSocketStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'eu-central-1' 
  },
});