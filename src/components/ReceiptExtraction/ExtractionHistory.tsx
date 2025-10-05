"use client";

import { useState, useEffect } from "react";
import { ReceiptData } from "@/types/receipt";
import ExtractionDetailsDialog from "./ExtractionDetailsDialog";

interface ExtractionHistoryProps {
  history: ReceiptData[];
  itemsPerPage?: number;
}

export default function ExtractionHistory({ history, itemsPerPage = 5 }: ExtractionHistoryProps) {
  const [selectedExtraction, setSelectedExtraction] = useState<ReceiptData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page when history changes
  useEffect(() => {
    setCurrentPage(1);
  }, [history.length]);

  // Pagination calculations
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = history.slice(startIndex, endIndex);

  // Reset to first page when history changes
  useState(() => {
    setCurrentPage(1);
  });

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Handle item click
  const handleItemClick = (extraction: ReceiptData) => {
    setSelectedExtraction(extraction);
    setIsDialogOpen(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedExtraction(null);
  };
  // Format currency helper function
  const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "N/A";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numAmount);
  };

  // Don't render if no history
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-12 bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-xl font-semibold">Recent Extractions</h3>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">
                {history.length} total extraction{history.length !== 1 ? "s" : ""}
              </span>
              {totalPages > 1 && (
                <span className="text-gray-400 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {currentItems.map((extraction, index) => (
              <div
                key={extraction.id}
                className="bg-gray-800/30 rounded-xl p-4 cursor-pointer border border-gray-700/30 hover:border-blue-500/50 transition-all duration-200 hover:bg-gray-800/40 group"
                onClick={() => handleItemClick(extraction)}
                title="Click to view details">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{extraction.storeName || extraction.fileName || "Unknown Store"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-400 text-sm">{new Date(extraction.timestamp).toLocaleDateString()}</p>
                      <span className="text-gray-500">•</span>
                      <p className="text-gray-400 text-sm">
                        {extraction.items?.length || 0} item{(extraction.items?.length || 0) !== 1 ? "s" : ""}
                      </p>
                      {extraction.fileName && (
                        <>
                          <span className="text-gray-500">•</span>
                          <p className="text-gray-400 text-sm truncate max-w-32">{extraction.fileName}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-white font-medium">{extraction.total ? (typeof extraction.total === "string" ? extraction.total : formatCurrency(extraction.total)) : "N/A"}</p>
                    {extraction.tax && <p className="text-gray-400 text-sm">Tax: {typeof extraction.tax === "string" ? extraction.tax : formatCurrency(extraction.tax)}</p>}
                    <div className="flex items-center justify-end mt-1 text-xs text-gray-500 group-hover:text-blue-400 transition-colors">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>View Details</span>
                    </div>
                  </div>
                </div>

                {/* Optional: Show first few items */}
                {extraction.items && extraction.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700/30">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>Items:</span>
                      <div className="flex gap-1 flex-wrap">
                        {extraction.items.slice(0, 3).map((item, itemIndex) => (
                          <span
                            key={itemIndex}
                            className="bg-gray-700/30 px-2 py-1 rounded text-xs truncate max-w-24 hover:bg-gray-700/50 transition-colors"
                            title={`${item.name} - Click for details`}>
                            {item.name}
                          </span>
                        ))}
                        {extraction.items.length > 3 && <span className="text-gray-500 text-xs hover:text-gray-400 transition-colors">+{extraction.items.length - 3} more - Click to view all</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <div className="flex items-center justify-between">
                {/* Page Info */}
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1}-{Math.min(endIndex, history.length)} of {history.length} extractions
                </div>
                
                {/* Pagination Buttons */}
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:border-gray-700/50 transition-all duration-200"
                    title="Previous page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageClick(pageNumber)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            currentPage === pageNumber
                              ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                              : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-blue-500/50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Next Button */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:border-gray-700/50 transition-all duration-200"
                    title="Next page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Extraction Details Dialog */}
      <ExtractionDetailsDialog 
        isOpen={isDialogOpen} 
        extraction={selectedExtraction} 
        onClose={handleCloseDialog}
        onDelete={() => {
          // Reset to first page if current page becomes empty after deletion
          const newTotalPages = Math.ceil((history.length - 1) / itemsPerPage);
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
          }
        }}
      />
    </>
  );
}
