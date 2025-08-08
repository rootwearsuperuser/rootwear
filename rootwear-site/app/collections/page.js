"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AllCollectionsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page (or products page)
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-lg">Redirecting to RootWear...</p>
        <div className="mt-4">
          <span className="animate-pulse">▓</span>
          <span className="animate-pulse">▓</span>
          <span className="animate-pulse">▓</span>
        </div>
      </div>
    </div>
  );
}