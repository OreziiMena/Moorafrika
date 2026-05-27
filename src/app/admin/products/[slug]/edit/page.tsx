"use client";

import React, { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Upload, Trash2, ChevronDown } from "lucide-react";
import { handleClientError } from "@/lib/clientErrorHandler";
import Image from "next/image";
import styles from "../../new/addProduct.module.css"; 
import { toast } from "sonner";
import CloudflareR2StorageClient from "@/lib/storage";
import { CategoryContract } from "@/contracts/category";

export default function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  // Unwrap the params promise
  const { slug } = use(params);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryContract[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: "", description: "", price: "", stock_count: "", categoryId: "-1", sizes: "", imageKey: ""
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get<CategoryContract[]>("/api/categories"),
          axios.get(`/api/products/${slug}`)
        ]);
        setCategories(catRes.data);
        setFormData(prodRes.data);
        setImagePreviews([prodRes.data.imageUrl]);
      } catch (error) { handleClientError(error); }
    };
    fetchData();
  }, [slug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFiles([file]);
      setImagePreviews([URL.createObjectURL(file)]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageKey = formData.imageKey; 
      if (imageFiles.length > 0) {
        const upload = await CloudflareR2StorageClient.uploadMedia(imageFiles[0], "products");
        finalImageKey = upload.key;
      }

      const payload = {
        ...formData,
        price: Number(formData.price),
        stock_count: Number(formData.stock_count),
        categoryId: Number(formData.categoryId),
        imageKey: finalImageKey 
      };

      await axios.put(`/api/products/${slug}`, payload);
      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (error) { 
      handleClientError(error); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

const handleDelete = async () => {
  toast("Are you sure you want to delete this product?", {
    cancel: {
      label: "Cancel",
      onClick: () => console.log("Cancel clicked"), 
    },

    action: {
      label: "Yes, Delete",
      onClick: async () => {
        try {
          await axios.delete(`/api/products/${slug}`);
          toast.success("Product deleted successfully");
          router.push("/admin/products");
        } catch (error) {
          handleClientError(error);
        }
      },
    },
  });
};

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Product</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.mediaSection}>
           <div className={styles.mediaGrid}>
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className={styles.imagePreviewBox}>
                  <Image src={preview} alt="Preview" fill className={styles.previewImage} />
                </div>
              ))}
              <div className={styles.uploadTriggerBox} onClick={() => fileInputRef.current?.click()}>
                 <Upload size={24} /> <span>Change Image</span>
              </div>
           </div>
           <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />
        </div>    
       
       <div className={styles.inputGroup}>
              <label className={styles.label}>Product Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className={styles.input} />
            </div>
           
           <div className={styles.inputGroup}>
          <label className={styles.label}>Category</label>
          
          {/* Custom Dropdown Trigger */}
          <div 
            className={styles.customSelectTrigger} 
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          >
            <span>
              {formData.categoryId === "-1" 
                ? "Select Category" 
                : categories.find(c => c.id.toString() === formData.categoryId)?.name}
            </span>
                
            <ChevronDown size={16} className={isCategoryOpen ? styles.iconOpen : ""} />
          </div>

          {/* Custom Dropdown Menu */}
            {isCategoryOpen && (
            <div className={styles.customSelectMenu}>
            {/* You can remove this static 'Select Category' option if you want to force a choice */}

            {categories.map((category) => (
                <div 
                key={category.id}
                className={`${styles.customSelectOption} ${formData.categoryId === category.id.toString() ? styles.optionActive : ""}`}
                onClick={() => {
                    setFormData({ ...formData, categoryId: category.id.toString() });
                    setIsCategoryOpen(false);
                }}
                >
                {category.name}
                </div>
            ))}
            </div>
            )}
        </div>
        
        <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} className={styles.input} placeholder="Description" />
        
        <div className={styles.inputRow}>
            <input required type="number" name="price" value={formData.price} onChange={handleChange} className={styles.input} placeholder="Price" />
            <input required type="number" name="stock_count" value={formData.stock_count} onChange={handleChange} className={styles.input} placeholder="Stock" />
        </div>

        <input required type="text" name="sizes" value={formData.sizes} onChange={handleChange} className={styles.input} placeholder="Sizes (e.g. S, M, L)" />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
            {isSubmitting ? "UPDATING..." : "UPDATE PRODUCT"}
          </button>
          <button type="button" onClick={handleDelete} className={styles.deleteBtn} style={{ background: '#8B3A2B', color: 'white', padding: '0 20px', borderRadius: '4px' }}>
            <Trash2 size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}