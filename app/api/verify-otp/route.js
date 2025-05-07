import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand
} from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const db = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  const body = await req.json();
  const { email, otp } = body;
  const jwtSecret = process.env.JWT_SECRET;

  const isProd = process.env.NODE_ENV === 'production';

  // ✅ Demo login logic
  if (email === "khushii@gmail.com" && otp === "123456") {
    const userId = "123456";

    // Optional: insert user into Users table if not already there
    const checkDemoUser = await db.send(new GetItemCommand({
      TableName: 'Users',
      Key: { email: { S: email } }
    }));

    if (!checkDemoUser.Item) {
      await db.send(new PutItemCommand({
        TableName: 'Users',
        Item: {
          email: { S: email },
          userId: { S: userId },
          createdAt: { S: new Date().toISOString() },
        }
      }));
    }

    // Generate JWT token
    const token = jwt.sign({ email, userId }, jwtSecret, { expiresIn: '1h' });

    const response = NextResponse.json({
      success: true,
      message: "Demo login successful"
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'Lax',
      path: '/',
      maxAge: 3600,
    });

    return response;
  }

  try {
    // ✅ Normal OTP validation flow
    const result = await db.send(
      new GetItemCommand({
        TableName: 'TaskHiveOTPs',
        Key: { email: { S: email } },
      })
    );

    const storedOtp = result.Item?.otp?.S;
    const expiresAt = parseInt(result.Item?.expiresAt?.S || '0');

    if (!storedOtp || storedOtp !== otp.toString()) {
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }

    if (Date.now() / 1000 > expiresAt) {
      return NextResponse.json({ success: false, message: 'OTP expired' }, { status: 400 });
    }

    // Delete OTP after successful verification
    await db.send(
      new DeleteItemCommand({
        TableName: 'TaskHiveOTPs',
        Key: { email: { S: email } },
      })
    );

    // Check if user exists in Users table
    const existingUser = await db.send(
      new GetItemCommand({
        TableName: 'Users',
        Key: { email: { S: email } },
      })
    );

    let userId;

    // Create new user if not exists
    if (!existingUser.Item) {
      userId = `user_${uuidv4()}`;

      await db.send(
        new PutItemCommand({
          TableName: 'Users',
          Item: {
            email: { S: email },
            userId: { S: userId },
            createdAt: { S: new Date().toISOString() },
          },
        })
      );
    } else {
      userId = existingUser.Item.userId.S;
    }

    // Generate JWT token
    const token = jwt.sign({ email, userId }, jwtSecret, { expiresIn: '1h' });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful'
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'Lax',
      path: '/',
      maxAge: 3600,
    });

    return response;
  } catch (err) {
    console.error('Error during OTP verification:', err);
    return NextResponse.json(
      { success: false, message: 'Login failed, try again!' },
      { status: 500 }
    );
  }
}
