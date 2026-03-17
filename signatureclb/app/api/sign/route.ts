// app/api/sign/route.ts
import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  const data = await req.json();
  // Mengirim data koordinat ke semua user lain
  await pusher.trigger('pdf-channel', 'new-signature', data);
  return NextResponse.json({ success: true });
}