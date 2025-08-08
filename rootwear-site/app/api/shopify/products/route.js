// app/api/shopify/products/route.js
import { NextResponse } from 'next/server';

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

    // GraphQL query to fetch all products
    const query = `
      query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
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
                maxVariantPrice {
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
                    compareAtPrice {
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
            }
          }
        }
      }
    `;

    const response = await fetch(`https://${shopifyDomain}/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': shopifyToken,
      },
      body: JSON.stringify({ 
        query,
        variables: { first: 50 } // Fetch up to 50 products
      }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    // Transform the data to ensure consistent handling of availability status and images
    const transformedProducts = data.data.products.edges.map(edge => {
      const product = edge.node;
      
      // Ensure product has consistent availability status
      product.availableForSale = product.availableForSale !== false;
      
      // Ensure variants have consistent availability status
      if (product.variants && product.variants.edges && product.variants.edges.length > 0) {
        product.variants.edges = product.variants.edges.map(variantEdge => {
          const variant = variantEdge.node;
          return {
            node: {
              ...variant,
              availableForSale: variant.availableForSale !== false,
              // Add priceV2 for consistency with fetchProductByHandle
              priceV2: variant.price
            }
          };
        });
      }
      
      // Ensure featuredImage has both url and src properties
      if (product.featuredImage) {
        product.featuredImage = {
          ...product.featuredImage,
          src: product.featuredImage.url,
          url: product.featuredImage.url
        };
      }
      
      // Ensure images have both url and src properties
      if (product.images && product.images.edges) {
        product.images.edges = product.images.edges.map(imgEdge => {
          const img = imgEdge.node;
          return {
            node: {
              ...img,
              src: img.url,
              url: img.url
            }
          };
        });
      }
      
      // Add priceRange.min and priceRange.max for consistency with fetchProductByHandle
      if (product.priceRange) {
        product.priceRange = {
          ...product.priceRange,
          min: product.priceRange.minVariantPrice.amount,
          max: product.priceRange.maxVariantPrice.amount,
          currencyCode: product.priceRange.minVariantPrice.currencyCode
        };
      }
      
      return edge;
    });
    
    // Return the transformed products
    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}