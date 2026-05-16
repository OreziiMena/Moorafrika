"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, AlertCircle, Heart, Ruler } from "lucide-react";
import { useCartStore } from "@/app/store/cartStore";
import { useWishlistStore } from "@/app/store/wishliststore";
import { ProductContract } from "@/contracts/product";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { handleClientError } from "@/lib/clientErrorHandler";
import styles from "./product.module.css";

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [product, setProduct] = useState<ProductContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  
  // Check if THIS specific product is in the global wishlist
  const isWishlisted = product ? isInWishlist(product.id) : false;

  const { items, addItem } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get<ProductContract>(
          `/api/products/${slug}`
        );
        const productData = response.data; 
        
        setProduct(productData);
        setActiveImage(productData.imageUrl); 
      } catch (error) {
        handleClientError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <main className={styles.pageWrapper}>
        <Navbar />
        <div className={styles.loading}>Loading product details...</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className={styles.pageWrapper}>
        <Navbar />
        <div className={styles.error}>Product not found.</div>
      </main>
    );
  }

  const isAvailable = product.stock_count > 0;
  // Combines main image and thumbnails for the vertical grid
  const galleryImages = [product.imageUrl, ...(product.thumbnails || [])];

const handleAddToCart = async () => {
    if (!selectedSize) {
      alert("Please select a size first!");
      return;
    }
    
    setIsAdding(true);
    
    // Pass the exact quantity and size to the Zustand store
    await addItem({ 
      productId: product.id, 
      quantity: quantity, 
      size: selectedSize 
    });
    
    setIsAdding(false);
  };

 

  return (
    <main className={styles.pageWrapper}>
      <Navbar />

      <div className={styles.container}>
        {/* LEFT COLUMN: Image Grid Layout */}
        <div className={styles.gallerySection}>
          <div className={styles.thumbnailStrip}>
            {galleryImages.map((img, idx) => (
              <button 
                key={idx} 
                className={`${styles.thumbBtn} ${activeImage === img ? styles.activeThumb : ""}`}
                onClick={() => setActiveImage(img)}
              >
                <Image 
                  src={img} 
                  alt={`${product.name} view ${idx + 1}`} 
                  fill 
                  sizes="80px"
                  className={styles.thumbImg} 
                />
              </button>
            ))}
          </div>
          
          <div className={styles.mainImageContainer}>
            <Image 
              src={activeImage} 
              alt={product.name} 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className={styles.mainImg} 
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Product Details */}
        <div className={styles.detailsSection}>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.price}>{formatNaira(product.price)}</p>
          
          <div className={styles.description}>
            <p>{product.description}</p>
          </div>

          {/* Size Selector Layout (Matches Reference Image) */}
          <div className={styles.selectorGroup}>
            <div className={styles.sizeHeader}>
              <span className={styles.label}>Size:</span>
              <Link href="/size-guide" className={styles.sizeGuidePill}>
                <Ruler size={14} /> Size guide
              </Link>
            </div>
            <div className={styles.pillGrid}>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`${styles.sizePill} ${selectedSize === size ? styles.activePill : ""}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className={styles.selectorGroup}>
            <span className={styles.label}>Qty:</span>
            <div className={styles.quantityControls}>
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className={styles.qtyBtn}
              >-</button>
              <span className={styles.qtyNumber}>{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(product.stock_count, quantity + 1))}
                className={styles.qtyBtn}
              >+</button>
            </div>
          </div>

          {/* Action Buttons: Add to Cart & Wishlist */}
          <div className={styles.actionRow}>
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable || isAdding}
              className={styles.addToCartBtn}
            >
              {isAdding ? (
                "Adding..."
              ) : !isAvailable ? (
                "Out of Stock"
              ) : (
                <>
                  <ShoppingCart size={20} />
                  ADD TO CART
                </>
              )}
            </button>
            
            <button 
              onClick={() => toggleWishlist(product.id)}
              className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistActive : ""}`}
              aria-label="Save to wishlist"
            >
              <Heart 
                size={24} 
                fill={isWishlisted ? "#ef4444" : "none"} 
                color={isWishlisted ? "#ef4444" : "#FDFBF7"}
              />
            </button>
          </div>

          {!isAvailable && (
            <p className={styles.outOfStockMsg}>
              <AlertCircle size={16} /> This item is currently unavailable.
            </p>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  );
}