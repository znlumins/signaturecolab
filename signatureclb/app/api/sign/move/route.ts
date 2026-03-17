// app/api/sign/move/route.ts
import Pusher from 'pusher';
import { NextResponse } from 'next/server';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
  useTLS: true,
});

interface MoveRequest {
  id: string;
  x: number;
  y: number;
  roomId: string;
}

export async function POST(request: Request) {
  try {
    const body: MoveRequest = await request.json();

    // Validate required fields
    if (!body.id || typeof body.id !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid signature id' },
        { status: 400 }
      );
    }

    if (typeof body.x !== 'number' || typeof body.y !== 'number') {
      return NextResponse.json(
        { error: 'Invalid signature coordinates' },
        { status: 400 }
      );
    }

    if (!body.roomId || typeof body.roomId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid room id' },
        { status: 400 }
      );
    }

    // Check if Pusher is configured
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      console.warn('⚠️ Pusher keys not configured');
      return NextResponse.json(
        { message: 'Signature moved locally (Pusher not configured)' },
        { status: 200 }
      );
    }

    // Broadcast to room-specific channel
    const channelName = `room-${body.roomId}`;
    await pusher.trigger(channelName, 'signature-moved', {
      id: body.id,
      x: body.x,
      y: body.y,
    });

    return NextResponse.json(
      { success: true, message: 'Signature position updated' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in move endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
