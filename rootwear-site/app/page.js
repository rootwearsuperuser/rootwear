"use client";

import { useEffect, useState } from "react";
import BootOverlay from "./components/BootOverlay";
import TransitionWrapper from "./components/TransitionWrapper";
import { TerminalSquare, Terminal } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "Gear for Superusers";

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        // Hide cursor after typing is complete
        const cursorTimeout = setTimeout(() => setShowCursor(false), 1000);
        // Clean up the timeout if component unmounts
        return () => clearTimeout(cursorTimeout);
      }
    }, 80);

    // Clean up the interval if component unmounts
    return () => clearInterval(typingInterval);
  }, []);

  return (
    <>
      <BootOverlay />
      <TransitionWrapper>
        <main className="flex flex-col items-center justify-center px-4 pt-24 pb-16 min-h-screen bg-black">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold tracking-widest flex items-center justify-center gap-3 mb-4 text-glow">
              <TerminalSquare className="w-8 h-8 md:w-10 md:h-10 text-green-400 animate-terminal-glow" />
              <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                RootWear
              </span>
            </h1>

            <div className="relative">
              <h2 className="text-xl md:text-2xl text-green-300 font-mono">
                {typedText}
                {showCursor && <span className="animate-cursor text-green-400">|</span>}
              </h2>
            </div>
          </div>

          {/* Description Section */}
          <section className="max-w-4xl text-center mb-16 animate-fade-in">
            <p className="text-base md:text-lg text-green-400 font-mono leading-relaxed px-4">
              RootWear is a tech-infused lifestyle brand built for <span className="text-green-300 font-semibold">superusers</span>,
              <span className="text-green-300 font-semibold"> hackers</span>, and <span className="text-green-300 font-semibold">terminal nerds</span>.
              <br className="hidden md:block" />
              Power up your style with gear that speaks your language.
            </p>

            {/* Terminal-style prompt */}
            <div className="mt-6 inline-block bg-gray-900 border border-green-500 rounded px-4 py-2 font-mono text-sm">
              <span className="text-green-500">user@rootwear:~$</span>
              <span className="text-green-400 ml-2">sudo apt install style</span>
            </div>
          </section>

          {/* Shop Now Section */}
          <section className="w-full max-w-7xl animate-fade-in-up">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-semibold mb-2 text-green-400 tracking-wide text-glow">
                Explore Our Collection
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto"></div>
            </div>
            <div className="flex justify-center">
              <Link 
                href="/products" 
                className="group flex items-center gap-3 bg-gray-900 border-2 border-green-500 hover:bg-green-500/10 text-green-400 font-bold font-mono py-4 px-8 rounded-lg transition-all duration-300 hover-glow text-xl md:text-2xl"
              >
                <Terminal className="w-6 h-6 md:w-7 md:h-7 group-hover:animate-terminal-glow" />
                SHOP NOW
              </Link>
            </div>
          </section>

          {/* Terminal Footer */}
          <footer className="mt-16 text-center animate-fade-in">
            <p className="text-green-600 font-mono text-sm">
              [System Status: ONLINE] | [Connection: SECURE] | [Mode: SUPERUSER]
            </p>
          </footer>
        </main>
      </TransitionWrapper>
    </>
  );
}