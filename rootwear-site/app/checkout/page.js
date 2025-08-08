// app/checkout/page.js
"use client";

import { useCart } from "../../context/CartContext";
import { createShopifyCheckout } from "../../lib/shopify";
import { useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const total = cartItems.reduce(
    (acc, item) => acc + parseFloat(item?.price?.amount || 0),
    0
  );

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create checkout in Shopify
      const checkout = await createShopifyCheckout(cartItems);

      // Clear the local cart
      clearCart();

      // Redirect to Shopify checkout
      window.location.href = checkout.webUrl;

    } catch (err) {
      console.error("Checkout error:", err);
      setError("Failed to create checkout. Please try again.");
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-white text-center">
        <h1 className="text-4xl font-bold mb-6">Checkout</h1>
        <p className="text-green-300 mb-6">Your cart is empty.</p>
        <Link
          href="/shop"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-4xl font-bold mb-6 text-center">Checkout</h1>

      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0"
            >
              <div>
                <h3 className="text-lg font-medium">{item.title}</h3>
                <p className="text-gray-400">Qty: 1</p>
              </div>
              <p className="text-xl font-semibold">${item.price?.amount}</p>
            </div>
          ))}

          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center text-2xl font-bold">
              <span>Total:</span>
              <span className="text-green-400">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-800 border border-red-600 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className={`bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Creating Checkout...' : 'Proceed to Payment'}
          </button>
          <p className="text-sm text-gray-400 mt-2">
            You will be redirected to Shopify's secure checkout
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/cart"
            className="text-green-400 hover:text-green-300 underline"
          >
            ← Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
