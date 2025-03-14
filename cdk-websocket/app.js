"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// cdk-websocket/app.ts
const cdk = require("aws-cdk-lib");
const websocket_api_stack_1 = require("./websocket-api-stack");
const app = new cdk.App();
new websocket_api_stack_1.WebSocketApiStack(app, 'ScriptRunnerWebSocketStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'eu-central-1'
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUJBQXVCO0FBQ3ZCLG1DQUFtQztBQUNuQywrREFBMEQ7QUFFMUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUIsSUFBSSx1Q0FBaUIsQ0FBQyxHQUFHLEVBQUUsNEJBQTRCLEVBQUU7SUFDdkQsR0FBRyxFQUFFO1FBQ0gsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CO1FBQ3hDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixJQUFJLGNBQWM7S0FDekQ7Q0FDRixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjZGstd2Vic29ja2V0L2FwcC50c1xyXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgeyBXZWJTb2NrZXRBcGlTdGFjayB9IGZyb20gJy4vd2Vic29ja2V0LWFwaS1zdGFjayc7XHJcblxyXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xyXG5uZXcgV2ViU29ja2V0QXBpU3RhY2soYXBwLCAnU2NyaXB0UnVubmVyV2ViU29ja2V0U3RhY2snLCB7XHJcbiAgZW52OiB7IFxyXG4gICAgYWNjb3VudDogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfQUNDT1VOVCwgXHJcbiAgICByZWdpb246IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX1JFR0lPTiB8fCAnZXUtY2VudHJhbC0xJyBcclxuICB9LFxyXG59KTsiXX0=