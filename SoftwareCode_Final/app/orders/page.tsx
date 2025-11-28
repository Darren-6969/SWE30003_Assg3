"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../page.module.css";
import type { OrderDTO } from "@/lib/domain/domainTypes";
import { formatCurrency } from "@/lib/domain/domainHelpers";
import { TopNav, type UserSession } from "@/components/TopNav";

type FlashState = { type: "success" | "error" | "info"; text: string } | null;

export default function OrdersPage() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [flash, setFlash] = useState<FlashState>(null);

  const postFlash = (message: FlashState) => {
    setFlash(message);
    if (message) {
      setTimeout(() => setFlash(null), 3200);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setOrders([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("npopUser");
    }
    postFlash({ type: "info", text: "Signed out." });
  };

  useEffect(() => {
    const storedUser =
      typeof window !== "undefined" ? localStorage.getItem("npopUser") : null;
    if (storedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrders([]);
      return;
    }
    const loadOrders = async () => {
      try {
        const res = await fetch(
          `/api/orders/by-user?userId=${encodeURIComponent(currentUser.userId)}`
        );
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error(err);
        postFlash({ type: "error", text: "Failed to load orders." });
      }
    };
    void loadOrders();
  }, [currentUser]);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <TopNav
          title="Orders"
          subtitle="Your booking history"
          user={currentUser}
          onLogout={handleLogout}
        />

        {flash && (
          <div
            className={`${styles.flash} ${
              flash.type === "success" ? styles.success : ""
            } ${flash.type === "error" ? styles.error : ""}`}
          >
            {flash.text}
          </div>
        )}

        <section className={styles.sectionBlock}>
          <div>
            <div className={styles.sectionTitle}>Your orders</div>
            <p className={styles.sectionLead}>
              View and manage orders placed using your account. Orders are stored in the orders and
              order_items tables in the database.
            </p>
          </div>

          {!currentUser && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Login required</div>
              <p className={styles.cardDescription}>
                Please log in from the home page to view your orders.
              </p>
              <div className={styles.buttonRow} style={{ marginTop: 12 }}>
                <Link className={styles.button} href="/#auth">
                  Go to login
                </Link>
              </div>
            </div>
          )}

          {currentUser && (
            <div className={styles.card}>
              {orders.length === 0 ? (
                <div className={styles.cardDescription} style={{ marginTop: 12 }}>
                  You have not placed any orders yet.
                </div>
              ) : (
                <div className={styles.orderList}>
                  {orders.map((order) => (
                    <div key={order.orderId} className={styles.orderCard}>
                      <div className={styles.sectionHeader}>
                        <div className={styles.ticketTitle}>{order.orderId}</div>
                        <div className={styles.muted}>
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className={styles.muted}>Status: {order.status}</div>
                      <div className={styles.orderItems}>
                        {order.items.map((item) => (
                          <div key={`${order.orderId}-${item.itemId}`}>
                            {item.quantity} x {item.productName} @{" "}
                            {formatCurrency(item.lockedPrice)}
                          </div>
                        ))}
                      </div>
                      <div className={styles.sectionHeader} style={{ marginTop: 8 }}>
                        <div className={styles.muted}>Items: {order.items.length}</div>
                        <div className={styles.ticketTitle}>
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </div>
                      <div className={styles.buttonRow} style={{ marginTop: 8 }}>
                        <Link className={styles.button} href="/bookings">
                          Reschedule
                        </Link>
                        <Link
                          className={`${styles.button} ${styles.buttonSecondary}`}
                          href="/bookings"
                        >
                          Cancel booking
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
