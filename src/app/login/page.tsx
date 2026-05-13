"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import styles from "../auth.module.css"; 
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {

        await signIn('credentials', { email, password, redirect: false })
      // Save the returned UserContract to browser memory
    //   login(data.user || data);


      
      router.push("/");

    } catch (error: any) {
      setErrorMsg("Invalid email or password");
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
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Enter your details to access your collection.</p>
        </header>

        <form onSubmit={handleLogin} className={styles.form}>
          {errorMsg && <div style={{ color: '#E2725B', fontSize: '0.85rem', textAlign: 'center' }}>{errorMsg}</div>}

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
            <Link href="/forgot-password" className={`${styles.link} ${styles.forgotPassword}`}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? "AUTHENTICATING..." : "SIGN IN"}
          </button>
        </form>

        <div className={styles.footerLinks}>
          <p>
            <span style={{ opacity: 0.6 }}>Don't have an account? </span>
            <Link href="/signup" className={styles.link}>Create Account</Link>
          </p>
        </div>
      </div>
        <Footer />
    </main>
  );
}