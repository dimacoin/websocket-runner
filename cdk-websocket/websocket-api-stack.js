"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketApiStack = void 0;
// cdk-websocket/websocket-api-stack.ts
const cdk = require("aws-cdk-lib");
const apigateway = require("aws-cdk-lib/aws-apigatewayv2");
const iam = require("aws-cdk-lib/aws-iam");
const lambda = require("aws-cdk-lib/aws-lambda");
const logs = require("aws-cdk-lib/aws-logs");
class WebSocketApiStack extends cdk.Stack {
    constructor(scope, id, props) {
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
exports.WebSocketApiStack = WebSocketApiStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic29ja2V0LWFwaS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndlYnNvY2tldC1hcGktc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQXVDO0FBQ3ZDLG1DQUFtQztBQUVuQywyREFBMkQ7QUFDM0QsMkNBQTJDO0FBQzNDLGlEQUFpRDtBQUNqRCw2Q0FBNkM7QUFFN0MsTUFBYSxpQkFBa0IsU0FBUSxHQUFHLENBQUMsS0FBSztJQUM5QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLDJCQUEyQjtRQUMzQixNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLDBCQUEwQixFQUFFO1lBQ2xFLElBQUksRUFBRSwwQkFBMEI7WUFDaEMsWUFBWSxFQUFFLFdBQVc7WUFDekIsd0JBQXdCLEVBQUUsc0JBQXNCO1NBQ2pELENBQUMsQ0FBQztRQUVILHNEQUFzRDtRQUN0RCxNQUFNLGlCQUFpQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDdkUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsZUFBZTtZQUN4QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Ozs7Ozs7T0FPNUIsQ0FBQztZQUNGLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVE7U0FDMUMsQ0FBQyxDQUFDO1FBRUgsc0NBQXNDO1FBQ3RDLE1BQU0sWUFBWSxHQUFHLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ2pFLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRztZQUNkLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLGlCQUFpQixF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QUM7Q0FDRjtBQXhGRCw4Q0F3RkMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjZGstd2Vic29ja2V0L3dlYnNvY2tldC1hcGktc3RhY2sudHNcclxuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XHJcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXl2Mic7XHJcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcclxuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xyXG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBXZWJTb2NrZXRBcGlTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBXZWJTb2NrZXQgQVBJXHJcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5DZm5BcGkodGhpcywgJ1NjcmlwdFJ1bm5lcldlYlNvY2tldEFwaScsIHtcclxuICAgICAgbmFtZTogJ1NjcmlwdFJ1bm5lcldlYlNvY2tldEFwaScsXHJcbiAgICAgIHByb3RvY29sVHlwZTogJ1dFQlNPQ0tFVCcsXHJcbiAgICAgIHJvdXRlU2VsZWN0aW9uRXhwcmVzc2lvbjogJyRyZXF1ZXN0LmJvZHkuYWN0aW9uJyxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgTGFtYmRhIGZ1bmN0aW9uIGZvciBoYW5kbGluZyBjb25uZWN0aW9uc1xyXG4gICAgY29uc3QgY29ubmVjdGlvbkhhbmRsZXIgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdDb25uZWN0aW9uSGFuZGxlcicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUlubGluZShgXHJcbiAgICAgICAgZXhwb3J0cy5oYW5kbGVyID0gYXN5bmMgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBjb25uZWN0aW9uSWQgPSBldmVudC5yZXF1ZXN0Q29udGV4dC5jb25uZWN0aW9uSWQ7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnQ2xpZW50IGNvbm5lY3RlZDonLCBjb25uZWN0aW9uSWQpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICByZXR1cm4geyBzdGF0dXNDb2RlOiAyMDAsIGJvZHk6ICdDb25uZWN0ZWQnIH07XHJcbiAgICAgICAgfTtcclxuICAgICAgYCksXHJcbiAgICAgIGxvZ1JldGVudGlvbjogbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9XRUVLLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHJvdXRlcyBmb3IgdGhlIFdlYlNvY2tldCBBUElcclxuICAgIGNvbnN0IGNvbm5lY3RSb3V0ZSA9IG5ldyBhcGlnYXRld2F5LkNmblJvdXRlKHRoaXMsICdDb25uZWN0Um91dGUnLCB7XHJcbiAgICAgIGFwaUlkOiBhcGkucmVmLFxyXG4gICAgICByb3V0ZUtleTogJyRjb25uZWN0JyxcclxuICAgICAgYXV0aG9yaXphdGlvblR5cGU6ICdOT05FJyxcclxuICAgICAgdGFyZ2V0OiAnaW50ZWdyYXRpb25zLycgKyBuZXcgYXBpZ2F0ZXdheS5DZm5JbnRlZ3JhdGlvbih0aGlzLCAnQ29ubmVjdEludGVncmF0aW9uJywge1xyXG4gICAgICAgIGFwaUlkOiBhcGkucmVmLFxyXG4gICAgICAgIGludGVncmF0aW9uVHlwZTogJ0FXU19QUk9YWScsXHJcbiAgICAgICAgaW50ZWdyYXRpb25Vcmk6IGBhcm46YXdzOmFwaWdhdGV3YXk6JHt0aGlzLnJlZ2lvbn06bGFtYmRhOnBhdGgvMjAxNS0wMy0zMS9mdW5jdGlvbnMvJHtjb25uZWN0aW9uSGFuZGxlci5mdW5jdGlvbkFybn0vaW52b2NhdGlvbnNgLFxyXG4gICAgICB9KS5yZWYsXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBkaXNjb25uZWN0Um91dGUgPSBuZXcgYXBpZ2F0ZXdheS5DZm5Sb3V0ZSh0aGlzLCAnRGlzY29ubmVjdFJvdXRlJywge1xyXG4gICAgICBhcGlJZDogYXBpLnJlZixcclxuICAgICAgcm91dGVLZXk6ICckZGlzY29ubmVjdCcsXHJcbiAgICAgIGF1dGhvcml6YXRpb25UeXBlOiAnTk9ORScsXHJcbiAgICAgIHRhcmdldDogJ2ludGVncmF0aW9ucy8nICsgbmV3IGFwaWdhdGV3YXkuQ2ZuSW50ZWdyYXRpb24odGhpcywgJ0Rpc2Nvbm5lY3RJbnRlZ3JhdGlvbicsIHtcclxuICAgICAgICBhcGlJZDogYXBpLnJlZixcclxuICAgICAgICBpbnRlZ3JhdGlvblR5cGU6ICdBV1NfUFJPWFknLFxyXG4gICAgICAgIGludGVncmF0aW9uVXJpOiBgYXJuOmF3czphcGlnYXRld2F5OiR7dGhpcy5yZWdpb259OmxhbWJkYTpwYXRoLzIwMTUtMDMtMzEvZnVuY3Rpb25zLyR7Y29ubmVjdGlvbkhhbmRsZXIuZnVuY3Rpb25Bcm59L2ludm9jYXRpb25zYCxcclxuICAgICAgfSkucmVmLFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgZGVmYXVsdFJvdXRlID0gbmV3IGFwaWdhdGV3YXkuQ2ZuUm91dGUodGhpcywgJ0RlZmF1bHRSb3V0ZScsIHtcclxuICAgICAgYXBpSWQ6IGFwaS5yZWYsXHJcbiAgICAgIHJvdXRlS2V5OiAnJGRlZmF1bHQnLFxyXG4gICAgICBhdXRob3JpemF0aW9uVHlwZTogJ05PTkUnLFxyXG4gICAgICB0YXJnZXQ6ICdpbnRlZ3JhdGlvbnMvJyArIG5ldyBhcGlnYXRld2F5LkNmbkludGVncmF0aW9uKHRoaXMsICdEZWZhdWx0SW50ZWdyYXRpb24nLCB7XHJcbiAgICAgICAgYXBpSWQ6IGFwaS5yZWYsXHJcbiAgICAgICAgaW50ZWdyYXRpb25UeXBlOiAnQVdTX1BST1hZJyxcclxuICAgICAgICBpbnRlZ3JhdGlvblVyaTogYGFybjphd3M6YXBpZ2F0ZXdheToke3RoaXMucmVnaW9ufTpsYW1iZGE6cGF0aC8yMDE1LTAzLTMxL2Z1bmN0aW9ucy8ke2Nvbm5lY3Rpb25IYW5kbGVyLmZ1bmN0aW9uQXJufS9pbnZvY2F0aW9uc2AsXHJcbiAgICAgIH0pLnJlZixcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdyYW50IHBlcm1pc3Npb25zIGZvciB0aGUgV2ViU29ja2V0IEFQSSB0byBpbnZva2UgdGhlIExhbWJkYVxyXG4gICAgY29ubmVjdGlvbkhhbmRsZXIuYWRkUGVybWlzc2lvbignSW52b2tlQnlXZWJTb2NrZXQnLCB7XHJcbiAgICAgIHByaW5jaXBhbDogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdhcGlnYXRld2F5LmFtYXpvbmF3cy5jb20nKSxcclxuICAgICAgc291cmNlQXJuOiBgYXJuOmF3czpleGVjdXRlLWFwaToke3RoaXMucmVnaW9ufToke3RoaXMuYWNjb3VudH06JHthcGkucmVmfS8qYCxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIGRlcGxveW1lbnQgYW5kIHN0YWdlXHJcbiAgICBjb25zdCBkZXBsb3ltZW50ID0gbmV3IGFwaWdhdGV3YXkuQ2ZuRGVwbG95bWVudCh0aGlzLCAnRGVwbG95bWVudCcsIHtcclxuICAgICAgYXBpSWQ6IGFwaS5yZWYsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYWtlIHN1cmUgZGVwbG95bWVudCBoYXBwZW5zIGFmdGVyIHJvdXRlcyBhcmUgY3JlYXRlZFxyXG4gICAgZGVwbG95bWVudC5hZGREZXBlbmRlbmN5KGNvbm5lY3RSb3V0ZSk7XHJcbiAgICBkZXBsb3ltZW50LmFkZERlcGVuZGVuY3koZGlzY29ubmVjdFJvdXRlKTtcclxuICAgIGRlcGxveW1lbnQuYWRkRGVwZW5kZW5jeShkZWZhdWx0Um91dGUpO1xyXG5cclxuICAgIGNvbnN0IHN0YWdlID0gbmV3IGFwaWdhdGV3YXkuQ2ZuU3RhZ2UodGhpcywgJ1N0YWdlJywge1xyXG4gICAgICBhcGlJZDogYXBpLnJlZixcclxuICAgICAgYXV0b0RlcGxveTogdHJ1ZSxcclxuICAgICAgZGVwbG95bWVudElkOiBkZXBsb3ltZW50LnJlZixcclxuICAgICAgc3RhZ2VOYW1lOiAncHJvZCcsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBPdXRwdXQgdGhlIFdlYlNvY2tldCBVUkxcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdXZWJTb2NrZXRVUkwnLCB7XHJcbiAgICAgIHZhbHVlOiBgd3NzOi8vJHthcGkucmVmfS5leGVjdXRlLWFwaS4ke3RoaXMucmVnaW9ufS5hbWF6b25hd3MuY29tLyR7c3RhZ2Uuc3RhZ2VOYW1lfWAsXHJcbiAgICB9KTtcclxuICB9XHJcbn0iXX0=