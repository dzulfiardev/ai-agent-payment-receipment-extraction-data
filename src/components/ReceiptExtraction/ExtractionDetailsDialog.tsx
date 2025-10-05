"use client";

import { useEffect, useState } from "react";
import { ReceiptData } from "@/types/receipt";
import { useAppDispatch } from "@/store/hooks";
import { removeFromHistory } from "@/store/receiptSlice";
import { formatCurrency } from "@/common/helpers";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

interface ExtractionDetailsDialogProps {
  isOpen: boolean;
  extraction: ReceiptData | null;
  onClose: () => void;
  onDelete?: () => void;
}

export default function ExtractionDetailsDialog({ isOpen, extraction, onClose, onDelete }: ExtractionDetailsDialogProps) {
  const dispatch = useAppDispatch();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (extraction?.fileName) {
      dispatch(removeFromHistory(extraction.fileName));
      onDelete?.();
      onClose();
    }
  };
  // Handle ESC key and body scroll
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Format currency using detected currency from receipt
  const formatPrice = (amount: number | string): string => {
    const currency = extraction?.currency || 'USD';
    return formatCurrency(amount, currency);
  };

  // Calculate subtotal (sum of all item prices)
  const calculateSubtotal = (): number => {
    if (!extraction?.items) return 0;
    return extraction.items.reduce((sum, item) => {
      const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  };

  if (!isOpen || !extraction) return null;

  const subtotal = calculateSubtotal();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="relative max-w-2xl max-h-[90vh] w-full mx-auto my-8">
        {/* Close Button */}
        <button onClick={onClose} className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10" title="Close (ESC)">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Dialog Content */}
        <div className="bg-gray-900/95 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="p-6 bg-gray-800/50 border-b border-gray-700/50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white text-xl font-semibold">{extraction.storeName || "Receipt Details"}</h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                  <span>{new Date(extraction.timestamp).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{extraction.items?.length || 0} items</span>
                  {extraction.fileName && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-48">{extraction.fileName}</span>
                    </>
                  )}
                </div>
              </div>
              {extraction.total && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{typeof extraction.total === "string" ? extraction.total : formatPrice(extraction.total)}</p>
                  <p className="text-sm text-gray-400">Total</p>
                </div>
              )}
            </div>

            {/* Store Details */}
            {(extraction.address || extraction.phone) && (
              <div className="mt-4 pt-4 border-t border-gray-700/30">
                <h4 className="text-white font-medium mb-2">Information</h4>
                <div className="space-y-1 text-sm text-gray-400">
                  {extraction.address && (
                    <p>
                      <span className="text-white">Address:</span> {extraction.address}
                    </p>
                  )}
                  {extraction.phone && (
                    <p>
                      <span className="text-white">Phone:</span> {extraction.phone}
                    </p>
                  )}
                  {extraction.date && (
                    <p>
                      <span className="text-white">Date:</span> {extraction.date}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="pt-6 px-6 flex-grow">
            <h4 className="text-white font-medium text-lg mb-4">Items</h4>
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2 pb-3">
              {extraction.items && extraction.items.length > 0 ? (
                extraction.items.map((item, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">{item.name}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                          <span>Qty: {item.quantity}</span>
                          {item.unitPrice && <span>Unit: {typeof item.unitPrice === "string" ? item.unitPrice : formatPrice(item.unitPrice)}</span>}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-white font-medium">{typeof item.price === "string" ? item.price : formatPrice(item.price)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No items found</p>
              )}
            </div>
          </div>

          {/* Summary Footer */}
          <div className="p-6 bg-gray-800/30 border-t border-gray-700/50 flex-shrink-0">
            <div className="space-y-2">
              {/* <div className="flex justify-between text-gray-400">
                <span>Subtotal ({extraction.items?.length || 0} items):</span>
                <span>{formatPrice(subtotal)}</span>
              </div> */}
              {extraction.tax && (
                <div className="flex justify-between text-gray-400">
                  <span>Tax:</span>
                  <span>{typeof extraction.tax === "string" ? extraction.tax : formatPrice(extraction.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-semibold text-lg pt-2 border-t border-gray-700/50">
                <span>Total:</span>
                <span>{extraction.total ? (typeof extraction.total === "string" ? extraction.total : formatPrice(extraction.total)) : formatPrice(subtotal)}</span>
              </div>
            </div>
          </div>

          {/* Delete Button Wrapper */}
          <div className="p-6 bg-gray-800/30 border-t border-gray-700/50 flex-shrink-0">
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-700 cursor-pointer hover:bg-red-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                {/* Trash MDI Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                </svg>
                Delete
              </button>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            confirmText={`Are you sure you want to delete this receipt from "${extraction?.storeName || 'Unknown Store'}"? This action cannot be undone.`}
          />
        </div>
      </div>
    </div>
  );
}
