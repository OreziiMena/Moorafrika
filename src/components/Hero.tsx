"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import styles from "./Hero.module.css";
import Link from 'next/link';

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      {/* Background Image */}
      <div className={styles.heroBackground}>
        <Image
          src="/Assets/brand-image-9.jpeg"
          alt="Fashion Hero Background"
          fill
          priority
          className={styles.heroImage}
        />
        {/* Overlay */}
        <div className={styles.heroOverlay} />
      </div>

      {/* Content */}
      <div className={styles.heroContent}>
        

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className={styles.heroTitle}    
        >
          MORE THAN FASHION,<br className={styles.heroTitleBr} /> MORE OF AFRICA.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className={styles.heroDescription}
        >
          Discover our latest collection blending contemporary design with timeless aesthetics. Crafted for those who dare to stand out.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Contrasting background frame to differentiate from the image */}
          <div className={styles.heroButtonContainer}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={styles.heroButton}
            >
              {/* Hover sliding background */}
              <span className={styles.heroButtonBg}></span>

              <div className={styles.heroButtonText}>
                <Link href="/collections/all" className={styles.seeMoreBtn}>
                    See More Collections
                    <ArrowRight className={styles.heroButtonIcon} />
                  </Link>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
