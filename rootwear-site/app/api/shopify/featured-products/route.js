// app/api/shopify/featured-products/route.js
import { NextResponse } from 'next/server';

// Featured product handles - same as in the client component
const FEATURED_PRODUCT_HANDLES = [
  "hello-world-embroidered-tech-t-shirt",
  // Add more product handles here as you add them to Shopify
];

export async function GET() {
  try {
    const shopifyDomain = process.env.SHOPIFY_DOMAIN;
    const shopifyToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || '2024-01';

    if (!shopifyDomain || !shopifyToken) {
      return NextResponse.json(
        { error: 'Shopify configuration missing' },
        { status: 500 }
      );
    }

    // Build GraphQL query for specific products
    const handleQueries = FEATURED_PRODUCT_HANDLES.map(handle =>
      `product_${handle.replace(/-/g, '_')}: product(handle: "${handle}") {
        id
        title
        handle
        description
        availableForSale
        totalInventory
        options {
          id
          name
          values
        }
        featuredImage {
          id
          url
          altText
          width
          height
        }
        images(first: 10) {
          edges {
            node {
              id
              url
              altText
              width
              height
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              availableForSale
              quantityAvailable
              price {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              image {
                id
                url
                altText
                width
                height
              }
            }
          }
        }
      }`
    ).join('\n');

    const query = `{
      ${handleQueries}
    }`;

    const response = await fetch(`https://${shopifyDomain}/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': shopifyToken,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    // Extract products from the response
    const products = Object.values(data.data)
      .filter(product => product !== null)
      .map(product => {
        // Ensure product has consistent availability status
        const productAvailable = product.availableForSale !== false;
        
        // Process variants for consistent structure
        const processedVariants = product.variants.edges.map(variantEdge => {
          const variant = variantEdge.node;
          return {
            id: variant.id,
            title: variant.title,
            availableForSale: variant.availableForSale !== false,
            quantityAvailable: variant.quantityAvailable,
            price: variant.price.amount,
            priceV2: variant.price,
            currencyCode: variant.price.currencyCode,
            selectedOptions: variant.selectedOptions,
            image: variant.image ? {
              id: variant.image.id,
              src: variant.image.url,
              url: variant.image.url,
              alt: variant.image.altText,
              width: variant.image.width,
              height: variant.image.height,
            } : null,
          };
        });
        
        // Process images for consistent structure
        const processedImages = product.images.edges.map(imgEdge => {
          const img = imgEdge.node;
          return {
            id: img.id,
            src: img.url,
            url: img.url,
            alt: img.altText,
            width: img.width,
            height: img.height,
          };
        });
        
        // Create a consistent product object
        return {
          id: product.id,
          title: product.title,
          handle: product.handle,
          description: product.description,
          availableForSale: productAvailable,
          totalInventory: product.totalInventory,
          options: product.options || [],
          featuredImage: product.featuredImage ? {
            id: product.featuredImage.id,
            src: product.featuredImage.url,
            url: product.featuredImage.url,
            alt: product.featuredImage.altText,
            width: product.featuredImage.width,
            height: product.featuredImage.height,
          } : null,
          images: processedImages,
          variants: processedVariants,
          priceRange: {
            min: product.priceRange.minVariantPrice.amount,
            max: product.priceRange.minVariantPrice.amount,
            currencyCode: product.priceRange.minVariantPrice.currencyCode,
          },
          // For backward compatibility with the FeaturedProducts component
          image: product.featuredImage?.url || '/placeholder-product.svg',
          imageAlt: product.featuredImage?.altText || product.title,
          price: parseFloat(product.priceRange.minVariantPrice.amount),
          currencyCode: product.priceRange.minVariantPrice.currencyCode,
          variantId: product.variants.edges[0]?.node.id,
        };
      });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}