// Test script for checkout functionality
const { createShopifyCheckout } = require('./lib/shopify');

// Mock cart items
const cartItems = [
  {
    variantId: 'gid://shopify/ProductVariant/123456789', // Replace with a real variant ID from your store
    quantity: 1,
    title: 'Test Product',
    price: { amount: '19.99' }
  }
];

async function testCheckout() {
  console.log('Testing checkout with cart items:', cartItems);
  
  try {
    // Test the createShopifyCheckout function
    const checkout = await createShopifyCheckout(cartItems);
    
    console.log('Checkout created successfully!');
    console.log('Checkout URL:', checkout.webUrl);
    console.log('Checkout ID:', checkout.id);
    console.log('Total Price:', checkout.totalPrice);
    
    return checkout;
  } catch (error) {
    console.error('Checkout test failed:', error);
    throw error;
  }
}

// Run the test
testCheckout()
  .then(result => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });