"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/app/page.module.css";
import { TopNav, type UserSession } from "@/components/TopNav";
import { formatCurrency } from "@/lib/domain/domainHelpers";

type AdminOrder = {
  orderId: string;
  user: { email: string; fullName: string | null };
  createdAt: string;
  status: string;
  totalAmount: number;
  items: {
    itemId: string;
    productName: string;
    quantity: number;
    lockedPrice: number;
  }[];
};

type Flash = { type: "success" | "error" | "info"; text: string } | null;

export default function AdminBookingsPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [flash, setFlash] = useState<Flash>(null);
  const [filterUser, setFilterUser] = useState("");

  const postFlash = (msg: Flash) => {
    setFlash(msg);
    if (msg) setTimeout(() => setFlash(null), 3200);
  };

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/admin/report");
      if (!res.ok) {
        throw new Error("Unauthorized");
      }
      const data = await res.json();
      const mapped = (data.report.orders as any[]).map((o) => ({
        ...o,
        user: data.report.users?.find?.((u: any) => u.userId === o.userId) ?? {
          email: "unknown",
          fullName: null,
        },
      }));
      setOrders(mapped);
    } catch (err) {
      console.error(err);
      postFlash({ type: "error", text: "Failed to load orders." });
    }
  };

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("npopUser") : null;
    if (stored) {
      try {
        const parsed: UserSession = JSON.parse(stored);
        setUser(parsed);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (user?.email === "admin@admin.com") {
      void loadOrders();
    }
  }, [user]);

  const filtered = filterUser
    ? orders.filter((o) => o.user?.email?.toLowerCase().includes(filterUser.toLowerCase()))
    : orders;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <TopNav title="Admin Bookings" subtitle="Manage user orders and tickets" user={user} />

        {flash && (
          <div
            className={`${styles.flash} ${
              flash.type === "success" ? styles.success : ""
            } ${flash.type === "error" ? styles.error : ""}`}
          >
            {flash.text}
          </div>
        )}

        <div className={styles.hero}>
          <div>
            <p className={styles.overline}>Admin</p>
            <h1 className={styles.heroTitle}>Booking management</h1>
            <p className={styles.heroSubtitle}>
              Browse all user orders; use the booking page to reschedule/cancel specific tickets.
            </p>
            <div className={styles.heroBadges}>
              <span className={styles.badge}>System-wide</span>
              <span className={styles.badge}>Admin only</span>
            </div>
          </div>
          <div className={styles.statStrip}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Orders</div>
              <div className={styles.statValue}>{orders.length}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Filter by user</div>
              <input
                className={styles.input}
                placeholder="email contains..."
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              />
            </div>
          </div>
        </div>

        <section className={styles.sectionBlock}>
          <div className={styles.card}>
            {filtered.length === 0 ? (
              <div className={styles.cardDescription}>No orders found.</div>
            ) : (
              <div className={styles.orderList}>
                {filtered.map((order) => (
                  <div key={order.orderId} className={styles.orderCard}>
                    <div className={styles.sectionHeader}>
                      <div className={styles.ticketTitle}>Order {order.orderId}</div>
                      <div className={styles.muted}>
                        {new Date(order.createdAt).toLocaleString()} · {order.status}
                      </div>
                    </div>
                    <div className={styles.mutedSmall}>
                      User: {order.user?.fullName ?? order.user?.email ?? "Unknown"} (
                      {order.user?.email ?? "n/a"})
                    </div>
                    <div className={styles.orderItems}>
                      {order.items.map((item) => (
                        <div key={item.itemId}>
                          {item.quantity} × {item.productName} @ {formatCurrency(item.lockedPrice)}
                        </div>
                      ))}
                    </div>
                    <div className={styles.sectionHeader} style={{ marginTop: 8 }}>
                      <div className={styles.muted}>Items: {order.items.length}</div>
                      <div className={styles.ticketTitle}>{formatCurrency(order.totalAmount)}</div>
                    </div>
                    <div className={styles.buttonRow} style={{ marginTop: 8 }}>
                      <Link className={styles.button} href="/bookings">
                        Reschedule / Cancel
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
