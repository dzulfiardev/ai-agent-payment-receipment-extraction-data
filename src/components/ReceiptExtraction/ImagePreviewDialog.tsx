'use client';

import { useEffect } from 'react';

interface ImagePreviewDialogProps {
  isOpen: boolean;
  imageUrl: string | null;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  onClose: () => void;
}

export default function ImagePreviewDialog({
  isOpen,
  imageUrl,
  fileName,
  fileSize,
  fileType,
  onClose
}: ImagePreviewDialogProps) {
  // Handle ESC key and body scroll
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Format file size helper function
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-150 flex overflow-y-auto items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        {/* Image Container */}
        <div className="bg-gray-900/90 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-700/50">
            <div className="p-4">
              <h3 className="text-white font-semibold text-lg truncate">
                {fileName || 'Receipt Preview'}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Click anywhere outside to close
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors z-10 cursor-pointer"
              title="Close (ESC)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 flex items-center justify-center bg-gray-900/50">
            <img
              src={imageUrl}
              alt="Full size preview"
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="p-4 bg-gray-800/50 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>File size: {fileSize ? formatFileSize(fileSize) : 'Unknown'}</span>
              <span>Type: {fileType || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}