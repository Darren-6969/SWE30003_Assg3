"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import { TopNav } from "@/components/TopNav";

type OrderEntry = {
  orderId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
};

type ReportPayload = {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  orders: OrderEntry[];
};

export default function AdminReportsPage() {
  const [report, setReport] = useState<ReportPayload | null>(null);

  const loadReport = async () => {
    try {
      const res = await fetch("/api/admin/report");
      if (!res.ok) return;
      const data = await res.json();
      setReport(data.report);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void loadReport();
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <TopNav title="Admin Reports" subtitle="System-wide orders and revenue" />

        <div className={styles.hero}>
          <div>
            <p className={styles.overline}>Admin</p>
            <h1 className={styles.heroTitle}>Reports</h1>
            <p className={styles.heroSubtitle}>
              System-wide orders and revenue for security and audit evidence.
            </p>
            <div className={styles.heroBadges}>
              <span className={styles.badge}>Orders</span>
              <span className={styles.badge}>Revenue</span>
              <span className={styles.badge}>Users</span>
            </div>
          </div>
          <div className={styles.statStrip}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Users</div>
              <div className={styles.statValue}>{report?.totalUsers ?? 0}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Orders</div>
              <div className={styles.statValue}>{report?.totalOrders ?? 0}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Revenue</div>
              <div className={styles.statValue}>
                ${((report?.totalRevenue ?? 0) as number).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <section className={styles.sectionBlock}>
          <div className={styles.card}>
            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.cardTitle}>Orders</div>
                <p className={styles.cardDescription}>
                  Pulled from ReportService for audit and security evidence.
                </p>
              </div>
              <button
                type="button"
                onClick={loadReport}
                className={styles.button}
              >
                Refresh
              </button>
            </div>
            <div className={styles.orderList}>
              {(report?.orders ?? []).map((order) => (
                <div key={order.orderId} className={styles.orderCard}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.ticketTitle}>Order {order.orderId}</div>
                    <span className={styles.pill}>{order.status}</span>
                  </div>
                  <div className={styles.muted}>
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                  <div className={styles.sectionHeader} style={{ marginTop: 8 }}>
                    <div className={styles.muted}>Total</div>
                    <div className={styles.ticketTitle}>${order.totalAmount.toFixed(2)}</div>
                  </div>
                </div>
              ))}
              {!report?.orders?.length && (
                <div className={styles.cardDescription} style={{ marginTop: 10 }}>
                  No orders yet. Run a checkout to populate this view.
                </div>
              )}
            </div>
            <div className={styles.buttonRow} style={{ marginTop: 12 }}>
              <Link className={`${styles.button} ${styles.buttonSecondary}`} href="/admin/dashboard">
                Back to dashboard
              </Link>
              <Link className={`${styles.button} ${styles.buttonSecondary}`} href="/orders">
                Visitor orders view
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
