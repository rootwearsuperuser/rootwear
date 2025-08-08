// app/cart/page.js
"use client";

import { useCart } from "../../context/CartContext";
import { default as NextImage } from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black text-green-400 px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8 font-mono">
            &gt; Shopping Cart<span className="animate-pulse">_</span>
          </h1>
          <div className="bg-gray-900 border border-green-500/30 rounded-lg p-8">
            <p className="text-green-300 mb-6 font-mono">Your cart is empty.</p>
            <Link
              href="/products"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded font-mono transition-colors hover-glow"
            >
              &gt; Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 font-mono">
          &gt; Shopping Cart<span className="animate-pulse">_</span>
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-900 border border-green-500/30 rounded-lg p-6 hover:border-green-400/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <NextImage
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow">
                    <h3 className="text-green-400 font-semibold text-lg mb-2">
                      {item.title}
                    </h3>
                    <p className="text-green-300 font-mono">
                      ${typeof item.price === 'object'
                        ? parseFloat(item.price.amount).toFixed(2)
                        : parseFloat(item.price).toFixed(2)
                      }
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                      className="p-1 bg-green-500/20 border border-green-500 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-8 text-center font-mono text-green-300">
                      {item.quantity || 1}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                      className="p-1 bg-green-500/20 border border-green-500 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 bg-red-500/20 border border-red-500 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-green-500/30 rounded-lg p-6 sticky top-24">
              <h3 className="text-green-400 font-semibold text-xl mb-4 font-mono">
                Order Summary
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-green-300 font-mono">
                  <span>Subtotal:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-mono text-sm">
                  <span>Shipping:</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-green-500/30 pt-4 mb-6">
                <div className="flex justify-between text-green-400 font-bold text-lg font-mono">
                  <span>Total:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded font-mono text-center block transition-colors hover-glow"
                >
                  &gt; Proceed to Checkout
                </Link>

                <Link
                  href="/"
                  className="w-full bg-gray-700 hover:bg-gray-600 text-green-400 font-bold py-3 px-4 rounded font-mono text-center block transition-colors"
                >
                  &gt; Continue Shopping
                </Link>

                <button
                  onClick={clearCart}
                  className="w-full bg-red-500/20 border border-red-500 text-red-400 font-bold py-2 px-4 rounded font-mono transition-colors hover:bg-red-500/30"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}