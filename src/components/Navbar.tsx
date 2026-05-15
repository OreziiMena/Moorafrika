"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCartStore } from "../app/store/cartStore"; 
import { Search, Heart, ShoppingCart, ChevronDown } from "lucide-react"; // Added User icon
import styles from "./Navbar.module.css";
import { useSession } from "next-auth/react";

const MenuIcon = ({ className, strokeWidth = 1.5 }: { className?: string, strokeWidth?: number }) => (
  <svg className={className} strokeWidth={strokeWidth} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = ({ className, strokeWidth = 1.5 }: { className?: string, strokeWidth?: number }) => (
  <svg className={className} strokeWidth={strokeWidth} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const { data: session } = useSession(); // Get session data to check if user is logged in
  const user = session?.user; // Extract user info from session
  
  const { items } = useCartStore();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleResources = () => setIsResourcesOpen(!isResourcesOpen);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.navInner}>
          {/* Left Side: Logo and Navigation */}
          <div className={styles.leftSide}>
            <Link href="/" className={styles.logoLink}>
              <div className={styles.logoWrapper}>
                <Image
                  src="/Assets/brandd-logo-white.png"
                  alt="Moorafrika Logo"
                  fill
                  className={styles.logoImage}
                />
              </div>
              <span className={styles.brandText}>Mo&apos;orafrika</span>
            </Link>

            <div className={styles.desktopNav}>
              <Link href="/" className={styles.navLink}>Home</Link>
              <Link href="/about" className={styles.navLink}>About</Link>
              <Link href="/collection" className={styles.navLink}>Collection</Link>
              {/* Resources Dropdown */}
              <div
                className={styles.dropdownContainer}
                onMouseEnter={() => setIsResourcesOpen(true)}
                onMouseLeave={() => setIsResourcesOpen(false)}
              >
                <button className={styles.dropdownBtn}>
                  Info <ChevronDown className={styles.chevronIcon} />
                </button>
                <AnimatePresence>
                  {isResourcesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={styles.dropdownMenu}
                    >
                      <Link href="/faq" className={styles.dropdownItem}>FAQs</Link>
                      <Link href="/size-guide" className={styles.dropdownItem}>Size Guide</Link>
                      <Link href="/contact" className={styles.dropdownItem}>Contact</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Side: Icons & Auth */}
          <div className={styles.rightSide}>
            <div className={styles.desktopSearch}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search..."
                className={styles.searchInput}
              />
            </div>

            {/*Desktop Login / Sign Up */}
            {
              user ? (
                <p>Welcome, {user.name}!</p>
              ) : (
                <div className={styles.authLinks}>
              <Link href="/login" className={styles.authLink}>Login</Link>
              <span className={styles.authDivider}>/</span>
              <Link href="/signup" className={styles.authLink}>Sign Up</Link>
            </div>
              )
            }

            <button className={styles.iconBtn}>
              <Heart strokeWidth={1.5} className={styles.iconSize} />
            </button>
            
            {/* Cart Button */}
            <Link href="/cart" className={styles.iconBtn} style={{ position: 'relative', display: 'flex' }}>
              <ShoppingCart strokeWidth={1.5} className={styles.iconSize} />
              {items.length > 0 && (
                <span className={styles.cartBadge}>{items.length}</span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <div className={styles.mobileMenuBtnContainer}>
              <button onClick={toggleMobileMenu} className={styles.mobileMenuBtn}>
                {isMobileMenuOpen ? (
                  <CloseIcon strokeWidth={1.5} className={styles.mobileIconSize} />
                ) : (
                  <MenuIcon strokeWidth={1.5} className={styles.mobileIconSize} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={styles.mobileMenu}
          >
            <div className={styles.mobileMenuInner}>
              <Link href="/" className={styles.mobileNavLink}>Home</Link>
              <Link href="/about" className={styles.mobileNavLink}>About</Link>
              <Link href="/collection" className={styles.mobileNavLink}>Collection</Link>
              <Link href="/blog" className={styles.mobileNavLink}>Journal</Link>

              <div className={styles.mobileDropdownSection}>
                <button
                  onClick={toggleResources}
                  className={styles.mobileDropdownBtn}
                >
                  Info
                  <ChevronDown
                    className={`${styles.chevronIcon} ${
                      isResourcesOpen ? styles.rotate180 : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isResourcesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={styles.mobileDropdownContent}
                    >
                      <Link href="/faq" className={styles.mobileSubLink}>FAQs</Link>
                      <Link href="/size-guide" className={styles.mobileSubLink}>Size Guide</Link>
                      <Link href="/contact" className={styles.mobileSubLink}>Contact</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>


              <div className={styles.mobileSearchContainer}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="SEARCH..."
                  className={styles.mobileSearchInput}
                />
              </div>

              {/* Mobile Login / Sign Up */}
              <div className={styles.mobileAuthSection}>
                 <Link href="/login" className={styles.mobileAuthBtn}>Log In</Link>
                 <Link href="/signup" className={styles.mobileAuthBtnPrimary}>Sign Up</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}