// cdk-websocket/websocket-api-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';

export class WebSocketApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the WebSocket API
    const api = new apigateway.CfnApi(this, 'ScriptRunnerWebSocketApi', {
      name: 'ScriptRunnerWebSocketApi',
      protocolType: 'WEBSOCKET',
      routeSelectionExpression: '$request.body.action',
    });

    // Create the Lambda function for handling connections
    const connectionHandler = new lambda.Function(this, 'ConnectionHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          const connectionId = event.requestContext.connectionId;
          console.log('Client connected:', connectionId);
          
          return { statusCode: 200, body: 'Connected' };
        };
      `),
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Create routes for the WebSocket API
    const connectRoute = new apigateway.CfnRoute(this, 'ConnectRoute', {
      apiId: api.ref,
      routeKey: '$connect',
      authorizationType: 'NONE',
      target: 'integrations/' + new apigateway.CfnIntegration(this, 'ConnectIntegration', {
        apiId: api.ref,
        integrationType: 'AWS_PROXY',
        integrationUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${connectionHandler.functionArn}/invocations`,
      }).ref,
    });

    const disconnectRoute = new apigateway.CfnRoute(this, 'DisconnectRoute', {
      apiId: api.ref,
      routeKey: '$disconnect',
      authorizationType: 'NONE',
      target: 'integrations/' + new apigateway.CfnIntegration(this, 'DisconnectIntegration', {
        apiId: api.ref,
        integrationType: 'AWS_PROXY',
        integrationUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${connectionHandler.functionArn}/invocations`,
      }).ref,
    });

    const defaultRoute = new apigateway.CfnRoute(this, 'DefaultRoute', {
      apiId: api.ref,
      routeKey: '$default',
      authorizationType: 'NONE',
      target: 'integrations/' + new apigateway.CfnIntegration(this, 'DefaultIntegration', {
        apiId: api.ref,
        integrationType: 'AWS_PROXY',
        integrationUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${connectionHandler.functionArn}/invocations`,
      }).ref,
    });

    // Grant permissions for the WebSocket API to invoke the Lambda
    connectionHandler.addPermission('InvokeByWebSocket', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:${api.ref}/*`,
    });

    // Create a deployment and stage
    const deployment = new apigateway.CfnDeployment(this, 'Deployment', {
      apiId: api.ref,
    });

    // Make sure deployment happens after routes are created
    deployment.addDependency(connectRoute);
    deployment.addDependency(disconnectRoute);
    deployment.addDependency(defaultRoute);

    const stage = new apigateway.CfnStage(this, 'Stage', {
      apiId: api.ref,
      autoDeploy: true,
      deploymentId: deployment.ref,
      stageName: 'prod',
    });

    // Output the WebSocket URL
    new cdk.CfnOutput(this, 'WebSocketURL', {
      value: `wss://${api.ref}.execute-api.${this.region}.amazonaws.com/${stage.stageName}`,
    });
  }
}