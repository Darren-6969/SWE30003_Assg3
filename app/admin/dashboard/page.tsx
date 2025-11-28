"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import { TopNav } from "@/components/TopNav";

type Report = {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
};

export default function AdminDashboardPage() {
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/report");
        if (!res.ok) return;
        const data = await res.json();
        setReport(data.report);
      } catch (err) {
        console.error(err);
      }
    };
    void load();
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <TopNav title="Admin Dashboard" subtitle="Operational visibility" />

        <div className={styles.hero}>
          <div>
            <p className={styles.overline}>Admin</p>
            <h1 className={styles.heroTitle}>Dashboard</h1>
            <p className={styles.heroSubtitle}>
              Snapshot of system metrics for audit screenshots.
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
                <div className={styles.cardTitle}>Quick links</div>
                <p className={styles.cardDescription}>
                  Jump to reports or visitor-facing order views.
                </p>
              </div>
            </div>
            <div className={styles.buttonRow} style={{ marginTop: 10 }}>
              <Link className={styles.button} href="/admin/reports">
                View reports
              </Link>
              <Link className={`${styles.button} ${styles.buttonSecondary}`} href="/orders">
                Orders
              </Link>
              <Link className={`${styles.button} ${styles.buttonSecondary}`} href="/admin-bookings">
                Bookings
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
