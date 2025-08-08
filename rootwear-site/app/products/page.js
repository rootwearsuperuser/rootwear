'use client';
import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        // Use the secure API route instead of direct Shopify API calls
        const response = await fetch('/api/shopify/products');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch products');
        }
        
        const { products: fetchedProducts } = await response.json();
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error loading products:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex flex-col items-center justify-center space-y-4">
        <div className="text-xl animate-pulse">Loading products...</div>
        <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-400 flex flex-col items-center justify-center space-y-4">
        <div className="text-xl">⚠️ Error: {error}</div>
        <p className="text-gray-400 max-w-md text-center">
          There was a problem loading the products. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 border border-green-400 text-green-400 rounded hover:bg-green-400/10 transition-colors"
        >
          {'>'}  Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-green-400">{'>'}</span> All Products_
          </h1>
          <p className="text-green-300">
            Browse our complete collection of superuser gear
          </p>
          <div className="text-sm text-gray-400 mt-2">
            Found {products.length} products
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-400 mb-4">No products found</div>
            <p className="text-gray-500">Check your Shopify store and make sure products are published.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const productNode = product.node;
              const firstImage = productNode.images.edges[0]?.node;
              const price = productNode.priceRange.minVariantPrice;

              return (
                <a 
                  href={`/products/${productNode.handle}`}
                  key={productNode.id} 
                  className="block bg-gray-900 border border-green-400/30 rounded-lg p-4 hover:border-green-400 transition-colors hover-glow"
                >
                  {firstImage && (
                    <div className="relative w-full h-48 mb-4 bg-gray-800 rounded overflow-hidden">
                      <img
                        src={firstImage.url || firstImage.src || '/placeholder-product.svg'}
                        alt={firstImage.altText || productNode.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.svg';
                          console.error(`Failed to load image for product: ${productNode.title}`);
                        }}
                      />
                    </div>
                  )}
                  <h3 className="font-bold text-green-400 mb-2">{productNode.title}</h3>
                  <p className="text-lg font-bold text-green-400">
                    ${parseFloat(price.amount).toFixed(2)} {price.currencyCode}
                  </p>
                  <div className="mt-3 text-sm text-green-300 font-mono">
                    Click to view details
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}