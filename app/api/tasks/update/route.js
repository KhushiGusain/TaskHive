import { NextResponse } from 'next/server';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const db = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function PUT(req) {
  try {
    const { taskId, status } = await req.json();

    const updateCommand = new UpdateItemCommand({
      TableName: 'Tasks',
      Key: {
        taskId: { S: taskId }
      },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': { S: status }
      },
      ReturnValues: 'ALL_NEW'
    });

    const result = await db.send(updateCommand);
    return NextResponse.json({ success: true, task: result.Attributes });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
} 