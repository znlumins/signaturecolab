// app/api/sign/route.ts
import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
  useTLS: true,
});

interface SignatureData {
  x: number;
  y: number;
  image: string;
  id: string;
  timestamp: string;
  userId?: string;
  penColor?: string;
  penSize?: number;
  roomId?: string;
}

// Store signatures in memory organized by room (in production, use database)
const signatureStore: Map<string, SignatureData[]> = new Map();

export async function POST(req: Request) {
  try {
    let data: SignatureData;
    
    try {
      data = await req.json();
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: String(parseError) },
        { status: 400 }
      );
    }

    // Validate roomId
    if (!data.roomId || typeof data.roomId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid room ID' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (data.x === undefined || typeof data.x !== 'number') {
      return NextResponse.json(
        { error: 'Invalid x coordinate' },
        { status: 400 }
      );
    }

    if (data.y === undefined || typeof data.y !== 'number') {
      return NextResponse.json(
        { error: 'Invalid y coordinate' },
        { status: 400 }
      );
    }

    if (!data.image || typeof data.image !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid signature image' },
        { status: 400 }
      );
    }

    if (!data.id || typeof data.id !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid signature ID' },
        { status: 400 }
      );
    }

    // Validate image is actually base64
    if (!data.image.startsWith('data:')) {
      return NextResponse.json(
        { error: 'Invalid image format. Must be base64 data URL' },
        { status: 400 }
      );
    }

    // Store signature in room-specific store
    if (!signatureStore.has(data.roomId)) {
      signatureStore.set(data.roomId, []);
    }
    signatureStore.get(data.roomId)!.push(data);

    // Check if Pusher is configured
    if (process.env.NEXT_PUBLIC_PUSHER_KEY) {
      try {
        // Broadcast to room-specific channel
        const channelName = `room-${data.roomId}`;
        
        await pusher.trigger(channelName, 'new-signature', data);

        // Emit online user indicator
        await pusher.trigger(channelName, 'user-online', {
          userId: data.userId || 'Anonymous',
          timestamp: data.timestamp
        });
      } catch (pusherError) {
        console.warn('Pusher trigger failed:', pusherError);
        // Don't fail the request if Pusher fails - signature is already stored locally
      }
    }

    return NextResponse.json({ 
      success: true,
      signatureId: data.id,
      roomId: data.roomId,
      totalSignaturesInRoom: signatureStore.get(data.roomId)?.length || 0
    });
  } catch (error) {
    console.error('Signature API Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process signature', details: String(error) },
      { status: 500 }
    );
  }
}

// Get signatures for a specific room (optional endpoint for history)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const roomId = url.searchParams.get('roomId');
  
  if (!roomId) {
    return NextResponse.json(
      { error: 'Missing room ID' },
      { status: 400 }
    );
  }

  const roomSignatures = signatureStore.get(roomId) || [];
  return NextResponse.json({
    roomId,
    signatures: roomSignatures,
    count: roomSignatures.length
  });
}

// Clear signatures for a specific room
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const roomId = url.searchParams.get('roomId');
  
  if (!roomId) {
    return NextResponse.json(
      { error: 'Missing room ID' },
      { status: 400 }
    );
  }

  // Clear room-specific signatures
  signatureStore.delete(roomId);

  // Broadcast clear event to room
  if (process.env.NEXT_PUBLIC_PUSHER_KEY) {
    const channelName = `room-${roomId}`;
    await pusher.trigger(channelName, 'signatures-cleared', { roomId });
  }

  return NextResponse.json({ 
    success: true, 
    message: `All signatures cleared for room ${roomId}` 
  });
}