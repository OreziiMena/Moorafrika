"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./checkout.module.css";
import { useCartStore } from "@/app/store/cartStore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CheckoutPage() {
  // Live data pulled directly from your Zustand store
  const { items } = useCartStore(); 
  
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [promoCode, setPromoCode] = useState("");

  // Calculations based on live cart items
  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shippingCost = shippingMethod === "express" ? 5000 : 2500;
  const tax = subtotal * 0.075; // 7.5% VAT example
  const total = subtotal + shippingCost + tax;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Proceeding to payment with total:", total);
    // Handle Paystack/Flutterwave integration here
  };

  return (
    <main className={styles.pageWrapper}>
        <Navbar />
      <div className={styles.container}>
        {/* Page Header */}
            <header className={styles.header}>
                <h1 className={styles.title}>Checkout</h1>
                <p className={styles.subtitle}>Fill in your details to complete your purchase</p>
            </header>

        {/* LEFT COLUMN: Forms */}
        <div className={styles.containerr}>
        <div className={styles.formSection}>
          <form onSubmit={handleCheckout} className={styles.form}>
            <section className={styles.formGroup}>
              <div className={styles.inputGrid}>
                <div className={styles.inputWrapper}>
                  <label htmlFor="firstName">First name</label>
                  <input type="text" id="firstName" required />
                </div>
                <div className={styles.inputWrapper}>
                  <label htmlFor="lastName">Last name</label>
                  <input type="text" id="lastName" required />
                </div>
                <div className={styles.inputWrapper} style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="address">Street number and name or P.O box</label>
                  <input type="text" id="address" required />
                </div>
                <div className={styles.inputWrapper}>
                  <label htmlFor="city">City</label>
                  <input type="text" id="city" required />
                </div>
                <div className={styles.inputWrapper}>
                  <label htmlFor="postalCode">Postal code</label>
                  <input type="text" id="postalCode" required />
                </div>
                <div className={styles.inputWrapper}>
                  <label htmlFor="state">State</label>
                  <input type="text" id="state" />
                </div>
                <div className={styles.inputWrapper}>
                  <label htmlFor="country">Country</label>
                  <select id="country" defaultValue="NG">
                    <option value="NG">Nigeria</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                  </select>
                </div>
              </div>
            </section>

            <section className={styles.formGroup}>
              <h2 className={styles.sectionTitle}>Enter Contact Info</h2>
              <div className={styles.inputGrid}>
                <div className={styles.inputWrapper}>
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" required />
                </div>
                <div className={styles.inputWrapper}>
                  <label htmlFor="phone">Mobile phone number</label>
                  <input type="tel" id="phone" required />
                </div>
              </div>
            </section>

            <section className={styles.formGroup}>
              <h2 className={styles.sectionTitle}>Select a Shipping Method</h2>
              <div className={styles.radioGroup}>
                <label className={`${styles.radioLabel} ${shippingMethod === "standard" ? styles.activeRadio : ""}`}>
                  <div className={styles.radioInfo}>
                    <input 
                      type="radio" 
                      name="shipping" 
                      value="standard" 
                      checked={shippingMethod === "standard"}
                      onChange={(e) => setShippingMethod(e.target.value)}
                    />
                    <span>Standard (3-7 Days)</span>
                  </div>
                  <span>{formatNaira(2500)}</span>
                </label>
                <label className={`${styles.radioLabel} ${shippingMethod === "express" ? styles.activeRadio : ""}`}>
                  <div className={styles.radioInfo}>
                    <input 
                      type="radio" 
                      name="shipping" 
                      value="express" 
                      checked={shippingMethod === "express"}
                      onChange={(e) => setShippingMethod(e.target.value)}
                    />
                    <span>Express (1-2 Days)</span>
                  </div>
                  <span>{formatNaira(5000)}</span>
                </label>
              </div>
            </section>

            <button type="submit" className={styles.submitBtn}>
              CONTINUE TO PAYMENT
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <aside className={styles.summarySection}>
          <div className={styles.stickyContainer}>
            <h2 className={styles.sectionTitle}>Order Summary</h2>
            
            <div className={styles.cartItems}>
              {items.length === 0 ? (
                <p style={{ color: '#a1a1aa' }}>Your cart is empty.</p>
              ) : (
                items.map((item) => (
                  <div key={item.product.id} className={styles.cartItem}>
                    <div className={styles.itemImage}>
                      <Image 
                        src={item.product.imageUrl} 
                        alt={item.product.name}
                        width={60}
                        height={80}
                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </div>
                    <div className={styles.itemDetails}>
                      <h3>{item.product.name}</h3>
                      <p>Qty: {item.quantity}</p>
                      <p className={styles.itemPrice}>{formatNaira(item.product.price)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>


            <div className={styles.calculations}>
              <div className={styles.calcRow}>
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <div className={styles.calcRow}>
                <span>Shipping</span>
                <span>{formatNaira(shippingCost)}</span>
              </div>
              <div className={styles.calcRow}>
                <span>Estimated Tax</span>
                <span>{formatNaira(tax)}</span>
              </div>
              <div className={`${styles.calcRow} ${styles.totalRow}`}>
                <span>Estimated total</span>
                <span>{formatNaira(total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
      </div>
      <Footer />
    </main>
  );
}