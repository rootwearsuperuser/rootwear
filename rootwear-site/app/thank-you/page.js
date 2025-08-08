// app/thank-you/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ThankYouPage() {
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Check URL parameters for order info from Shopify
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    const orderNumber = urlParams.get('order_number');

    if (orderId || orderNumber) {
      setOrderDetails({
        orderId,
        orderNumber
      });
    }

    // Clear any remaining cart data to ensure fresh start
    localStorage.removeItem('cart');
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 text-center text-white">
      <div className="bg-green-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-12 h-12 text-green-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-4xl font-bold mb-4 text-green-400">Thank You!</h1>

      <p className="text-lg text-green-200 mb-6">
        Your order has been placed successfully. You will receive a confirmation email shortly.
      </p>

      {orderDetails && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Order Details</h2>
          {orderDetails.orderNumber && (
            <p className="text-gray-300">
              Order Number: <span className="font-mono text-green-400">#{orderDetails.orderNumber}</span>
            </p>
          )}
          <p className="text-sm text-gray-400 mt-2">
            Please save this information for your records.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Link
            href="/shop"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        <div>
          <Link
            href="/"
            className="text-green-400 underline hover:text-green-300"
          >
            Return to Home
          </Link>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-400">
        <p>Questions about your order? Contact our support team.</p>
      </div>
    </div>
  );
}