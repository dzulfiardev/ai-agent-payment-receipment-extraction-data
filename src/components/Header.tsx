'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
              <span className="text-white font-bold text-lg">RE</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">ReceiptExtract</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white font-medium transition-colors duration-200 relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/receipt-extraction" className="text-gray-300 hover:text-white font-medium transition-colors duration-200 relative group">
              Extract Receipt
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white font-medium transition-colors duration-200 relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Link href="/receipt-extraction" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 inline-flex items-center gap-2">
              Try Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-700/50">
            <div className="py-6 space-y-6">
              <Link
                href="/"
                className="block text-gray-300 hover:text-white font-medium transition-colors duration-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/receipt-extraction"
                className="block text-gray-300 hover:text-white font-medium transition-colors duration-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Extract Receipt
              </Link>
              <Link
                href="/about"
                className="block text-gray-300 hover:text-white font-medium transition-colors duration-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 border-t border-gray-700/50">
                <Link
                  href="/receipt-extraction"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 inline-flex items-center gap-2 w-full justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Try Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}