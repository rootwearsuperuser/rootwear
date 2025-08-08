"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, ShoppingCart, Package, CreditCard } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Terminal },
  { href: "/products", label: "Products", icon: Package },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/checkout", label: "Checkout", icon: CreditCard },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-black border-b border-green-500 shadow-lg shadow-green-500/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2 hover-glow rounded-lg px-3 py-2">
            <Terminal className="w-6 h-6 text-green-400" />
            <span className="text-xl font-bold font-mono text-green-400 tracking-wider">
              RootWear
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1 md:space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm md:text-base
                    transition-all duration-300 hover-glow
                    ${isActive 
                      ? "text-green-400 bg-green-500/10 border border-green-500/30" 
                      : "text-gray-300 hover:text-green-300 hover:bg-green-500/5"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Terminal-style divider */}
        <div className="mt-3 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-30"></div>
      </div>
    </nav>
  );
}