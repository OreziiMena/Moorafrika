"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./Gallery.module.css";

const galleryImages = [
  {
    id: 1,
    src: "/Assets/brand-image-1.JPEG",
    alt: "Fashion Look 5",
    featured: false,
  },
  {
    id: 2,
    src: "/Assets/brand-image-12.JPEG",
    alt: "Fashion Look 5",
    featured: false,
  },
  {
    id: 3,
    src: "/Assets/brand-image-10.JPEG",
    alt: "Fashion Look 5",
    featured: false,
  },
  {
    id: 4,
    src: "/Assets/brand-image-5.JPEG",
    alt: "Fashion Look 5",
    featured: false,
  },
  {
    id: 5,
    src: "/Assets/brand-image-4.JPEG",
    alt: "Fashion Look 5",
    featured: false,
  },
  {
    id: 6,
    src: "/Assets/brand-image-6.JPEG",
    alt: "Fashion Look 5",
    featured: false,
  },{
    id: 7,
    src: "/Assets/brand-image-7.JPEG",
    alt: "Fashion Look 5",
    featured: false,
  },
  {
    id: 8,
    src: "/Assets/brand-image-8.JPEG",
    alt: "Fashion Look 5",
    featured: false,
  },
  {
    id: 9,
    src: "/Assets/brand-image-9.JPEG",  
    alt: "Fashion Look 5",
    featured: false,
  },
  {
    id: 10,
    src: "/Assets/brand-image-14.JPEG",
    alt: "Fashion Look 5",
    featured: false,
  },
  {
    id: 11,
    src: "/Assets/brand-image-11.JPEG",
    alt: "Fashion Look 5",
    featured: false,
  },
];

export default function Gallery() {
  return (
    <section className={styles.gallerySection}>
      <div className={styles.container}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={styles.header}
        >
          <span className={styles.title}>GALLERY</span>
          <h2 className={styles.subtitle}>Check Out Our Custom-made Pieces</h2>
        </motion.div>

        <div className={styles.grid}>
          {galleryImages.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`${styles.imageWrapper} ${img.featured ? styles.featuredImage : ''}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                unoptimized
                className={styles.image}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
