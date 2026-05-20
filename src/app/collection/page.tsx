"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./collection.module.css";
import { ProductContract } from "@/contracts/product";

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CollectionPage() {
  const [products, setProducts] = useState<ProductContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortOption, setSortOption] = useState("Featured");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products");
        const fetchedData = response.data;
        let actualArray: ProductContract[] = [];

        if (Array.isArray(fetchedData)) {
          actualArray = fetchedData;
        } else if (fetchedData && Array.isArray(fetchedData.data)) {
          actualArray = fetchedData.data;
        } else if (fetchedData && Array.isArray(fetchedData.products)) {
          actualArray = fetchedData.products;
        }

        setProducts(actualArray);
      } catch (error) {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredAndSortedProducts = React.useMemo(() => {
    if (!Array.isArray(products)) return [];

    let result = [...products];

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product?.name?.toLowerCase().includes(query) ||
          product?.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "All Categories") {
      result = result.filter(
        (product) => product?.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    switch (sortOption) {
      case "Price: Low to High":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "Price: High to Low":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "Newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "Most Popular":
        result.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortOption]);

  return (
    <main className={styles.pageWrapper}>
      <Navbar />

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>OUR COLLECTION</h1>
          <p className={styles.subtitle}>Explore our latest arrivals and premium selections</p>
        </header>

        <div className={styles.filtersContainer}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search products..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.dropdownsWrapper}>
            <select
              className={styles.selectInput}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All Categories">All Categories</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
            </select>

            <select
              className={styles.selectInput}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="Featured">Featured</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Newest">Newest</option>
              <option value="Most Popular">Most Popular</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>Loading collection...</div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No products found matching your criteria.</p>
            <button 
              className={styles.clearBtn}
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {filteredAndSortedProducts.map((product) => (
              <Link href={`/product/${product.slug}`} key={product.id} className={styles.productCard}>
                
                <div className={styles.imageContainer}>
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={styles.productImage}
                  />
                </div>

                <div className={styles.productDetails}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    {product.stock_count > 0 ? (
                      <span className={styles.inStockBadge}>In Stock</span>
                    ) : (
                      <span className={styles.outOfStockBadge}>Sold Out</span>
                    )}
                  </div>
                  
                  <p className={styles.productPrice}>{formatNaira(product.price)}</p>
                  
                  {/* Using a div instead of a button to prevent invalid HTML (button inside an anchor tag) */}
                  <div className={styles.gridCartBtn}>
                    ADD TO CART
                  </div>
                </div>

              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}