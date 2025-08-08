// components/ProductGrid.js
"use client";

import React, { useEffect, useState } from "react";
import { default as NextImage } from "next/image";
import { useCart } from "../../context/CartContext";
import { fetchShopifyProducts } from "../../lib/shopify";

export default function ProductGrid() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedProducts = await fetchShopifyProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-green-300 text-center font-mono">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-red-400 font-mono mb-4">Error loading products: {error}</p>
          <button
            onClick={getProducts}
            className="px-4 py-2 bg-green-500/20 border border-green-500 text-green-400 rounded hover-glow font-mono"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-16">
        <p className="text-green-300 font-mono">No products available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-black border border-green-500 rounded-xl p-4 shadow-xl hover:shadow-green-400 transition transform hover:-translate-y-1"
        >
          {product.image && (
            <NextImage
              src={product.image}
              alt={product.imageAlt}
              width={400}
              height={400}
              className="rounded-lg w-full h-64 object-cover"
            />
          )}

          <h2 className="text-white text-xl mt-4">{product.title}</h2>

          <p className="text-green-300 mb-2">
            ${typeof product.price === 'object' ? parseFloat(product.price.amount).toFixed(2) : parseFloat(product.price).toFixed(2)}
          </p>

          <button
            onClick={() => addToCart({
              id: product.variantId || product.id,
              title: product.title,
              price: typeof product.price === 'object' ? product.price : { amount: product.price },
              image: product.image,
              variantId: product.variantId || product.id
            })}
            disabled={!product.availableForSale}
            className={`w-full mt-2 py-2 rounded font-mono transition ${
              product.availableForSale
                ? 'bg-green-500 text-black hover:bg-green-400'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {product.availableForSale ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      ))}
    </div>
  );
}