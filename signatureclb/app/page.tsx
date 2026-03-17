// app/page.tsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import SignatureCanvas from 'react-signature-canvas';

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<any[]>([]);
  const [showPad, setShowPad] = useState(false);
  const [clickCoord, setClickCoord] = useState({ x: 0, y: 0 });
  const sigPad = useRef<any>(null);

  // 1. Setup Real-time Listener
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe('pdf-channel');
    channel.bind('new-signature', (data: any) => {
      setSignatures((prev) => [...prev, data]);
    });

    return () => pusher.unsubscribe('pdf-channel');
  }, []);

  // 2. Handle Upload
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPdfUrl(URL.createObjectURL(file));
  };

  // 3. Handle Klik di Area PDF
  const handlePdfClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setClickCoord({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setShowPad(true);
  };

  // 4. Simpan Tanda Tangan & Kirim ke Pusher
  const saveSignature = async () => {
    if (sigPad.current) {
      const sigData = sigPad.current.toDataURL(); // Gambar TTD (base64)
      const newSig = { x: clickCoord.x, y: clickCoord.y, image: sigData };

      // Kirim ke Server agar user lain tahu
      await fetch('/api/sign', {
        method: 'POST',
        body: JSON.stringify(newSig),
      });

      setShowPad(false);
      sigPad.current.clear();
    }
  };

  return (
    <div className="p-8 flex flex-col items-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">✍️ PDF Collab Sign</h1>
      
      {!pdfUrl ? (
        <input type="file" accept="application/pdf" onChange={handleUpload} className="mb-4" />
      ) : (
        <div className="relative border shadow-lg bg-white cursor-crosshair" 
             onClick={handlePdfClick}
             style={{ width: '600px', height: '800px' }}>
          
          {/* Viewer PDF Sederhana (Iframe/Object) */}
          <object data={pdfUrl} type="application/pdf" className="w-full h-full pointer-events-none">
            <p>PDF Tidak Support</p>
          </object>

          {/* Layer Tanda Tangan yang Muncul secara Real-time */}
          {signatures.map((sig, i) => (
            <img key={i} src={sig.image} alt="sign" className="absolute"
                 style={{ left: sig.x - 50, top: sig.y - 25, width: '100px' }} />
          ))}
          
          <p className="absolute top-2 right-2 bg-blue-500 text-white p-1 text-xs rounded">
            Klik di mana saja untuk Tanda Tangan
          </p>
        </div>
      )}

      {/* Modal Tanda Tangan */}
      {showPad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <h2 className="mb-2 font-bold">Goreskan Tanda Tangan</h2>
            <div className="border bg-gray-50">
              <SignatureCanvas ref={sigPad} penColor="black" canvasProps={{width: 300, height: 150}} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowPad(false)} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
              <button onClick={saveSignature} className="px-4 py-2 bg-blue-600 text-white rounded">Tempel TTD</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}