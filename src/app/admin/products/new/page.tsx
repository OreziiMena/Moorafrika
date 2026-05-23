"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Save, Upload, X , CheckCircle2, AlertCircle} from "lucide-react";
import Link from "next/link";
import { handleClientError } from "@/lib/clientErrorHandler";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import styles from "./addProduct.module.css"; 

export default function AddNewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_count: "",
    categoryId: "1", 
    sizes: "S, M, L, XL" 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      if (imageFiles.length + filesArray.length > 10) {
        alert("You can only upload a maximum of 10 images.");
        return;
      }

      const newFiles = [...imageFiles, ...filesArray];
      setImageFiles(newFiles);

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageFiles(imageFiles.filter((_, idx) => idx !== indexToRemove));
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setImagePreviews(imagePreviews.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (imageFiles.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedData = [];

      for (const file of imageFiles) {
        const { data } = await axios.post("/api/upload-url", { 
          fileType: file.type,
          fileSize: file.size,
          folder: "products"
        });
        
        const { presignedUrl, key, url } = data;

        await axios.put(presignedUrl, file, {
          headers: { "Content-Type": file.type }
        });

        uploadedData.push({ key, url });
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock_count: Number(formData.stock_count),
        categoryId: Number(formData.categoryId),
        sizes: formData.sizes.split(",").map(s => s.trim()).filter(Boolean),
        imageKey: uploadedData[0].key, 
        thumbnailKeys: uploadedData.slice(1).map(d => d.key)
      };

      await axios.post("/api/products", payload);
      
     setStatus({ type: 'success', message: "Product added successfully!" });
     setTimeout(() => router.push("/admin"), 1200);

    } catch (error: any) {
        handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.pageWrapper}>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.title}>Add New Product</h1>

        {status && (

        <div className={`${styles.statusBanner} ${styles[status.type]}`}>
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {status.message}
        </div>
        )}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.mediaSection}>
            <h3 className={styles.sectionTitle}>Add Images</h3>
            <div className={styles.mediaGrid}>
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className={styles.imagePreviewBox}>
                  <Image src={preview} alt="Preview" fill className={styles.previewImage} />
                  {idx === 0 && <span className={styles.mainBadge}>MAIN</span>}
                  <button type="button" onClick={() => removeImage(idx)} className={styles.removeImgBtn}><X size={14} /></button>
                </div>
              ))}
              {imageFiles.length < 10 && (
                <div className={styles.uploadTriggerBox} onClick={() => fileInputRef.current?.click()}>
                  <Upload size={24} /> <span>Upload</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" multiple style={{ display: "none" }} />
          </div>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Product Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Category</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} className={styles.input}>
                <option value="1">Men</option>
                <option value="2">Women</option>
              </select>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Description</label>
            <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Price (₦)</label>
              <input required type="number" name="price" value={formData.price} onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Stock Count</label>
              <input required type="number" name="stock_count" value={formData.stock_count} onChange={handleChange} className={styles.input} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Sizes (Comma separated)</label>
            <input required type="text" name="sizes" value={formData.sizes} onChange={handleChange} className={styles.input} />
          </div>

          <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
            {isSubmitting ? "ADDING..." : "ADD PRODUCT"}
          </button>
        </form>
      </div>
    </main>
  );
}