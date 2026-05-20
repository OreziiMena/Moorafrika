"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, AlertCircle, Heart, Ruler, Check } from "lucide-react";
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
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = product ? isInWishlist(product.slug) : false;
  
  const { items, addItem, removeItem } = useCartStore();

  const existingCartItem = selectedSize 
    ? items.find((item) => item.productId === product?.id && item.size === selectedSize)
    : items.find((item) => item.productId === product?.id);

  const isInCart = !!existingCartItem;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get<ProductContract>(`/api/products/${slug}`);
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

  const handleMobileScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, clientWidth } = carouselRef.current;
    const newIndex = Math.round(scrollLeft / clientWidth);
    setCurrentMobileIndex(newIndex);
  };

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
  const galleryImages = [product.imageUrl, ...(product.thumbnails || [])];

  const handleCartAction = async () => {
    if (!product) return;

    if (isInCart && existingCartItem) {
      setIsAdding(true);
      try {
        await removeItem(product.id, existingCartItem.size);
      } catch (error) {
        console.error("Failed to remove item", error);
      } finally {
        setIsAdding(false);
      }
    } else {
      if (!selectedSize) {
        alert("Please select a size first!");
        return;
      }
      
      setIsAdding(true);
      try {
        await addItem({ 
          productId: product.id, 
          quantity: quantity, 
          size: selectedSize 
        });
        
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
        }, 2500);
        
      } catch (error) {
        console.error("Failed to add item", error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <main className={styles.pageWrapper}>
      <Navbar />

      <div className={styles.container}>
        
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

          <div 
            className={styles.mobileCarousel} 
            ref={carouselRef}
            onScroll={handleMobileScroll}
          >
            {galleryImages.map((img, idx) => (
              <div key={idx} className={styles.mobileCarouselFrame}>
                <Image 
                  src={img} 
                  alt={`${product.name} mobile swipe view ${idx + 1}`} 
                  fill
                  sizes="100vw"
                  priority={idx === 0}
                  className={styles.mainImg}
                />
              </div>
            ))}
          </div>

          <div className={styles.carouselDots}>
            {galleryImages.map((_, idx) => (
              <div 
                key={idx} 
                className={`${styles.dot} ${currentMobileIndex === idx ? styles.activeDot : ""}`}
              />
            ))}
          </div>

        </div>

        <div className={styles.detailsSection}>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.price}>{formatNaira(product.price)}</p>
          
          <div className={styles.description}>
            <p>{product.description}</p>
          </div>

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

          <div className={styles.actionRow}>
            <button
              onClick={handleCartAction}
              disabled={!isAvailable || isAdding || isSuccess}
              className={styles.addToCartBtn}
              style={{
                backgroundColor:  isInCart ? "transparent" : "",
                color: isSuccess ? "#141414" : isInCart ? " #ef4444" : "#141414",
                border: isInCart ? "1px solid #ef4444" : "",
              }}
            >
              {isInCart ? (
                "REMOVE FROM CART"
              ) : !isAvailable ? (
                "OUT OF STOCK"
              ) : (
                <>
                  <ShoppingCart size={20} />
                  ADD TO CART
                </>
              )}
            </button>
            
            <button 
              onClick={() => toggleWishlist(product.slug)} 
              className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ""}`}
              aria-label="Add to Wishlist"
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