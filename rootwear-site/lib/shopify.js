const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_DOMAIN || '7ejzby-xc.myshopify.com';
const SHOPIFY_STOREFRONT_API_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '57c943e11ae51d05d3bab373916a22c9';

const shopifyFetch = async (query, variables = {}) => {
  try {
    const API_VERSION = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || '2024-01';
    const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_API_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      throw new Error(`GraphQL error: ${json.errors[0].message}`);
    }

    return json.data;
  } catch (error) {
    console.error('Shopify fetch error:', error);
    throw error;
  }
};

// Fetch all products
export const fetchShopifyProducts = async (first = 10) => {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            createdAt
            updatedAt
            availableForSale
            totalInventory
            productType
            vendor
            tags
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
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch(query, { first });

    return data.products.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      availableForSale: node.availableForSale,
      totalInventory: node.totalInventory,
      productType: node.productType,
      vendor: node.vendor,
      tags: node.tags,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      featuredImage: node.featuredImage ? {
        id: node.featuredImage.id,
        src: node.featuredImage.url,
        url: node.featuredImage.url,
        alt: node.featuredImage.altText,
        width: node.featuredImage.width,
        height: node.featuredImage.height,
      } : null,
      images: node.images.edges.map(({ node: image }) => ({
        id: image.id,
        src: image.url,
        url: image.url,
        alt: image.altText,
        width: image.width,
        height: image.height,
      })),
      variants: node.variants.edges.map(({ node: variant }) => ({
        id: variant.id,
        title: variant.title,
        availableForSale: variant.availableForSale,
        quantityAvailable: variant.quantityAvailable,
        price: variant.price.amount,
        compareAtPrice: variant.compareAtPrice?.amount || null,
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
      })),
      priceRange: {
        min: node.priceRange.minVariantPrice.amount,
        max: node.priceRange.maxVariantPrice.amount,
        currencyCode: node.priceRange.minVariantPrice.currencyCode,
      },
    }));
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    throw error;
  }
};

// Fetch single product by handle
export const fetchProductByHandle = async (handle) => {
  const query = `
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        createdAt
        updatedAt
        availableForSale
        totalInventory
        productType
        vendor
        tags
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
        images(first: 20) {
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
      }
    }
  `;

  try {
    const data = await shopifyFetch(query, { handle });

    if (!data.product) {
      throw new Error(`Product with handle "${handle}" not found`);
    }

    const product = data.product;

    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      availableForSale: product.availableForSale,
      totalInventory: product.totalInventory,
      productType: product.productType,
      vendor: product.vendor,
      tags: product.tags,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      options: product.options || [],
      featuredImage: product.featuredImage ? {
        id: product.featuredImage.id,
        src: product.featuredImage.url,
        url: product.featuredImage.url,
        alt: product.featuredImage.altText,
        width: product.featuredImage.width,
        height: product.featuredImage.height,
      } : null,
      images: product.images.edges.map(({ node: image }) => ({
        id: image.id,
        src: image.url,
        url: image.url,
        alt: image.altText,
        width: image.width,
        height: image.height,
      })),
      variants: product.variants.edges.map(({ node: variant }) => ({
        id: variant.id,
        title: variant.title,
        availableForSale: variant.availableForSale !== false, // Ensure consistent handling
        quantityAvailable: variant.quantityAvailable,
        price: variant.price.amount,
        priceV2: variant.price, // Include full price object for the product detail page
        compareAtPrice: variant.compareAtPrice?.amount || null,
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
      })),
      priceRange: {
        min: product.priceRange.minVariantPrice.amount,
        max: product.priceRange.maxVariantPrice.amount,
        currencyCode: product.priceRange.minVariantPrice.currencyCode,
      },
    };
  } catch (error) {
    console.error('Error fetching product by handle:', error);
    throw error;
  }
};

// Create Shopify checkout
export const createShopifyCheckout = async (lineItems = []) => {
  const query = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          totalTax {
            amount
            currencyCode
          }
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 250) {
            edges {
              node {
                id
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    image {
                      url
                      altText
                    }
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      title
                    }
                  }
                }
                quantity
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      lines: lineItems.map(item => ({
        merchandiseId: item.variantId,
        quantity: item.quantity,
      })),
    },
  };

  try {
    const data = await shopifyFetch(query, variables);

    if (data.cartCreate.userErrors && data.cartCreate.userErrors.length > 0) {
      throw new Error(data.cartCreate.userErrors[0].message);
    }

    // Transform cart data to match the expected checkout format
    const cart = data.cartCreate.cart;
    return {
      id: cart.id,
      webUrl: cart.checkoutUrl,
      totalTax: cart.totalTax,
      subtotalPrice: cart.cost.subtotalAmount,
      totalPrice: cart.cost.totalAmount,
      lineItems: cart.lines
    };
  } catch (error) {
    console.error('Error creating Shopify checkout:', error);
    throw error;
  }
};

// Update checkout line items
export const updateShopifyCheckout = async (checkoutId, lineItems) => {
  const query = `
    mutation checkoutLineItemsReplace($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
      checkoutLineItemsReplace(checkoutId: $checkoutId, lineItems: $lineItems) {
        checkout {
          id
          webUrl
          totalTax {
            amount
            currencyCode
          }
          subtotalPrice {
            amount
            currencyCode
          }
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 250) {
            edges {
              node {
                id
                title
                quantity
                variant {
                  id
                  title
                  image {
                    url
                    altText
                  }
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
        checkoutUserErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    checkoutId,
    lineItems: lineItems.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity,
    })),
  };

  try {
    const data = await shopifyFetch(query, variables);

    if (data.checkoutLineItemsReplace.checkoutUserErrors.length > 0) {
      throw new Error(data.checkoutLineItemsReplace.checkoutUserErrors[0].message);
    }

    return data.checkoutLineItemsReplace.checkout;
  } catch (error) {
    console.error('Error updating Shopify checkout:', error);
    throw error;
  }
};

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
              url: image.src || image.url,
              src: image.src || image.url,
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