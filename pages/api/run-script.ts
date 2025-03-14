// pages/api/run-script.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

type ResponseData = {
  success: boolean;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { s3_key, output_destination, output_config, execution_id } = req.body;

    if (!s3_key) {
      return res.status(400).json({ success: false, error: 'Missing s3_key parameter' });
    }

    // Configure the SQS client
    const sqs = new SQSClient({ 
      region: 'eu-central-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    // Create the message payload
    const messageBody = JSON.stringify({
      s3_key,
      output_destination: output_destination || 'websocket',
      output_config: output_config || {},
      execution_id: execution_id
    });

    // Send the message to SQS
    const command = new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: messageBody,
    });

    const response = await sqs.send(command);

    return res.status(200).json({
      success: true,
      message: `Script execution started with ID: ${response.MessageId}`,
    });
  } catch (error: any) {
    console.error('Error starting script execution:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An unknown error occurred',
    });
  }
}