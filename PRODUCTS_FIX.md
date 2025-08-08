# Products Page Fix

## Issue Description

The products page and featured products were not working properly, showing the following error:

```
TypeError: (0 , _lib_shopify__WEBPACK_IMPORTED_MODULE_2__.getAllProducts) is not a function
    at loadProducts (webpack-internal:///(app-pages-browser)/./app/products/page.js:35:107)
```

## Root Cause

The error occurred because the products page was trying to import and use a function called `getAllProducts` from the shopify.js library, but this function didn't exist in the codebase. The application was using `fetchShopifyProducts` in some places but trying to call `getAllProducts` in others.

## Changes Made

### 1. Added Missing Function to shopify.js

Added the `getAllProducts` function to shopify.js as an alias for the existing `fetchShopifyProducts` function, with appropriate data transformation to match the expected format:

```javascript
// Export getAllProducts as an alias for fetchShopifyProducts for backward compatibility
export const getAllProducts = async (count = 20) => {
  try {
    const products = await fetchShopifyProducts(count);
    // Return in the format expected by the products page
    return products.map(product => ({
      node: {
        id: product.id,
        title: product.title,
        handle: product.handle,
        description: product.description,
        availableForSale: product.availableForSale,
        images: {
          edges: product.images.map(image => ({
            node: {
              id: image.id,
              url: image.src,
              altText: image.alt,
              width: image.width,
              height: image.height
            }
          }))
        },
        priceRange: {
          minVariantPrice: {
            amount: product.priceRange.min,
            currencyCode: product.priceRange.currencyCode
          }
        }
      }
    }));
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    throw error;
  }
};
```

### 2. Created a Secure API Route for Products

Created a new API route at `/api/shopify/products/route.js` to handle product fetching securely on the server side:

```javascript
// app/api/shopify/products/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const shopifyDomain = process.env.SHOPIFY_DOMAIN;
    const shopifyToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || '2024-01';

    // ... GraphQL query and fetch logic ...

    return NextResponse.json({ products: data.data.products.edges });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 3. Updated Products Page to Use the API Route

Modified the products page to use the new secure API route instead of directly calling the shopify.js function:

```javascript
// Use the secure API route instead of direct Shopify API calls
const response = await fetch('/api/shopify/products');

if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error || 'Failed to fetch products');
}

const { products: fetchedProducts } = await response.json();
console.log('Products received:', fetchedProducts);
setProducts(fetchedProducts);
```

## Benefits of the Changes

1. **Fixed the immediate error**: The products page now works correctly by having the missing function available.

2. **Improved security**: Sensitive Shopify API credentials are now only used on the server side, not exposed to the client.

3. **Better code organization**: Created a dedicated API route for products, similar to the featured products route.

4. **Simplified client code**: The products page now uses a simpler fetch call instead of importing and using the shopify.js library directly.

## Next Steps

1. Consider consolidating the API routes for better maintainability.
2. Add caching to the API routes to improve performance.
3. Implement error handling and retry logic for API calls.