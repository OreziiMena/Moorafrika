"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import styles from "../auth.module.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";
import { handleClientError } from "@/lib/clientErrorHandler";
    

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await axios.post('/api/auth/register', { name, email, password });
      // Redirect to the homepage
      router.push("/");

    } catch (error) {
      handleClientError(error, { setErrorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.pageWrapper}>
      <Navbar />
      <div className={styles.authBox}>
        <Link href="/" style={{ display: 'inline-flex', marginBottom: '2rem', color: 'rgba(253, 251, 247, 0.5)' }}>
          <ArrowLeft size={20} />
        </Link>

        <header className={styles.header}>
          <h1 className={styles.title}>Join Mo&apos;orafrika</h1>
          <p className={styles.subtitle}>Create an account for exclusive access.</p>
        </header>

        <form onSubmit={handleSignup} className={styles.form}>
          {errorMsg && <div style={{ color: '#E2725B', fontSize: '0.85rem', textAlign: 'center' }}>User already exists</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Full Name</label>
            <input 
              id="name" 
              required 
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input 
              type="email" 
              id="email" 
              required 
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input 
              type="password" 
              id="password" 
              required 
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className={styles.footerLinks}>
          <p>
            <span style={{ opacity: 0.6 }}>Already have an account? </span>
            <Link href="/login" className={styles.link}>Log In</Link>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}