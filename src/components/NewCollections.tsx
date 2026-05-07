"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { ArrowRight } from "lucide-react";
import styles from "./NewCollections.module.css";

interface Product {
  id: string;
  name: string;
  currentPrice: string; 
  inStock: boolean;
  imageSrc: string;
}

const products: Product[] = [
  {
    id: "1",
    name: "Classic T-Shirt",
    currentPrice: "₦22,500",
    inStock: true,
    imageSrc: "/Assets/brand-image-1.jpeg",
  },
  {
    id: "2",
    name: "Premium Hoodie",
    currentPrice: "₦45,000",
    inStock: true,
    imageSrc: "/Assets/brand-image-7.jpeg",
  },
  {
    id: "3",
    name: "Cargo Pants",
    currentPrice: "₦35,000",
    inStock: false,
    imageSrc: "/Assets/brand-image-11.jpeg",
  },
  {
    id: "4",
    name: "Cargo Pants",
    currentPrice: "₦35,000",
    inStock: false,
    imageSrc: "/Assets/brand-image-10.jpeg",
  }
];

function ProductCard({ product }: { product: Product }) {
  return (
    <article className={styles.card}>
      {/* This is the magic link! 
        It wraps the image and navigates to your dynamic product page.
      */}
      <Link href={`/product/${product.id}`} className={styles.imageLink}>
        <div className={styles.imageContainer}>
          <Image
            src={product.imageSrc}
            alt={product.name}
            fill
            className={styles.image}
          />
        </div>
      </Link>

      <div className={styles.details}>
        <h2 className={styles.productName}>{product.name}</h2>
      
        <div className={styles.statusWrapper}>
          <span className={styles.currentPrice}>{product.currentPrice}</span>
          {product.inStock ? (
            <span className={styles.inStock}>In Stock</span>
          ) : (
            <span className={styles.outOfStock}>Out of Stock</span>
          )}
        </div>

        <button className={styles.cartBtn} disabled={!product.inStock}>
          <ShoppingCart className={styles.icon} /> 
          {product.inStock ? "Add to Cart" : "Unavailable"}
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