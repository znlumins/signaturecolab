// lib/types.ts

/**
 * Signature Data Structure
 */
export interface Signature {
  /** Unique identifier for signature */
  id: string;

  /** X coordinate on PDF (pixels) */
  x: number;

  /** Y coordinate on PDF (pixels) */
  y: number;

  /** Base64 encoded signature image */
  image: string;

  /** Timestamp in HH:MM:SS format */
  timestamp: string;

  /** User who created signature */
  userId?: string;

  /** Color of pen used (hex color code) */
  penColor?: string;

  /** Size of pen in pixels (1-8) */
  penSize?: number;

  /** ISO timestamp for server use */
  createdAt?: string;
}

/**
 * Signature Statistics
 */
export interface SignatureStats {
  /** Total number of signatures */
  total: number;

  /** Count grouped by user */
  byUser: Record<string, number>;

  /** Average pen size used */
  avgSignatureSize: string;

  /** Most used pen color */
  mostUsedColor: string;
}

/**
 * User Information
 */
export interface User {
  /** Unique user identifier */
  id: string;

  /** Display name */
  name: string;

  /** Online status */
  isOnline: boolean;

  /** Timestamp of last activity */
  lastActivity: Date;

  /** Color for UI representation */
  color: string;
}

/**
 * PDF Document
 */
export interface PdfDocument {
  /** Unique document ID */
  id: string;

  /** File name */
  fileName: string;

  /** File size in bytes */
  fileSize: number;

  /** Data URL for rendering */
  dataUrl: string;

  /** Creation timestamp */
  createdAt: Date;

  /** All signatures on this document */
  signatures: Signature[];

  /** Owner of document */
  ownerId?: string;
}

/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  /** Success flag */
  success: boolean;

  /** Response data */
  data?: T;

  /** Error message if failed */
  error?: string;

  /** HTTP status code */
  status: number;
}

/**
 * Pusher Event Payload
 */
export interface PusherPayload {
  /** Type of event */
  event: 'new-signature' | 'user-online' | 'user-offline' | 'signatures-cleared';

  /** Event data */
  data: any;

  /** Timestamp */
  timestamp: string;
}

/**
 * Pen Settings
 */
export interface PenSettings {
  /** Pen color (hex) */
  color: string;

  /** Pen size (1-8) */
  size: number;

  /** Opacity (0-1) */
  opacity?: number;

  /** Smoothing factor */
  smoothing?: number;
}

/**
 * PDF Viewer State
 */
export interface PdfViewerState {
  /** Current zoom level */
  zoom: number;

  /** Current rotation angle */
  rotation: number;

  /** Current page (for multi-page support) */
  currentPage?: number;

  /** Total pages in document */
  totalPages?: number;

  /** Scroll position */
  scrollPosition?: { x: number; y: number };
}

/**
 * Modal State
 */
export interface ModalState {
  /** Is modal open */
  isOpen: boolean;

  /** Modal type */
  type?: 'signature' | 'settings' | 'history' | 'confirm';

  /** Modal data */
  data?: any;
}

/**
 * Notification
 */
export interface Notification {
  /** Notification ID */
  id: string;

  /** Notification type */
  type: 'success' | 'error' | 'warning' | 'info';

  /** Message to display */
  message: string;

  /** Duration in ms (0 = persist) */
  duration?: number;

  /** Custom action */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Export Options
 */
export interface ExportOptions {
  /** Export format */
  format: 'json' | 'csv' | 'pdf';

  /** Include images */
  includeImages?: boolean;

  /** Include metadata */
  includeMetadata?: boolean;

  /** File name */
  fileName?: string;

  /** Include statistics */
  includeStats?: boolean;
}

/**
 * Form Errors
 */
export interface FormErrors {
  [key: string]: string;
}

/**
 * Application Settings
 */
export interface AppSettings {
  /** Enable dark mode */
  darkMode: boolean;

  /** Default pen color */
  defaultPenColor: string;

  /** Default pen size */
  defaultPenSize: number;

  /** Auto-save enabled */
  autoSave?: boolean;

  /** Language */
  language?: string;

  /** Keyboard shortcuts enabled */
  keyboardShortcuts?: boolean;
}

/**
 * Context Type for Global State
 */
export interface AppContextType {
  /** Current signatures */
  signatures: Signature[];

  /** Current PDF document */
  currentPdf: PdfDocument | null;

  /** Online users */
  onlineUsers: User[];

  /** Current pen settings */
  penSettings: PenSettings;

  /** PDF viewer state */
  pdfViewerState: PdfViewerState;

  /** Active notifications */
  notifications: Notification[];

  /** App settings */
  settings: AppSettings;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: string | null;

  /** Actions */
  actions: {
    addSignature: (signature: Signature) => Promise<void>;
    removeSignature: (id: string) => void;
    clearSignatures: () => void;
    updatePenSettings: (settings: Partial<PenSettings>) => void;
    setDarkMode: (enabled: boolean) => void;
    showNotification: (notification: Notification) => void;
  };
}

/**
 * Hook Query Result
 */
export interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
