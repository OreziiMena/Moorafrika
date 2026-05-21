"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./collection.module.css";
import { ProductContract } from "@/contracts/product";
import { CategoryContract } from "@/contracts/category";
import { PagedResponse } from "@/contracts/response";
import { handleClientError } from "@/lib/clientErrorHandler";

type PageItem = number | "...";

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CollectionPage() {
  const [products, setProducts] = useState<ProductContract[]>([]);
  const [categories, setCategories] = useState<CategoryContract[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(-1);
  const [sortOption, setSortOption] = useState("popularity");

  const lastAppliedSearchRef = useRef("");
  const lastAppliedCategoryRef = useRef(-1);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await axios.get<CategoryContract[]>("/api/categories");
        const fetchedCategories = categoriesResponse.data;

        setCategories(fetchedCategories);

      } catch (error) {
        handleClientError(error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const filtersChanged =
      lastAppliedSearchRef.current !== debouncedSearchQuery ||
      lastAppliedCategoryRef.current !== selectedCategory;

    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    const fetchFilteredProducts = async () => {
      const urlParams = new URLSearchParams();

      urlParams.append("page", currentPage.toString());
      if (debouncedSearchQuery !== "") {
        urlParams.append("search", debouncedSearchQuery);
      }
      if (selectedCategory !== -1) {
        urlParams.append("categoryId", selectedCategory.toString());
      }
      urlParams.append("orderBy", sortOption);

      const url = `/api/products?${urlParams.toString()}`;

      try {
        const response = await axios.get<PagedResponse<ProductContract>>(url);
        if (filtersChanged) {
          lastAppliedSearchRef.current = debouncedSearchQuery;
          lastAppliedCategoryRef.current = selectedCategory;
        }
        setProducts(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } catch (error) {
        handleClientError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [debouncedSearchQuery, selectedCategory, currentPage, sortOption]);

  const visiblePages = (): PageItem[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages: PageItem[] = [1];
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    if (startPage > 2) {
      pages.push("...");
    }

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }

    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setSelectedCategory(-1);
    setCurrentPage(1);
  };

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
              onChange={(e) => setSelectedCategory(Number(e.target.value))}
            >
              <option value="-1">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              className={styles.selectInput}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="popularity">Most Popular</option>
              <option value="createdAt">Latest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>Loading collection...</div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No products found matching your criteria.</p>
            <button 
              className={styles.clearBtn}
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className={styles.productGrid}>
              {products.map((product) => (
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
                    
                    <div className={styles.gridCartBtn}>
                      ADD TO CART
                    </div>
                  </div>

                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className={styles.pagination} aria-label="Collection pages">
                <button
                  type="button"
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <div className={styles.paginationNumbers}>
                  {visiblePages().map((page, index) => {
                    if (page === "...") {
                      return (
                        <span key={`ellipsis-${index}`} className={styles.paginationEllipsis}>
                          ...
                        </span>
                      );
                    }

                    const pageNumber = page;

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        className={pageNumber === currentPage ? styles.paginationButtonActive : styles.paginationButton}
                        onClick={() => setCurrentPage(pageNumber)}
                        aria-current={pageNumber === currentPage ? "page" : undefined}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}