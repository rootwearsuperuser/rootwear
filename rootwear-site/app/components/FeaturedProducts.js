// components/FeaturedProducts.js
"use client";

import { useState, useEffect } from "react";
import { default as NextImage } from "next/image";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { useCart } from "../../context/CartContext";

// 🎯 MANUAL FEATURED PRODUCTS CONTROL
// Simply change the product handles here to feature different products
const FEATURED_PRODUCT_HANDLES = [
  "hello-world-embroidered-tech-t-shirt", // Your current product
  // Add more product handles here as you add them to Shopify
  // "another-product-handle",
  // "third-product-handle",
];

export default function FeaturedProducts() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the secure API route instead of direct Shopify API calls
      const response = await fetch('/api/shopify/featured-products');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch products');
      }
      
      const { products: fetchedProducts } = await response.json();

      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Error fetching featured products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-400 mx-auto mb-2" />
          <p className="text-green-400 font-mono">Loading featured products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 font-mono">Error: {error}</p>
          <button
            onClick={fetchFeaturedProducts}
            className="mt-2 px-4 py-2 bg-green-500/20 border border-green-500 text-green-400 rounded hover-glow"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-green-400 font-mono">No featured products available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
      {products.map((product, index) => (
        <Link
          href={`/products/${product.handle}`}
          key={product.id}
          className="group block animate-fade-in-up hover-glow"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="bg-gray-900 border border-green-500/30 rounded-lg overflow-hidden transition-all duration-300 group-hover:border-green-400 group-hover:shadow-lg group-hover:shadow-green-500/20">
            {/* Product Image */}
            <div className="relative w-full h-64 bg-gray-800">
              <NextImage
                src={product.image || '/placeholder-product.svg'}
                alt={product.imageAlt || product.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={(e) => {
                  e.target.src = '/placeholder-product.svg';
                  console.error(`Failed to load image for product: ${product.title}`);
                }}
              />

              {/* Availability Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 text-xs font-mono rounded ${
                  product.availableForSale 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/50'
                }`}>
                  {product.availableForSale ? 'IN STOCK' : 'OUT OF STOCK'}
                </span>
              </div>

              {/* Overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Product Info */}
            <div className="p-6">
              <h4 className="text-green-400 font-semibold text-lg mb-2 group-hover:text-green-300 transition-colors">
                {product.title}
              </h4>

              {product.description && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2 font-mono">
                  {product.description.length > 100
                    ? `${product.description.substring(0, 100)}...`
                    : product.description}
                </p>
              )}

              <div className="flex justify-between items-center">
                <span className="text-green-300 font-bold text-lg font-mono">
                  ${product.price.toFixed(2)} {product.currencyCode}
                </span>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart({
                      id: product.variantId || product.id,
                      title: product.title,
                      price: { amount: product.price },
                      image: product.image,
                      variantId: product.variantId || product.id
                    });
                  }}
                  disabled={!product.availableForSale}
                  className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                    product.availableForSale
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {product.availableForSale ? 'ADD' : 'OUT'}
                </button>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}