import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";
import { CartProvider } from "../context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "RootWear - Gear for Superusers",
  description: "Techwear built for coders and creatives.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-green-400 min-h-screen`}>
        <CartProvider>
          <Navbar />
          {/* Removed the main tag and padding to avoid conflicts */}
          <div className="min-h-screen">
            {children}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}