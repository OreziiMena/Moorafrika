'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '../app/store/cartStore';
import styles from './NewCollections.module.css';

// 1. IMPORT THE BACKEND CONTRACT (Adjust this path to exactly where the file is)
import { ProductContract } from "../contracts/product"; 
import React from "react";
import { PagedResponse } from "@/contracts/response";

//Format currency
const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
};



function ProductCard({ product }: { product: ProductContract }) {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const isInCart = items.some((item) => item.product.id === product.id);
  console.log('Cart items in ProductCard:', items); // Debugging line to check cart items

  // 'inStock' isn't in the backend contract yet, I'LL assume it's true for now!
  const isAvailable = product.stock_count > 0; 

  const handleCartClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // await addToCart(product.id)

    if (isInCart) {
      removeItem(product.id);
    } else {
      addItem({productId: product.id, quantity: 1});
    }
  };

  return (
    <article className={styles.card}>
      <Link href={`/product/${product.slug}`} className={styles.imageLink}>
        <div className={styles.imageContainer}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={styles.image}
          />
        </div>
      </Link>

      <div className={styles.details}>
        <h2 className={styles.productName}>{product.name}</h2>

        <div className={styles.statusWrapper}>
          <div className={styles.firstStat}>
            <span className={styles.currentPrice}>
              {formatNaira(product.price)}
            </span>
          </div>

          {isAvailable ? (
            <span className={styles.inStock}>In Stock</span>
          ) : (
            <span className={styles.outOfStock}>Out of Stock</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCartClick}
          disabled={!isAvailable}
          className={isInCart ? styles.removeBtn : styles.cartBtn}
        >
          <ShoppingCart className={styles.icon} />
          {!isAvailable
            ? 'Unavailable'
            : isInCart
              ? 'Remove from Cart'
              : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}

export default function CollectionsPage() {
  const [products, setProducts] = React.useState<ProductContract[]>([]);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products?limit=4");
        const data = await response.json() as PagedResponse<ProductContract>;
        setProducts(data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className={styles.pageWrapper}>
      {/* <Navbar /> */}

      <h1 className={styles.pageTitle}>New Collections</h1>
      <p className={styles.pageSubtitle}>Discover Our Latest Arrivals</p>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className={styles.seeMoreWrapper}>
        <Link href="/collections/all" className={styles.seeMoreBtn}>
          See More Collections
          <ArrowRight className={styles.heroButtonIcon} />
        </Link>
      </div>
    </main>
  );
}
