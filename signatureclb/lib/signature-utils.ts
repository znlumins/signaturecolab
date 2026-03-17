// lib/signature-utils.ts

export interface Signature {
  x: number;
  y: number;
  image: string;
  id: string;
  timestamp: string;
  userId?: string;
  penColor?: string;
  penSize?: number;
}

/**
 * Export signatures as JSON file
 */
export const exportSignaturesAsJSON = (signatures: Signature[], fileName: string = 'signatures') => {
  const dataStr = JSON.stringify(signatures, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Export signatures as CSV file
 */
export const exportSignaturesAsCSV = (signatures: Signature[], fileName: string = 'signatures') => {
  const headers = ['ID', 'User', 'X Position', 'Y Position', 'Timestamp', 'Pen Color', 'Pen Size'];
  const rows = signatures.map(sig => [
    sig.id,
    sig.userId || 'Anonymous',
    sig.x.toFixed(2),
    sig.y.toFixed(2),
    sig.timestamp,
    sig.penColor || '#000000',
    sig.penSize || '2'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const dataBlob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Get signature statistics
 */
export const getSignatureStats = (signatures: Signature[]) => {
  if (signatures.length === 0) {
    return {
      total: 0,
      byUser: {},
      avgSignatureSize: 0,
      mostUsedColor: '#000000'
    };
  }

  const byUser: Record<string, number> = {};
  let colorCount: Record<string, number> = {};
  let totalSize = 0;

  signatures.forEach(sig => {
    // Count by user
    const user = sig.userId || 'Anonymous';
    byUser[user] = (byUser[user] || 0) + 1;

    // Track colors
    const color = sig.penColor || '#000000';
    colorCount[color] = (colorCount[color] || 0) + 1;

    // Average size
    totalSize += sig.penSize || 2;
  });

  const mostUsedColor = Object.entries(colorCount).reduce((a, b) => 
    a[1] > b[1] ? a : b
  )[0];

  return {
    total: signatures.length,
    byUser,
    avgSignatureSize: (totalSize / signatures.length).toFixed(2),
    mostUsedColor
  };
};

/**
 * Validate signature data
 */
export const validateSignature = (sig: any): sig is Signature => {
  return (
    typeof sig.x === 'number' &&
    typeof sig.y === 'number' &&
    typeof sig.image === 'string' &&
    typeof sig.id === 'string' &&
    sig.image.startsWith('data:')
  );
};

/**
 * Filter signatures by date range
 */
export const filterSignaturesByDate = (
  signatures: Signature[], 
  startDate: Date, 
  endDate: Date
): Signature[] => {
  return signatures.filter(sig => {
    const sigDate = new Date(sig.timestamp);
    return sigDate >= startDate && sigDate <= endDate;
  });
};

/**
 * Find signatures by user
 */
export const findSignaturesByUser = (signatures: Signature[], userId: string): Signature[] => {
  return signatures.filter(sig => sig.userId === userId);
};

/**
 * Compress signature image
 */
export const compressSignatureImage = async (
  dataUrl: string, 
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
};
