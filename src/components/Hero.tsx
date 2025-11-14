'use client';

import Link from 'next/link';
import Icon from '@mdi/react';
import { mdiFlash, mdiRobot, mdiCheckAll } from '@mdi/js';

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-16 md:py-10 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="w-2.5 h-2.5 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
            AI-Powered Receipt Processing
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-xl lg:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
            Extract Receipt Data{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Instantly
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-md lg:text-md text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
            Transform your payment receipts into structured data with the power of AI.
            Upload, scan, and extract product details in seconds - no manual entry required.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
            {[
              { icon: <Icon path={mdiRobot} size={1.5} />, title: 'AI-Powered', desc: 'Advanced OCR' },
              { icon: <Icon path={mdiFlash} size={1.5} />, title: 'Instant', desc: 'Results in seconds' },
              { icon: <Icon path={mdiCheckAll} size={1.5} />, title: 'Accurate 99%', desc: 'Accuracy you can trust' },
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm text-center">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Link
              href="/receipt-extraction"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 :to-blue-700 text-white px-10 py-3 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 inline-flex items-center justify-center gap-3"
            >
              Start Extracting Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="#how-it-works"
              className="border-2 border-gray-600 hover:border-blue-500 text-gray-300 hover:text-white hover:bg-blue-500/10 px-10 py-3 rounded-2xl font-semibold text-lg transition-all duration-300 inline-flex items-center justify-center"
            >
              Learn How It Works
            </Link>
          </div>

          {/* Stats */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-gray-700/50 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">99%</div>
              <div className="text-gray-400 font-medium">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">&lt;5s</div>
              <div className="text-gray-400 font-medium">Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">Free</div>
              <div className="text-gray-400 font-medium">No Cost</div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}