"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./page.module.css";
import Navbar from "../../components/Navbar"; 
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <main className={styles.mainWrapper}>
      <Navbar />
      
      <div className={styles.splitLayout}>
        {/* Left Side: The Sticky Image */}
        <div className={styles.imageColumn}>
          <div className={styles.stickyImageWrapper}>
            <Image
              src="/Assets/brandd-logo-white.png" 
              alt="Moorafrika Heritage"
              fill
              priority
              className={styles.image}
            />
          </div>
        </div>

        {/* Right Side: The Scrolling Story */}
        <div className={styles.textColumn}>
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={styles.textContent}
          >
            <span className={styles.subtitle}>Our Story</span>
            <h1 className={styles.title}>More than Fashion,<br className={styles.heroTitleBr} /> More of Africa</h1>
            
            <p className={styles.paragraph}>
              Mo’orafrika is more than a fashion brand—it is a statement of identity, intention, and modern African expression. 
            </p>
            
            <p className={styles.paragraph}>
              Born at the intersection of memory and ambition, the brand reflects a deeper understanding of Africa—not as a single story, but as a rich, evolving experience shaped by history, culture, 
              and forward movement. The name itself speaks to this philosophy: more of Africa—more depth, more authenticity, more perspective.
            </p>
            
            <p className={styles.paragraph}>
              Mo’orafrika was created to challenge the limits placed on African fashion. For too long, it has been reduced to stereotypes or confined to tradition without evolution. This brand takes a different path—one that 
              honors heritage while redefining how it is expressed. It is not about loudness for attention, but about presence with purpose.
            </p>

            <p className={styles.paragraph}>
              At its core, Mo’orafrika exists for individuals who understand that style is language. Every piece is designed to communicate confidence, culture, and intention. Through precise tailoring, thoughtful fabric choices, 
              and clean, architectural silhouettes, the brand translates African identity into a modern, global context.
            </p>

            <p className={styles.paragraph}>
              There is a quiet power in its approach—where minimalism meets meaning, and simplicity carries depth. Each garment is not just worn, but experienced. Not just seen, but understood.
            </p>

             <p className={styles.paragraph}>
                The philosophy is clear:
              </p>

              <ul className={styles.paragraph}>
                <li>Intentional design over fast fashion</li>
                <li>Cultural pride without cliché</li>
                <li>Quiet luxury rooted in identity</li>
                <li>Confidence that doesn’t seek validation</li>
              </ul>

              <p className={styles.paragraph}>
                This is not nostalgia. It is evolution.
              </p>
      
            <div className={styles.quoteBlock}>
              <div className={styles.quoteLine}></div>
              <blockquote>
                Mo’orafrika is building more than clothing—it is shaping a perspective. One where African fashion is not
                an alternative, but a standard. Where identity is expressed fully, without compromise.
              </blockquote>
            </div>

          </motion.div>
        </div>
      </div>

      <Footer/>
    </main>
  );
}