// lib/pusher-client.ts
import Pusher from 'pusher-js';

let pusherInstance: Pusher | null = null;

export const getPusherInstance = (): Pusher => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      forceTLS: true,
    });
  }
  return pusherInstance;
};

export const subscribeToPdfChannel = (
  onNewSignature: (data: any) => void,
  onUserOnline: (data: any) => void,
  onSignaturesCleared: () => void
) => {
  const pusher = getPusherInstance();
  const channel = pusher.subscribe('pdf-channel');

  channel.bind('new-signature', onNewSignature);
  channel.bind('user-online', onUserOnline);
  channel.bind('signatures-cleared', onSignaturesCleared);

  return () => {
    channel.unbind('new-signature', onNewSignature);
    channel.unbind('user-online', onUserOnline);
    channel.unbind('signatures-cleared', onSignaturesCleared);
    pusher.unsubscribe('pdf-channel');
  };
};

export const disconnectPusher = () => {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
};
