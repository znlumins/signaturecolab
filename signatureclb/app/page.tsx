// app/page.tsx
"use client";
import React, { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Pusher from 'pusher-js';
import SignatureCanvas from 'react-signature-canvas';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, RotateCcw, Trash2, Settings, Share2, Copy, CheckCircle, ChevronLeft, ChevronRight, Sun, Moon, FileText, Lightbulb, Check, AlertCircle, PenTool } from 'lucide-react';
import { pdfjs } from 'react-pdf';

// Set pdfjs worker path
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

// Dynamically import react-pdf with no SSR
const Document = dynamic(
  () => import('react-pdf').then(mod => mod.Document),
  { ssr: false, loading: () => <div className="text-center text-gray-500">Loading PDF...</div> }
);

const Page = dynamic(
  () => import('react-pdf').then(mod => mod.Page),
  { ssr: false }
);

interface Signature {
  x: number;
  y: number;
  image: string;
  id: string;
  timestamp: string;
  userId?: string;
  penColor?: string;
  penSize?: number;
}

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [showPad, setShowPad] = useState(false);
  const [clickCoord, setClickCoord] = useState({ x: 0, y: 0 });
  const [penColor, setPenColor] = useState('#000000');
  const [penSize, setPenSize] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [signatureHistory, setSignatureHistory] = useState<Signature[]>([]);
  
  // PDF slide navigation
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // Room management
  const [roomId, setRoomId] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [userId] = useState(`User-${Math.random().toString(36).substr(2, 5)}`);
  
  // Dragging
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const sigPad = useRef<any>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Initialize room ID from URL or generate new one
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get('room');
    
    if (urlRoom) {
      setRoomId(urlRoom);
    } else {
      const newRoomId = Math.random().toString(36).substr(2, 9);
      setRoomId(newRoomId);
      // Update URL without page reload
      window.history.replaceState({}, '', `?room=${newRoomId}`);
    }
  }, []);

  // Initialize Pusher with room-specific channel
  useEffect(() => {
    if (!roomId) return;

    // Validate Pusher keys are configured
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      console.warn('⚠️ Pusher keys not configured. Real-time features will not work. Please set up .env.local file.');
      return;
    }

    try {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      });

      // Use room-specific channel
      const channelName = `room-${roomId}`;
      const channel = pusher.subscribe(channelName);
      
      const handleNewSignature = (data: Signature) => {
        setSignatures((prev) => [...prev, data]);
        setSignatureHistory((prev) => [...prev, data]);
      };
      
      const handleUserOnline = (data: any) => {
        setOnlineUsers((prev) => [...new Set([...prev, data.userId])]);
      };

      const handleSignatureMoved = (data: any) => {
        setSignatures((prev) =>
          prev.map((sig) =>
            sig.id === data.id ? { ...sig, x: data.x, y: data.y } : sig
          )
        );
      };
      
      channel.bind('new-signature', handleNewSignature);
      channel.bind('user-online', handleUserOnline);
      channel.bind('signature-moved', handleSignatureMoved);

      return () => {
        channel.unbind('new-signature', handleNewSignature);
        channel.unbind('user-online', handleUserOnline);
        channel.unbind('signature-moved', handleSignatureMoved);
        pusher.unsubscribe(channelName);
        pusher.disconnect();
      };
    } catch (error) {
      console.error('Failed to initialize Pusher:', error);
    }
  }, [roomId]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      setPdfError('Invalid file type. Please upload a PDF file.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setPdfError('PDF file is too large. Maximum size is 50MB.');
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setPdfError(null);
      setPdfLoading(true);
      setCurrentPage(1);
      setSignatures([]);
      setSignatureHistory([]);
    } catch (error) {
      console.error('Error loading PDF:', error);
      setPdfError('Failed to load PDF. Please try again.');
    }
  };

  const handlePdfClick = (e: React.MouseEvent) => {
    // Don't open modal if already dragging or clicking on signature
    if (draggingId) return;
    
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' || target.closest('.group')) {
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // Adjust for zoom scale
    const actualX = (e.clientX - rect.left) / zoom;
    const actualY = (e.clientY - rect.top) / zoom;
    
    // Check if click is within reasonable bounds
    if (actualX >= 0 && actualY >= 0) {
      setClickCoord({
        x: actualX,
        y: actualY
      });
      setShowPad(true);
    }
  };

  const saveSignature = async () => {
    if (!sigPad.current) {
      console.error('Signature pad not found');
      return;
    }

    try {
      const canvas = sigPad.current.getTrimmedCanvas?.() || sigPad.current.getCanvas?.();
      if (!canvas) {
        console.error('Could not get signature canvas');
        alert('Could not get signature. Please try again.');
        return;
      }

      // Create transparent canvas by removing white background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        console.error('Could not get canvas context');
        alert('Canvas error. Please try again.');
        return;
      }

      // Get image data from original canvas
      const imageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
      if (!imageData) {
        console.error('Could not get image data');
        alert('Image data error. Please try again.');
        return;
      }

      // Process pixels: make white/light transparent, keep dark pixels (signature)
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // If pixel is very light (signature background), make it transparent
        if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }

      // Put modified image data on transparent canvas
      tempCtx.putImageData(imageData, 0, 0);

      // Convert to PNG with transparent background
      const sigData = tempCanvas.toDataURL('image/png');
      if (!sigData || sigData.length < 100) {
        console.error('Signature appears to be empty');
        alert('Signature is empty. Please draw again.');
        return;
      }

      const newSig: Signature = {
        x: clickCoord.x,
        y: clickCoord.y,
        image: sigData,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        penColor,
        penSize,
        userId
      };

      try {
        const response = await fetch('/api/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newSig, roomId }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', errorData);
          
          // Still add signature locally even if API fails
          setSignatures((prev) => [...prev, newSig]);
          setSignatureHistory((prev) => [...prev, newSig]);
          setShowPad(false);
          sigPad.current.clear?.();
          alert('Signature saved locally. Server might be temporarily unavailable.');
          return;
        }

        // Success - API accepted
        setSignatures((prev) => [...prev, newSig]);
        setSignatureHistory((prev) => [...prev, newSig]);
        setShowPad(false);
        sigPad.current.clear?.();
      } catch (fetchError) {
        console.error('Network error:', fetchError);
        // Fallback: save locally
        setSignatures((prev) => [...prev, newSig]);
        setSignatureHistory((prev) => [...prev, newSig]);
        setShowPad(false);
        sigPad.current.clear?.();
        alert('Saved locally. Check your internet connection.');
      }
    } catch (error) {
      console.error('Error saving signature:', error);
      alert(`Failed to save signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle signature dragging
  const handleSignatureMouseDown = (e: React.MouseEvent, sig: Signature) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = pdfContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDraggingId(sig.id);
    setDragOffset({
      x: e.clientX - rect.left - sig.x,
      y: e.clientY - rect.top - sig.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !pdfContainerRef.current) return;

    const rect = pdfContainerRef.current.getBoundingClientRect();
    const newX = (e.clientX - rect.left - dragOffset.x) / zoom;
    const newY = (e.clientY - rect.top - dragOffset.y) / zoom;

    setSignatures((prev) =>
      prev.map((sig) =>
        sig.id === draggingId ? { ...sig, x: newX, y: newY } : sig
      )
    );
  };

  const handleMouseUp = async () => {
    if (!draggingId) return;

    const signature = signatures.find((s) => s.id === draggingId);
    if (!signature) return;

    setDraggingId(null);

    try {
      await fetch('/api/sign/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draggingId,
          x: signature.x,
          y: signature.y,
          roomId
        }),
      });
    } catch (error) {
      console.error('Error moving signature:', error);
    }
  };

  const clearLastSignature = () => {
    if (signatures.length > 0) {
      setSignatures(signatures.slice(0, -1));
    }
  };

  const downloadSignedPdf = async () => {
    if (signatures.length === 0) {
      alert('No signatures to export. Please add at least one signature.');
      return;
    }

    try {
      const pdfViewer = document.querySelector('#pdf-viewer-container');
      if (!pdfViewer) {
        throw new Error('PDF viewer not found');
      }

      // Hide elements that shouldn't be exported
      const elementsToHide: HTMLElement[] = [];
      const signatureCounters = pdfViewer.querySelectorAll('[data-no-export]');
      signatureCounters.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = 'none';
        elementsToHide.push(htmlEl);
      });

      // Also hide hover tooltips
      const tooltips = pdfViewer.querySelectorAll('div + div[class*="opacity-0"]');
      tooltips.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = 'none';
        elementsToHide.push(htmlEl);
      });

      // Capture the current page with signatures
      const canvas = await html2canvas(pdfViewer as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Restore hidden elements
      elementsToHide.forEach((el) => {
        el.style.display = '';
      });

      // Create PDF with captured image
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Add metadata
      pdf.setProperties({
        title: `Signed Document - Page ${currentPage}`,
        subject: `Signatures: ${signatures.length} | Room: ${roomId}`
      });

      // Save PDF file
      pdf.save(`signed-document-page-${currentPage}-${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const copyRoomLink = async () => {
    const link = `${window.location.origin}?room=${roomId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy link. Please try again.');
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div
        className={`${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-b border-gray-200'
        } shadow-sm border-b`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <PenTool size={32} className="text-blue-600" /> PDF Collab Sign
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Real-time collaborative signature platform {roomId && `• Room: ${roomId.substring(0, 6)}...`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className={`p-2 rounded-lg transition flex items-center gap-2 font-medium ${
                isDarkMode
                  ? 'bg-green-700 hover:bg-green-600 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              title="Share room link"
            >
              <Share2 size={18} /> Share
            </button>

            <div className="w-px h-8 bg-gray-300"></div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition ${
                isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-3 gap-6">
        {/* Main PDF Area */}
        <div className="col-span-2">
          {!pdfUrl ? (
            <div
              className={`${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
              } rounded-xl border-2 border-dashed p-12 text-center cursor-pointer hover:border-blue-500 transition`}
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={handleUpload}
                className="hidden"
                id="pdf-input"
              />
              <label htmlFor="pdf-input" className="cursor-pointer">
                <div className="mb-4 flex justify-center"><FileText size={64} className="text-blue-500" /></div>
                <h2 className="text-2xl font-bold mb-2">Upload PDF</h2>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Click to select your PDF file</p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                } rounded-lg border p-4 flex gap-4 items-center flex-wrap`}
              >
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">View:</label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.5"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-sm">{(zoom * 100).toFixed(0)}%</span>
                </div>
                <button
                  onClick={downloadSignedPdf}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  <Download size={18} /> Export
                </button>
              </div>

              <div
                className={`${
                  isDarkMode ? 'bg-slate-800' : 'bg-white'
                } rounded-lg shadow-xl relative border-2 border-gray-300 transition overflow-hidden`}
                style={{
                  width: '600px',
                  height: '800px',
                  userSelect: 'none'
                }}
              >
                <div
                  id="pdf-viewer-container"
                  ref={pdfContainerRef}
                  onClick={handlePdfClick}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center'
                  }}
                  className="cursor-crosshair"
                >
                  {pdfUrl && !pdfError && (
                    <Suspense fallback={<div className="text-center text-gray-500">Loading PDF...</div>}>
                      <Document 
                        file={pdfUrl} 
                        onLoadSuccess={({ numPages }) => {
                          setNumPages(numPages);
                          setPdfLoading(false);
                        }}
                        onLoadError={(error) => {
                          console.error('PDF load error:', error);
                          setPdfError('Failed to load PDF. Please ensure the file is valid.');
                          setPdfLoading(false);
                        }}
                        onError={(error) => {
                          console.error('PDF error:', error);
                          setPdfError('Error rendering PDF. Please try another file.');
                        }}
                      >
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <Page
                            pageNumber={currentPage}
                            width={600}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />

                          {/* Signatures Layer - Draggable */}
                          {signatures.map((sig) => (
                            <div
                              key={sig.id}
                              className="absolute group"
                              style={{
                                left: sig.x - 50,
                                top: sig.y - 25,
                                cursor: draggingId === sig.id ? 'grabbing' : 'grab'
                              }}
                              onMouseDown={(e) => handleSignatureMouseDown(e, sig)}
                            >
                              <div className="relative">
                                <img
                                  src={sig.image}
                                  alt="signature"
                                  className={`w-24 h-12 drop-shadow-lg rounded transition ${
                                    draggingId === sig.id ? 'ring-2 ring-blue-500 scale-105' : 'hover:drop-shadow-xl'
                                  }`}
                                  style={{ background: 'transparent' }}
                                />
                                <div
                                  className={`absolute -top-8 left-0 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none font-medium ${
                                    isDarkMode
                                      ? 'bg-slate-700 text-white'
                                      : 'bg-gray-800 text-white'
                                  }`}
                                >
                                  {sig.userId} • {sig.timestamp}
                                </div>
                              </div>
                            </div>
                          ))}

                          <div
                            className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-medium ${
                              isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                            }`}
                            data-no-export="true"
                          >
                            {signatures.length} signatures
                          </div>

                          {signatures.length > 0 && (
                            <div
                              className={`absolute bottom-4 right-4 text-xs px-3 py-1 rounded flex items-center gap-1 ${
                                isDarkMode ? 'bg-amber-900 text-amber-200' : 'bg-amber-100 text-amber-800'
                              }`}
                              data-no-export="true"
                            >
                              <Lightbulb size={14} /> Drag to move
                            </div>
                          )}
                        </div>
                      </Document>
                    </Suspense>
                  )}

                  {pdfError && (
                    <div className={`text-center p-6 ${isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-300'} rounded-lg`}>
                      <div className="mb-2 flex justify-center"><AlertCircle size={32} className="text-red-600" /></div>
                      <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>Failed to Load PDF</h3>
                      <p className={`mb-4 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{pdfError}</p>
                      <button
                        onClick={() => {
                          setPdfUrl(null);
                          setPdfError(null);
                          setPdfLoading(false);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                      >
                        Try Another File
                      </button>
                    </div>
                  )}
                </div>

                {/* Page Navigation */}
                {pdfUrl && !pdfError && (
                <div
                  className={`absolute bottom-0 left-0 right-0 ${
                    isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
                  } border-t ${isDarkMode ? 'border-slate-600' : 'border-gray-300'} p-2 flex items-center justify-between`}
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded transition ${
                      currentPage === 1
                        ? isDarkMode ? 'text-gray-500 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                        : isDarkMode ? 'text-white hover:bg-slate-600' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                    Page {currentPage} of {numPages}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                    disabled={currentPage === numPages}
                    className={`p-2 rounded transition ${
                      currentPage === numPages
                        ? isDarkMode ? 'text-gray-500 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                        : isDarkMode ? 'text-white hover:bg-slate-600' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pen Controls */}
          <div
            className={`${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            } rounded-lg border p-4 space-y-4`}
          >
            <h3 className="font-bold flex items-center gap-2">
              <Settings size={18} /> Pen Settings
            </h3>

            <div>
              <label className="text-sm font-medium block mb-2">Color</label>
              <div className="flex gap-2">
                {['#000000', '#FF0000', '#0066FF', '#00AA00', '#FF9900'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setPenColor(color)}
                    className={`w-10 h-10 rounded-lg transition transform ${
                      penColor === color ? 'ring-2 ring-offset-2 scale-110' : ''
                    }`}
                    style={{
                      backgroundColor: color,
                      boxShadow:
                        penColor === color
                          ? `0 0 0 2px white, 0 0 0 4px ${isDarkMode ? '#64748b' : '#e5e7eb'}`
                          : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Pen Size: {penSize}px</label>
              <input
                type="range"
                min="1"
                max="5"
                value={penSize}
                onChange={(e) => setPenSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Signature History */}
          <div
            className={`${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            } rounded-lg border p-4 space-y-3 max-h-96 overflow-y-auto`}
          >
            <h3 className="font-bold">📝 History</h3>
            {signatureHistory.length === 0 ? (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No signatures yet
              </p>
            ) : (
              signatureHistory.map((sig) => (
                <div
                  key={sig.id}
                  className={`text-xs p-2 rounded ${
                    isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
                  }`}
                >
                  <p className="font-medium">{sig.userId}</p>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{sig.timestamp}</p>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Pos: ({sig.x.toFixed(0)}, {sig.y.toFixed(0)})
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Online Users */}
          <div
            className={`${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            } rounded-lg border p-4`}
          >
            <h3 className="font-bold mb-2">👥 Online ({onlineUsers.length})</h3>
            <div className="flex flex-wrap gap-2">
              {onlineUsers.length === 0 ? (
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  You're alone. Share room link to invite others!
                </p>
              ) : (
                onlineUsers.map((user) => (
                  <span key={user} className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                    {user}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <button
              onClick={clearLastSignature}
              className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> Undo
            </button>
            <button
              onClick={() => {
                setSignatures([]);
                setPdfUrl(null);
              }}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center gap-2"
            >
              <Trash2 size={18} /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {showPad && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className={`${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            } p-6 rounded-xl shadow-2xl border-2 border-blue-500`}
          >
            <h2 className="mb-4 font-bold text-xl">✍️ Sign Here</h2>
            <div
              className={`border-2 rounded-lg overflow-hidden ${
                isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-300'
              }`}
            >
              <SignatureCanvas
                ref={sigPad}
                penColor={penColor}
                minWidth={penSize}
                maxWidth={penSize}
                canvasProps={{ width: 400, height: 200 }}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowPad(false);
                  sigPad.current?.clear();
                }}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => sigPad.current?.clear()}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  isDarkMode
                    ? 'bg-yellow-700 hover:bg-yellow-600'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
              >
                Clear
              </button>
              <button
                onClick={saveSignature}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition font-medium"
              >
                Sign ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Room Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className={`${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            } p-6 rounded-xl shadow-2xl border-2 border-green-500 max-w-md w-full mx-4`}
          >
            <h2 className="mb-4 font-bold text-xl">🔗 Share Room</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Room Link</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}?room=${roomId}`}
                    readOnly
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-mono ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-gray-200'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  />
                  <button
                    onClick={copyRoomLink}
                    className={`px-3 py-2 rounded-lg transition flex items-center gap-1 ${
                      copySuccess
                        ? 'bg-green-600 text-white'
                        : isDarkMode
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {copySuccess ? (
                      <>
                        <CheckCircle size={16} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div
                className={`p-3 rounded text-sm ${
                  isDarkMode
                    ? 'bg-blue-900 text-blue-200'
                    : 'bg-blue-50 text-blue-800'
                }`}
              >
                <p className="font-medium mb-1 flex items-center gap-2"><Lightbulb size={16} /> How to share:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Copy the link above</li>
                  <li>Send it to collaborators via email/chat</li>
                  <li>They'll join the same room</li>
                  <li>See changes in real-time!</li>
                </ul>
              </div>

              <div
                className={`p-3 rounded text-sm ${
                  isDarkMode
                    ? 'bg-amber-900 text-amber-200'
                    : 'bg-amber-50 text-amber-800'
                }`}
              >
                <p className="font-medium">🎯 Room ID: <code className="font-mono">{roomId}</code></p>
              </div>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
