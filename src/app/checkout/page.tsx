"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
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

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara"
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCartStore();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    state: "Lagos",
    country: "NG",
    email: "",
    phone: ""
  });

  const [shippingMethod, setShippingMethod] = useState("standard");
  const [shippingCost, setShippingCost] = useState(2500);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.075;
  const total = subtotal + shippingCost + tax;

  useEffect(() => {
    const fetchShippingRate = async () => {
      if (!formData.state || !formData.city || items.length === 0) return;

      setIsCalculatingShipping(true);
      try {
        const response = await axios.post("/api/shipping-rates", {
          country: formData.country,
          state: formData.state,
          city: formData.city,
          method: shippingMethod,
          cartItems: items
        });
        setShippingCost(response.data.price || (shippingMethod === "express" ? 5000 : 2500));
      } catch (error) {
        setShippingCost(shippingMethod === "express" ? 5000 : 2500);
      } finally {
        setIsCalculatingShipping(false);
      }
    };

    fetchShippingRate();
  }, [formData.country, formData.state, formData.city, shippingMethod, items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setFormData((prev) => ({ 
      ...prev, 
      country: newCountry,
      state: newCountry === "NG" ? "Lagos" : "" 
    }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await axios.post("/api/orders", {
        customer: formData,
        cartItems: items,
        totalAmount: total,
        shippingCost: shippingCost,
        shippingMethod: shippingMethod
      });

      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        alert("Unable to initialize payment. Please try again.");
        setIsProcessing(false);
      }
    } catch (error) {
      alert("An error occurred during checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <main className={styles.pageWrapper}>
      <Navbar />
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>CHECKOUT</h1>
          <p className={styles.subtitle}>Fill in your details to complete your purchase</p>
        </header>

        <div className={styles.containerr}>
          <div className={styles.formSection}>
            <form onSubmit={handleCheckout} className={styles.form}>
              <section className={styles.formGroup}>
                <div className={styles.inputGrid}>
                  <div className={styles.inputWrapper}>
                    <label htmlFor="firstName">First name</label>
                    <input type="text" id="firstName" value={formData.firstName} onChange={handleInputChange} required />
                  </div>
                  <div className={styles.inputWrapper}>
                    <label htmlFor="lastName">Last name</label>
                    <input type="text" id="lastName" value={formData.lastName} onChange={handleInputChange} required />
                  </div>
                  <div className={styles.inputWrapper} style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="address">Street number and name or P.O box</label>
                    <input type="text" id="address" value={formData.address} onChange={handleInputChange} required />
                  </div>
                  <div className={styles.inputWrapper}>
                    <label htmlFor="city">City</label>
                    <input type="text" id="city" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div className={styles.inputWrapper}>
                    <label htmlFor="postalCode">Postal code</label>
                    <input type="text" id="postalCode" value={formData.postalCode} onChange={handleInputChange} />
                  </div>
                  
                  <div className={styles.inputWrapper}>
                    <label htmlFor="country">Country</label>
                    <select id="country" value={formData.country} onChange={handleCountryChange} required>
                      <option value="NG">Nigeria</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                    </select>
                  </div>

                  <div className={styles.inputWrapper}>
                    <label htmlFor="state">State / Province</label>
                    {formData.country === "NG" ? (
                      <select id="state" value={formData.state} onChange={handleInputChange} required>
                        <option value="" disabled>Select State</option>
                        {NIGERIAN_STATES.map((stateName) => (
                          <option key={stateName} value={stateName}>
                            {stateName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        id="state" 
                        value={formData.state} 
                        onChange={handleInputChange} 
                        placeholder="e.g. California, London"
                        required 
                      />
                    )}
                  </div>
                </div>
              </section>

              <section className={styles.formGroup}>
                <h2 className={styles.sectionTitle}>Enter Contact Info</h2>
                <div className={styles.inputGrid}>
                  <div className={styles.inputWrapper}>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className={styles.inputWrapper}>
                    <label htmlFor="phone">Mobile phone number</label>
                    <input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} required />
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
                    <span>{isCalculatingShipping ? "..." : formatNaira(shippingMethod === "standard" ? shippingCost : shippingCost - 2500)}</span>
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
                    <span>{isCalculatingShipping ? "..." : formatNaira(shippingMethod === "express" ? shippingCost : shippingCost + 2500)}</span>
                  </label>
                </div>
              </section>

              <button type="submit" className={styles.submitBtn} disabled={isProcessing || isCalculatingShipping}>
                {isProcessing ? "PROCESSING..." : "CONTINUE TO PAYMENT"}
              </button>
            </form>
          </div>

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
                  <span>{isCalculatingShipping ? "Calculating..." : formatNaira(shippingCost)}</span>
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