"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCartStore } from "../app/store/cartStore"; 
import styles from "./NewCollections.module.css";

// 1. IMPORT THE BACKEND CONTRACT (Adjust this path to exactly where the file is)
import { ProductContract } from "../contracts/product"; 

//Format currency
const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0, 
  }).format(amount);
};

const products: ProductContract[] = [
  { 
    id: "1", name: "Classic T-Shirt", slug: "classic-t-shirt", description: "",
    price: 22500, imageUrl: "/Assets/brand-image-1.jpeg", thumbnails: [], sizes: ["S", "M", "L"], category: "Tops", createdAt: new Date(), updatedAt: new Date()
  },
  { 
    id: "2", name: "Premium Hoodie", slug: "premium-hoodie", description: "",
    price: 45000, imageUrl: "/Assets/brand-image-7.jpeg", thumbnails: [], sizes: ["M", "L", "XL"], category: "Outerwear", createdAt: new Date(), updatedAt: new Date()
  },
  { 
    id: "3", name: "Cargo Pants", slug: "cargo-pants-1", description: "",
    price: 35000, imageUrl: "/Assets/brand-image-11.jpeg", thumbnails: [], sizes: ["30", "32", "34"], category: "Bottoms", createdAt: new Date(), updatedAt: new Date()
  },
  { 
    id: "4", name: "Cargo Pants", slug: "cargo-pants-2", description: "",
    price: 35000, imageUrl: "/Assets/brand-image-10.jpeg", thumbnails: [], sizes: ["32", "34", "36"], category: "Bottoms", createdAt: new Date(), updatedAt: new Date()
  }
];

function ProductCard({ product }: { product: ProductContract }) {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const isInCart = items.some((item) => item.id === product.id);

  // 'inStock' isn't in the backend contract yet, I'LL assume it's true for now!
  const isAvailable = true; 

  const handleCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();   
    e.stopPropagation();  

    if (isInCart) {
      removeItem(product.id);
    } else {
      addItem({ 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        imageUrl: product.imageUrl 
      });
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
            <span className={styles.currentPrice}>{formatNaira(product.price)}</span>
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
            ? "Unavailable" 
            : isInCart 
              ? "Remove from Cart" 
              : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}

export default function CollectionsPage() {
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