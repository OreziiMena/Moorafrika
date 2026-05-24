"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Package, MapPin, Eye, Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { handleClientError } from "@/lib/clientErrorHandler";
import styles from "./adminOrders.module.css";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // State for tracking which order is currently being edited
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNote, setEditNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch All Orders (Admin Route)
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      // Hitting the admin endpoint you were debugging earlier!
      const response = await axios.get("/api/orders/admin?limit=50"); 
      setOrders(response.data?.data || response.data);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Handle Saving Updates
  const handleSaveUpdate = async (orderId: string) => {
    try {
      setIsSaving(true);
      // Assuming your backend has a patch endpoint for admin updates
      await axios.patch(`/api/orders/${orderId}`, {
        status: editStatus,
        admin_note: editNote // Using the column we fixed earlier!
      });
      
      // Reset edit state and refresh list
      setEditingOrderId(null);
      await fetchOrders();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (order: any) => {
    setEditingOrderId(order.id);
    setEditStatus(order.status);
    setEditNote(order.admin_note || order.adminNote || "");
  };

  // 3. Filtering Logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (order.contactName && order.contactName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatNaira = (amount: number) => {
    const validAmount = amount || 0;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(validAmount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* Header Section */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Manage Orders</h1>
            <p className={styles.subtitle}>Review and update customer orders</p>
          </div>
          <div className={styles.orderCount}>
            <Package size={20} />
            <span className={styles.countNumber}>{orders.length}</span>
            <span className={styles.countText}>total<br />orders</span>
          </div>
        </header>

        {/* Filters Card */}
        <div className={styles.filtersCard}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterWrapper}>
            <select 
              className={styles.nativeSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className={styles.loadingState}>Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>No orders found matching your criteria.</div>
        ) : (
          <div className={styles.ordersList}>
            {filteredOrders.map((order) => {
              const isEditing = editingOrderId === order.id;
              
              return (
                <article key={order.id} className={styles.orderCard}>
                  
                  {/* Card Header */}
                  <div className={styles.cardHeader}>
                    <h2 className={styles.orderId}>
                      Order #{order.id.split('-')[0].toUpperCase()}
                    </h2>
                    
                    {/* Status Display or Edit Dropdown */}
                    {isEditing ? (
                      <select 
                        className={styles.statusEditSelect}
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    ) : (
                      <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                        <Package size={14} />
                        {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                      </span>
                    )}
                  </div>

                  {/* Card Meta Data */}
                  <div className={styles.cardMeta}>
                    <span className={styles.metaItem}>
                      📅 {formatDate(order.createdAt || order.created_at)}
                    </span>
                    <span className={`${styles.metaItem} ${styles.metaPrice}`}>
                      {formatNaira(order.totalAmount)}
                    </span>
                    <span className={styles.metaItem}>
                      {order.orderItems?.length || 0} items
                    </span>
                  </div>

                  {/* Customer Info (Admin Specific) */}
                  <div className={styles.customerInfo}>
                     <span className={styles.customerName}>{order.contactName}</span>
                     <span>{order.contactEmail}</span>
                  </div>

                  {/* Item Preview */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className={styles.itemsListPreview}>
                      {order.orderItems.map((item: any) => {
                        const itemImage = item.product?.imageUrl || item.product?.image || "/placeholder.png";
                        return (
                          <div key={item.id} className={styles.itemPreview}>
                            <div className={styles.itemImageWrapper}>
                              <Image 
                                src={itemImage} 
                                alt={item.product?.name || "Product"} 
                                fill 
                                unoptimized
                                className={styles.itemImage}
                              />
                            </div>
                            <div className={styles.itemDetails}>
                              <h3 className={styles.itemName}>{item.product?.name}</h3>
                              <p className={styles.itemQty}>Qty: {item.quantity}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Admin Note Editing Area */}
                  {isEditing && (
                    <div className={styles.editSection}>
                      <label className={styles.editLabel}>Admin Note (Internal only)</label>
                      <textarea 
                        className={styles.noteInput}
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="Add tracking number or internal notes here..."
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Actions Area */}
                  <div className={styles.cardActions}>
                    {isEditing ? (
                      <div className={styles.editActionButtons}>
                        <button 
                          className={styles.cancelEditBtn} 
                          onClick={() => setEditingOrderId(null)}
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                        <button 
                          className={styles.saveBtn} 
                          onClick={() => handleSaveUpdate(order.id)}
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save Updates"}
                        </button>
                      </div>
                    ) : (
                      <button className={styles.startEditBtn} onClick={() => startEditing(order)}>
                        <Edit size={16} /> Quick Update
                      </button>
                    )}
                    
                    <Link href={`/admin/orders/${order.id}`} className={styles.viewDetailsBtn}>
                      <Eye size={16} /> View Full Details
                    </Link>
                  </div>

                  {/* Shipping Preview */}
                  <div className={styles.shippingPreview}>
                    <MapPin size={16} />
                    <span>Shipping to: {order.contactName}, {order.streetAddress}, {order.city}</span>
                  </div>
                  
                  {/* Display Note if it exists and we aren't editing */}
                  {!isEditing && (order.admin_note || order.adminNote) && (
                     <div className={styles.existingNote}>
                       <strong>Admin Note:</strong> {order.admin_note || order.adminNote}
                     </div>
                  )}

                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}