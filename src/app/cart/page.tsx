"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react"; // Changed to Trash2 to match your high-end design
import { useCartStore } from "../store/cartStore";
import styles from "./page.module.css";
import Navbar from "../../components/Navbar"; 
import Footer from "@/components/Footer";

export default function CartPage() {
  const { items, removeItem, updateQuantity, cartTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <main className={styles.emptyCart}>
         <Navbar />
        <div className={styles.empty}>
        <h1 className={styles.title}>Your collection is empty</h1>
        <Link href="/collections" className={styles.continueBtn}>
          DISCOVER PIECES
        </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
<main className={styles.pageWrapper}>
<Navbar />
<header className={styles.header}>
<h1 className={styles.title}>Your Shopping Cart</h1>
</header>

<div className={styles.layout}>
{/* LEFT COLUMN: The Table */}
<div className={styles.tableContainer}>
    <table className={styles.table}>
    <thead>
        <tr>
        <th>THUMBNAIL</th>
        <th>PRODUCT TITLE</th>
        <th>PRICE</th>
        <th>QUANTITY</th>
        <th>TOTAL</th>
        <th>REMOVE</th>
        </tr>
    </thead>
    <tbody>
        {items.map((item) => {
        // Calculate the total for this row (price * quantity)
        const rowTotal = item.product.price * item.quantity;

        return (
            <tr key={item.id}>
            <td className={styles.thumbnailCell}>
                <div className={styles.imageWrapper}>
                <Image 
                    src={item.product.imageUrl} 
                    alt={item.product.name} 
                    fill 
                    className={styles.image} 
                />
                </div>
            </td>
            <td className={styles.titleCell}>
                <h2>{item.product.name}</h2>
                {item.size && <p>{item.size}</p>}
            </td>
            
            {/* Add the Naira symbol and commas back for the display */}
            <td>₦{item.product.price.toLocaleString()}</td>
            
            <td>
                <div className={styles.qtySelector}>
                {/* Minus Button */}
                <button 
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                >
                    −
                </button>
                
                {/* The Number Input */}
                <input 
                    type="number" 
                    min="1" 
                    value={item.quantity} 
                    onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                    className={styles.qtyInput}
                />

                {/* Plus Button */}
                <button 
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                >
                    +
                </button>
                </div>
            </td>
            <td className={styles.totalCell}>
                {/* Format the calculated row total */}
                ₦{rowTotal.toLocaleString()}
            </td>
            <td className={styles.removeCell}>
                <button onClick={() => removeItem(item.product.id)} className={styles.removeBtn}>
                <Trash2 size={18} strokeWidth={1.5} />
                </button>
            </td>
            </tr>
        );
        })}
    </tbody>
    </table>
</div>

{/* RIGHT COLUMN: Cart Summary */}
<aside className={styles.summaryContainer}>
    <div className={styles.summaryBox}>
    <h2 className={styles.summaryTitle}>Cart Summary</h2>
    
    <div className={styles.summaryRow}>
        <span>Subtotal</span>
        <span>₦{cartTotal().toLocaleString()}</span>
    </div>
    
    <div className={styles.summaryRowTotal}>
        <span>Total</span>
        <span>₦{cartTotal().toLocaleString()}</span>
    </div>

    <button className={styles.checkoutBtn}>
        PROCEED TO CHECKOUT
    </button>
    </div>
</aside>
</div>
<Footer />
</main>
);
}