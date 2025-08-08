"use client";

import React from 'react';
import Link from 'next/link';
import { TerminalSquare } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-4 py-20 bg-black text-green-400 border-b border-green-600">
      <div className="flex items-center space-x-2 mb-4">
        <TerminalSquare className="w-8 h-8 text-green-400 animate-pulse" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-wide">RootWear</h1>
      </div>
      <p className="text-md md:text-lg max-w-xl text-green-300 mb-10">
        Gear for Superusers — inspired by the terminal, crafted for coders.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/products/featured1" className="hover:scale-105 transform transition-all bg-green-950 p-6 rounded-xl border border-green-700 shadow-xl hover:shadow-green-500/30">
          <h3 className="font-bold text-lg mb-2">Featured Drop #1</h3>
          <p className="text-sm text-green-300">Elevated gear for low-level thinkers.</p>
        </Link>

        <Link href="/products/featured2" className="hover:scale-105 transform transition-all bg-green-950 p-6 rounded-xl border border-green-700 shadow-xl hover:shadow-green-500/30">
          <h3 className="font-bold text-lg mb-2">Featured Drop #2</h3>
          <p className="text-sm text-green-300">Style meets source code.</p>
        </Link>

        <Link href="/products/featured3" className="hover:scale-105 transform transition-all bg-green-950 p-6 rounded-xl border border-green-700 shadow-xl hover:shadow-green-500/30">
          <h3 className="font-bold text-lg mb-2">Featured Drop #3</h3>
          <p className="text-sm text-green-300">Built for terminal commandos.</p>
        </Link>
      </div>
    </section>
  );
}
