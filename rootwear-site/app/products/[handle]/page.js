'use client';
import React, { useState, useEffect } from 'react';
import { fetchProductByHandle } from '../../../lib/shopify';
import { default as NextImage } from 'next/image';
import { useCart } from '../../../context/CartContext';

export default function ProductPage({ params }) {
  // Unwrap params using React.use() to access its properties
  const unwrappedParams = React.use(params);
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  // Handle the notification timeout
  useEffect(() => {
    let timer;
    if (addedToCart) {
      timer = setTimeout(() => setAddedToCart(false), 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [addedToCart]);

  // Preload images to ensure they're in browser cache
  const preloadImage = (url) => {
    if (!url) return;
    const img = new Image();
    img.src = url;
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Preloading image:', url);
    }
  };

  useEffect(() => {
    // Use unwrappedParams instead of accessing params directly
    if (!unwrappedParams || !unwrappedParams.handle) return;
    
    async function loadProduct() {
      try {
        setLoading(true);
        const productData = await fetchProductByHandle(unwrappedParams.handle);
        
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('Product data received:', productData);
          console.log('Product images:', productData.images);
          console.log('Product variants:', productData.variants);
          console.log('Product availability:', productData.availableForSale);
        }
        
        // Preload all product images
        if (productData.images && Array.isArray(productData.images)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Preloading product images');
          }
          productData.images.forEach(image => {
            if (image.url || image.src) {
              preloadImage(image.url || image.src);
            }
          });
        } else if (productData.images && productData.images.edges && Array.isArray(productData.images.edges)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Preloading product images from edges array');
          }
          productData.images.edges.forEach(edge => {
            if (edge.node && (edge.node.url || edge.node.src)) {
              preloadImage(edge.node.url || edge.node.src);
            }
          });
        }
        
        // Preload all variant images
        if (productData.variants && Array.isArray(productData.variants)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Preloading variant images');
          }
          productData.variants.forEach(variant => {
            if (variant.image && (variant.image.url || variant.image.src)) {
              preloadImage(variant.image.url || variant.image.src);
            }
          });
        } else if (productData.variants && productData.variants.edges && Array.isArray(productData.variants.edges)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Preloading variant images from edges array');
          }
          productData.variants.edges.forEach(edge => {
            if (edge.node && edge.node.image && (edge.node.image.url || edge.node.image.src)) {
              preloadImage(edge.node.image.url || edge.node.image.src);
            }
          });
        }
        
        setProduct(productData);

        // Set default selected options
        const defaultOptions = {};
        if (productData.options && Array.isArray(productData.options)) {
          productData.options.forEach(option => {
            defaultOptions[option.name] = option.values[0];
          });
        }
        setSelectedOptions(defaultOptions);

        // Find the default variant
        if (process.env.NODE_ENV === 'development') {
          console.log('Finding default variant with options:', defaultOptions);
          console.log('Available variants:', productData.variants?.edges?.length || 0);
        }
        
        const defaultVariant = productData.variants && productData.variants.edges ? 
          productData.variants.edges.find(variant => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Checking variant:', variant.node.id);
              console.log('Variant options:', variant.node.selectedOptions);
              console.log('Variant availability:', variant.node.availableForSale);
            }
            
            const hasValidOptions = variant.node.selectedOptions && Array.isArray(variant.node.selectedOptions);
            if (!hasValidOptions) {
              if (process.env.NODE_ENV === 'development') {
                console.log('  Invalid options structure');
              }
              return false;
            }
            
            const matches = variant.node.selectedOptions.every(option => {
              const optionMatches = defaultOptions[option.name] === option.value;
              if (process.env.NODE_ENV === 'development') {
                console.log(`  Option ${option.name}=${option.value} matches: ${optionMatches}`);
              }
              return optionMatches;
            });
            
            if (process.env.NODE_ENV === 'development') {
              console.log('  Variant matches:', matches);
            }
            return matches;
          }) : null;

        if (defaultVariant) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Selected default variant:', defaultVariant.node);
            console.log('Default variant availability:', defaultVariant.node.availableForSale);
          }
          setSelectedVariant(defaultVariant.node);
          // Set main image to variant image if available
          if (productData.images && productData.images.edges && Array.isArray(productData.images.edges)) {
            const variantImageIndex = productData.images.edges.findIndex(
              img => (img.node.url || img.node.src) === (defaultVariant.node.image?.url || defaultVariant.node.image?.src)
            );
            if (variantImageIndex !== -1) {
              setSelectedImage(variantImageIndex);
            }
          }
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    loadProduct();
  }, [unwrappedParams?.handle]);

  const handleOptionChange = (optionName, value) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Option changed: ${optionName} = ${value}`);
    }
    const newOptions = { ...selectedOptions, [optionName]: value };
    if (process.env.NODE_ENV === 'development') {
      console.log('New options:', newOptions);
    }
    setSelectedOptions(newOptions);

    // Handle both data structures: variants as array or variants.edges
    if (product?.variants) {
      let matchingVariant = null;
      
      // If variants is an array (direct from fetchProductByHandle)
      if (Array.isArray(product.variants)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Searching for matching variant among:', product.variants.length, 'variants (array)');
        }
        
        matchingVariant = product.variants.find(variant => {
          const hasValidOptions = variant.selectedOptions && Array.isArray(variant.selectedOptions);
          if (process.env.NODE_ENV === 'development') {
            console.log('Checking variant:', variant.id, 'has valid options:', hasValidOptions);
          }
          
          if (!hasValidOptions) return false;
          
          const matches = variant.selectedOptions.every(option => {
            const optionMatches = newOptions[option.name] === option.value;
            if (process.env.NODE_ENV === 'development') {
              console.log(`  Option ${option.name}=${option.value} matches: ${optionMatches}`);
            }
            return optionMatches;
          });
          
          if (process.env.NODE_ENV === 'development') {
            console.log('  Variant matches:', matches);
          }
          return matches;
        });
        
        if (matchingVariant) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Found matching variant:', matchingVariant);
            console.log('Variant availability:', matchingVariant.availableForSale);
          }
          setSelectedVariant(matchingVariant);
          
          // Update main image if variant has associated image
          if (matchingVariant.image && product.images) {
            let imageIndex = -1;
            
            // Handle both image data structures
            if (Array.isArray(product.images)) {
              imageIndex = product.images.findIndex(img => {
                const imgUrl = img.url || img.src;
                const variantImgUrl = matchingVariant.image.url || matchingVariant.image.src;
                return imgUrl === variantImgUrl;
              });
            } else if (product.images.edges && Array.isArray(product.images.edges)) {
              imageIndex = product.images.edges.findIndex(img => {
                const imgUrl = img.node.url || img.node.src;
                const variantImgUrl = matchingVariant.image.url || matchingVariant.image.src;
                return imgUrl === variantImgUrl;
              });
            }
            
            if (imageIndex !== -1) {
              setSelectedImage(imageIndex);
            }
          }
        }
      } 
      // If variants has edges (from API routes)
      else if (product.variants.edges && Array.isArray(product.variants.edges)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Searching for matching variant among:', product.variants.edges.length, 'variants (edges)');
        }
        
        const matchingVariantEdge = product.variants.edges.find(variant => {
          const hasValidOptions = variant.node.selectedOptions && Array.isArray(variant.node.selectedOptions);
          if (process.env.NODE_ENV === 'development') {
            console.log('Checking variant:', variant.node.id, 'has valid options:', hasValidOptions);
          }
          
          if (!hasValidOptions) return false;
          
          const matches = variant.node.selectedOptions.every(option => {
            const optionMatches = newOptions[option.name] === option.value;
            if (process.env.NODE_ENV === 'development') {
              console.log(`  Option ${option.name}=${option.value} matches: ${optionMatches}`);
            }
            return optionMatches;
          });
          
          if (process.env.NODE_ENV === 'development') {
            console.log('  Variant matches:', matches);
          }
          return matches;
        });
        
        if (matchingVariantEdge) {
          matchingVariant = matchingVariantEdge.node;
          if (process.env.NODE_ENV === 'development') {
            console.log('Found matching variant:', matchingVariant);
            console.log('Variant availability:', matchingVariant.availableForSale);
          }
          setSelectedVariant(matchingVariant);
          
          // Update main image if variant has associated image
          if (matchingVariant.image && product.images && product.images.edges && Array.isArray(product.images.edges)) {
            const imageIndex = product.images.edges.findIndex(img => {
              const imgUrl = img.node.url || img.node.src;
              const variantImgUrl = matchingVariant.image.url || matchingVariant.image.src;
              return imgUrl === variantImgUrl;
            });
            
            if (imageIndex !== -1) {
              setSelectedImage(imageIndex);
            }
          }
        }
      }
    } else if (process.env.NODE_ENV === 'development') {
      console.log('No variants found in product data');
    }
  };

  // Get color variants from product options or variants
  const getColorVariants = () => {
    // First try to use the options data directly from the product
    if (product?.options && Array.isArray(product.options)) {
      const colorOption = product.options.find(option =>
        option.name.toLowerCase().includes('color') ||
        option.name.toLowerCase().includes('colour')
      );
      if (colorOption && Array.isArray(colorOption.values) && colorOption.values.length > 0) {
        return colorOption.values;
      }
    }
    
    // Fallback: Extract unique color options from variants
    if (product?.variants && Array.isArray(product.variants)) {
      const colorOptions = new Set();
      product.variants.forEach(variant => {
        if (variant.selectedOptions && Array.isArray(variant.selectedOptions)) {
          const colorOption = variant.selectedOptions.find(option => 
            option.name.toLowerCase().includes('color') || 
            option.name.toLowerCase().includes('colour')
          );
          if (colorOption && colorOption.value) {
            colorOptions.add(colorOption.value);
          }
        }
      });
      return Array.from(colorOptions);
    }
    
    return [];
  };

  const getSizeVariants = () => {
    // First try to use the options data directly from the product
    if (product?.options && Array.isArray(product.options)) {
      const sizeOption = product.options.find(option =>
        option.name.toLowerCase().includes('size')
      );
      if (sizeOption && Array.isArray(sizeOption.values) && sizeOption.values.length > 0) {
        return sizeOption.values;
      }
    }
    
    // Fallback: Extract unique size options from variants
    if (product?.variants && Array.isArray(product.variants)) {
      const sizeOptions = new Set();
      product.variants.forEach(variant => {
        if (variant.selectedOptions && Array.isArray(variant.selectedOptions)) {
          const sizeOption = variant.selectedOptions.find(option => 
            option.name.toLowerCase().includes('size')
          );
          if (sizeOption && sizeOption.value) {
            sizeOptions.add(sizeOption.value);
          }
        }
      });
      return Array.from(sizeOptions);
    }
    
    return [];
  };

  const getVariantImage = (colorValue) => {
    // Handle both data structures: variants as array or variants.edges
    if (product?.variants) {
      // If variants is an array (direct from fetchProductByHandle)
      if (Array.isArray(product.variants)) {
        const variant = product.variants.find(variant =>
          variant.selectedOptions && Array.isArray(variant.selectedOptions) &&
          variant.selectedOptions.some(option =>
            option.name.toLowerCase().includes('color') && option.value === colorValue
          )
        );
        return variant?.image?.url || variant?.image?.src;
      } 
      // If variants has edges (from API routes)
      else if (product.variants.edges && Array.isArray(product.variants.edges)) {
        const variant = product.variants.edges.find(variant =>
          variant.node.selectedOptions && Array.isArray(variant.node.selectedOptions) &&
          variant.node.selectedOptions.some(option =>
            option.name.toLowerCase().includes('color') && option.value === colorValue
          )
        );
        return variant?.node.image?.url || variant?.node.image?.src;
      }
    }
    
    // If no matching variant found or no variants data
    return null;
  };

  const formatDescription = (description) => {
    if (!description) return '';

    // Remove specification-like content (sizes, materials, care instructions)
    const cleanDescription = description
      .replace(/Available in sizes.*?(?=\.|$)/gi, '')
      .replace(/Sizes available.*?(?=\.|$)/gi, '')
      .replace(/Materials?:.*?(?=\.|$)/gi, '')
      .replace(/Care instructions?:.*?(?=\.|$)/gi, '')
      .replace(/Machine wash.*?(?=\.|$)/gi, '')
      .replace(/\b\d+%\s+\w+\b/g, '') // Remove percentage materials like "100% cotton"
      .replace(/Double-needle.*?(?=\.|$)/gi, '')
      .replace(/Side-seamed.*?(?=\.|$)/gi, '')
      .replace(/Do not.*?(?=\.|$)/gi, '')
      .trim();

    // Split into paragraphs
    const sentences = cleanDescription.split(/(?<=[.!?])\s+/);
    const paragraphs = [];

    for (let i = 0; i < sentences.length; i += 2) {
      const paragraph = sentences.slice(i, i + 2).join(' ').trim();
      if (paragraph) paragraphs.push(paragraph);
    }

    return paragraphs;
  };

  const getSpecifications = () => {
    if (!product) return {};

    const specs = {};

    // Extract material info
    if (product.description.includes('cotton')) {
      specs.Material = '100% US Cotton';
    }

    // Extract care instructions
    if (product.description.toLowerCase().includes('machine wash')) {
      specs['Care Instructions'] = 'Machine wash cold (max 30°C). Do not bleach. Tumble dry low heat.';
    }

    // Extract construction details
    if (product.description.toLowerCase().includes('double-needle')) {
      specs.Construction = 'Double-needle stitching, Side-seamed';
    }

    // Add available sizes
    const sizes = getSizeVariants();
    if (sizes.length > 0) {
      specs['Available Sizes'] = sizes.join(', ');
    }
    
    // Add inventory information
    if (product.totalInventory !== undefined && product.totalInventory !== null) {
      specs['Inventory'] = product.totalInventory > 0 
        ? `${product.totalInventory} units available` 
        : 'Currently out of stock';
    }
    
    // Add availability status with explanation
    specs['Availability'] = isAvailable 
      ? 'In Stock - Ready to Ship' 
      : 'Out of Stock - Please check back later';

    return specs;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="text-xl">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black text-red-400 flex items-center justify-center">
        <div className="text-xl">Error: {error || 'Product not found'}</div>
      </div>
    );
  }

  const colors = getColorVariants();
  const sizes = getSizeVariants();
  
  // Handle different image data structures
  let images = [];
  if (product.images) {
    if (Array.isArray(product.images)) {
      // Direct array of images
      images = product.images.map(img => ({ node: img }));
    } else if (product.images.edges && Array.isArray(product.images.edges)) {
      // Images with edges structure
      images = product.images.edges;
    }
  }
  
  // Handle different price data structures
  let currentPrice = '0';
  let currency = 'USD';
  
  if (selectedVariant) {
    // Handle different variant price structures
    if (selectedVariant.priceV2 && selectedVariant.priceV2.amount) {
      currentPrice = selectedVariant.priceV2.amount;
      currency = selectedVariant.priceV2.currencyCode || 'USD';
    } else if (selectedVariant.price) {
      if (typeof selectedVariant.price === 'object' && selectedVariant.price.amount) {
        currentPrice = selectedVariant.price.amount;
        currency = selectedVariant.price.currencyCode || selectedVariant.currencyCode || 'USD';
      } else {
        currentPrice = selectedVariant.price;
        currency = selectedVariant.currencyCode || 'USD';
      }
    }
  } else if (product.priceRange) {
    // Use price range if no variant is selected
    if (product.priceRange.minVariantPrice && product.priceRange.minVariantPrice.amount) {
      currentPrice = product.priceRange.minVariantPrice.amount;
      currency = product.priceRange.minVariantPrice.currencyCode || 'USD';
    } else if (product.priceRange.min) {
      currentPrice = product.priceRange.min;
      currency = product.priceRange.currencyCode || 'USD';
    }
  }
  
  // Ensure price is a valid number
  const formattedPrice = parseFloat(currentPrice).toFixed(2);
  
  // Calculate product availability based on multiple factors
  const hasInventory = product.totalInventory !== undefined && product.totalInventory !== null;
  const inventoryAvailable = hasInventory ? product.totalInventory > 0 : true;
  const variantAvailable = selectedVariant && selectedVariant.availableForSale !== false;
  const productAvailable = product.availableForSale !== false;
  const isAvailable = productAvailable && (variantAvailable || !selectedVariant) && inventoryAvailable;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Availability determination:', {
      hasInventory,
      inventoryAvailable,
      variantAvailable,
      productAvailable,
      finalDecision: isAvailable
    });
  }

  return (
    <div className="min-h-screen bg-black text-green-400 py-8">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-900 border border-green-400/30 rounded-lg overflow-hidden">
              {images[selectedImage] ? (
                <>
                  {process.env.NODE_ENV === 'development' && console.log('Rendering image:', images[selectedImage].node)}
                  {process.env.NODE_ENV === 'development' && console.log('Image URL:', images[selectedImage].node.url || images[selectedImage].node.src || '/placeholder-product.svg')}
                  <NextImage
                    src={images[selectedImage].node.url || images[selectedImage].node.src || '/placeholder-product.svg'}
                    alt={images[selectedImage].node.altText || product.title}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                    priority={true} // Add priority to ensure image loads first
                    unoptimized={true} // Bypass Next.js image optimization which might cause issues
                    onError={(e) => {
                      if (process.env.NODE_ENV === 'development') {
                        console.error(`Failed to load main image for product: ${product.title}`);
                        console.error('Image that failed:', images[selectedImage].node);
                      }
                      // Try direct URL if available
                      const directUrl = images[selectedImage].node.url;
                      if (directUrl && e.target.src !== directUrl) {
                        if (process.env.NODE_ENV === 'development') {
                          console.log('Trying direct URL:', directUrl);
                        }
                        e.target.src = directUrl;
                      } else {
                        if (process.env.NODE_ENV === 'development') {
                          console.log('Using placeholder image');
                        }
                        e.target.src = '/placeholder-product.svg';
                      }
                    }}
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  {process.env.NODE_ENV === 'development' && console.log('No image available for selected index:', selectedImage)}
                  {process.env.NODE_ENV === 'development' && console.log('Available images:', images)}
                  No Image Available
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square border rounded-lg overflow-hidden transition-all ${
                      selectedImage === index 
                        ? 'border-green-400' 
                        : 'border-green-400/30 hover:border-green-400/60'
                    }`}
                  >
                    <NextImage
                      src={image.node.url || image.node.src || '/placeholder-product.svg'}
                      alt={image.node.altText || `${product.title} ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                      unoptimized={true} // Bypass Next.js image optimization
                      onError={(e) => {
                        if (process.env.NODE_ENV === 'development') {
                          console.error(`Failed to load thumbnail image ${index} for product: ${product.title}`);
                          console.error('Thumbnail that failed:', image.node);
                        }
                        
                        // Try direct URL if available
                        const directUrl = image.node.url;
                        if (directUrl && e.target.src !== directUrl) {
                          if (process.env.NODE_ENV === 'development') {
                            console.log(`Trying direct URL for thumbnail ${index}:`, directUrl);
                          }
                          e.target.src = directUrl;
                        } else {
                          if (process.env.NODE_ENV === 'development') {
                            console.log(`Using placeholder for thumbnail ${index}`);
                          }
                          e.target.src = '/placeholder-product.svg';
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-green-400 mb-2">{product.title}</h1>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isAvailable 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/50'
                }`}>
                  {isAvailable ? 'In Stock' : 'Out of Stock'}
                </div>
              </div>
              <p className="text-2xl font-semibold">
                ${formattedPrice} {currency}
              </p>
            </div>

            {/* Product Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-green-300">Description</h3>
              <div className="space-y-3">
                {formatDescription(product.description || '').map((paragraph, index) => (
                  <p key={index} className="text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-green-300">Color</h3>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => {
                    const variantImage = getVariantImage(color);
                    return (
                      <button
                        key={color}
                        onClick={() => handleOptionChange('Color', color)}
                        className={`relative border rounded-lg p-2 transition-all ${
                          selectedOptions.Color === color
                            ? 'border-green-400 bg-green-400/10'
                            : 'border-green-400/30 hover:border-green-400/60'
                        }`}
                      >
                        {variantImage ? (
                          <div className="aspect-square rounded overflow-hidden mb-1">
                            <NextImage
                              src={variantImage || '/placeholder-product.svg'}
                              alt={color}
                              width={60}
                              height={60}
                              className="w-full h-full object-cover"
                              unoptimized={true} // Bypass Next.js image optimization
                              onError={(e) => {
                                if (process.env.NODE_ENV === 'development') {
                                  console.error(`Failed to load variant image for color: ${color}`);
                                  console.error('Variant image URL that failed:', variantImage);
                                }
                                
                                // Try direct URL if it's different from what we already tried
                                if (variantImage && e.target.src !== variantImage) {
                                  if (process.env.NODE_ENV === 'development') {
                                    console.log(`Trying direct URL for color ${color}:`, variantImage);
                                  }
                                  e.target.src = variantImage;
                                } else {
                                  if (process.env.NODE_ENV === 'development') {
                                    console.log(`Using placeholder for color ${color}`);
                                  }
                                  e.target.src = '/placeholder-product.svg';
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-gray-700 rounded mb-1"></div>
                        )}
                        <span className="text-xs text-center block">{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-green-300">Size</h3>
                <div className="grid grid-cols-6 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleOptionChange('Size', size)}
                      className={`py-2 px-3 border rounded-lg transition-all ${
                        selectedOptions.Size === size
                          ? 'border-green-400 bg-green-400/10 text-green-400'
                          : 'border-green-400/30 hover:border-green-400/60 text-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-green-300 font-medium">Quantity:</label>
                <div className="flex items-center border border-green-400/30 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-green-400/10 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-green-400/10 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Add to cart clicked, availability:', isAvailable);
                    console.log('Selected variant:', selectedVariant);
                  }
                  if (isAvailable && selectedVariant) {
                    // Get the main image URL
                    let mainImage = null;
                    if (images && images.length > 0 && selectedImage >= 0 && selectedImage < images.length) {
                      const imageNode = images[selectedImage].node;
                      mainImage = imageNode.url || imageNode.src;
                    }
                    
                    // Fallback to variant image if main image is not available
                    if (!mainImage && selectedVariant.image) {
                      mainImage = selectedVariant.image.url || selectedVariant.image.src;
                    }
                    
                    // Fallback to product featured image if no other image is available
                    if (!mainImage && product.featuredImage) {
                      mainImage = product.featuredImage.url || product.featuredImage.src;
                    }
                    
                    if (process.env.NODE_ENV === 'development') {
                      console.log('Adding to cart with image:', mainImage);
                    }
                    
                    // Create cart item with consistent structure
                    const cartItem = {
                      id: selectedVariant.id,
                      variantId: selectedVariant.id,
                      title: `${product.title} - ${selectedVariant.title}`,
                      price: { amount: currentPrice },
                      currencyCode: currency,
                      image: mainImage,
                      quantity: quantity,
                      selectedOptions: selectedVariant.selectedOptions || []
                    };
                    
                    if (process.env.NODE_ENV === 'development') {
                      console.log('Cart item:', cartItem);
                    }
                    
                    addToCart(cartItem);
                    setAddedToCart(true);
                  }
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
                disabled={!isAvailable}
              >
                {isAvailable ? '🛒 Add to Cart' : 'Out of Stock'}
              </button>
              
              {/* Added to Cart Notification */}
              {addedToCart && (
                <div className="mt-4 bg-green-500/20 border border-green-500 text-green-400 p-3 rounded-lg text-center animate-fade-in">
                  ✅ Product added to cart! <a href="/cart" className="underline font-bold">View Cart</a>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="space-y-3 border-t border-green-400/30 pt-6">
              <h3 className="text-xl font-semibold text-green-300">Specifications</h3>
              <div className="bg-gray-900/50 border border-green-400/20 rounded-lg p-4">
                {Object.entries(getSpecifications()).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-green-400/10 last:border-b-0">
                    <span className="text-green-300 font-medium">{key}:</span>
                    <span className="text-gray-300">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Debug Information - Only visible in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="space-y-3 border-t border-yellow-400/30 pt-6 mt-6">
                <h3 className="text-xl font-semibold text-yellow-300">Debug Information</h3>
                <div className="bg-gray-900/50 border border-yellow-400/20 rounded-lg p-4 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-yellow-300">Product ID:</div>
                    <div className="text-gray-300 break-all">{product.id}</div>
                    
                    <div className="text-yellow-300">Product Available:</div>
                    <div className={productAvailable ? "text-green-400" : "text-red-400"}>
                      {String(productAvailable)}
                    </div>
                    
                    <div className="text-yellow-300">Has Inventory:</div>
                    <div className="text-gray-300">{String(hasInventory)}</div>
                    
                    <div className="text-yellow-300">Inventory Available:</div>
                    <div className={inventoryAvailable ? "text-green-400" : "text-red-400"}>
                      {String(inventoryAvailable)}
                    </div>
                    
                    <div className="text-yellow-300">Variant Available:</div>
                    <div className={variantAvailable ? "text-green-400" : "text-red-400"}>
                      {String(variantAvailable)}
                    </div>
                    
                    <div className="text-yellow-300">Final Availability:</div>
                    <div className={isAvailable ? "text-green-400" : "text-red-400"}>
                      {String(isAvailable)}
                    </div>
                    
                    <div className="text-yellow-300">Total Inventory:</div>
                    <div className="text-gray-300">{product.totalInventory ?? 'Not set'}</div>
                    
                    <div className="text-yellow-300">Selected Variant:</div>
                    <div className="text-gray-300 break-all">{selectedVariant?.id ?? 'None'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}