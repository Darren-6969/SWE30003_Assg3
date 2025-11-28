/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import { TopNav, type UserSession } from "@/components/TopNav";

type FlashState = { type: "success" | "error" | "info"; text: string } | null;

export default function Home() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [flash, setFlash] = useState<FlashState>(null);

  const postFlash = (message: FlashState) => {
    setFlash(message);
    if (message) {
      setTimeout(() => setFlash(null), 3200);
    }
  };

  const loadOrderCount = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/orders/by-user?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrderCount(data.orders.length);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("npopUser") : null;
    if (stored) {
      try {
        const parsed: UserSession = JSON.parse(stored);
        setCurrentUser(parsed);
      } catch {
        // ignore parse failure
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      void loadOrderCount(currentUser.userId);
    } else {
      setOrderCount(0);
    }
  }, [currentUser, loadOrderCount]);

  const handleLogout = () => {
    setCurrentUser(null);
    setOrderCount(0);
    if (typeof window !== "undefined") {
      localStorage.removeItem("npopUser");
    }
    postFlash({ type: "info", text: "Signed out." });
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <TopNav
          title="National Parks Portal"
          subtitle="Book tickets and track orders"
          user={currentUser}
          onLogout={handleLogout}
        />

        <section className={styles.hero} aria-labelledby="hero-heading">
          <div>
            <p className={styles.overline}>Plan your visit</p>
            <h1 id="hero-heading" className={styles.heroTitle}>
              Reserve park tickets and manage your bookings in one place.
            </h1>
            <p className={styles.heroSubtitle}>
              Create an account, choose parks and products, complete checkout, and return any time
              to review your confirmed orders.
            </p>
            <div className={styles.heroBadges}>
              <span className={styles.badge}>Simple booking flow</span>
              <span className={styles.badge}>Your orders, always available</span>
              <span className={styles.badge}>Designed for visitors</span>
            </div>
            <div className={styles.buttonRow} style={{ marginTop: 14 }}>
              <button
                className={styles.button}
                type="button"
                onClick={() => {
                  if (currentUser) {
                    router.push("/cart");
                  } else {
                    router.push("/signin");
                  }
                }}
              >
                {currentUser ? "Start a new booking" : "Get started"}
              </button>
              <Link className={`${styles.button} ${styles.buttonSecondary}`} href="/orders">
                View my orders
              </Link>
            </div>
          </div>
          <div>
            <div className={styles.statStrip}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Account</div>
                <div className={styles.statValue}>
                  {currentUser ? "Signed in" : "Guest"}
                </div>
                <div className={styles.mutedSmall}>
                  {currentUser ? currentUser.email : "Sign in to keep your bookings"}
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Orders</div>
                <div className={styles.statValue}>{orderCount}</div>
                <div className={styles.mutedSmall}>
                  {orderCount ? "View details on Orders page" : "No bookings yet"}
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Next step</div>
                <div className={styles.statValue}>
                  {currentUser ? "Choose tickets" : "Create an account"}
                </div>
                <div className={styles.mutedSmall}>
                  {currentUser
                    ? "Go to Cart to add products"
                    : "Use the form below to register"}
                </div>
              </div>
            </div>
          </div>
        </section>

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
            <div className={styles.sectionTitle}>
              {currentUser ? "Welcome back" : "Sign in or create an account"}
            </div>
            <p className={styles.sectionLead}>
              {currentUser
                ? "You are signed in. Use the links above to pick a park, add tickets in your cart, and review your orders."
                : "Use the dedicated sign-in page to log in or register before you book tickets."}
            </p>
          </div>
          <div className={styles.card}>
            {currentUser ? (
              <>
                <p className={styles.cardDescription}>
                  Signed in as <strong>{currentUser.fullName ?? currentUser.email}</strong> (
                  {currentUser.email}). You currently have {orderCount}{" "}
                  {orderCount === 1 ? "booking" : "bookings"}.
                </p>
                <div className={styles.buttonRow} style={{ marginTop: 12 }}>
                  <button
                    className={styles.button}
                    type="button"
                    onClick={() => router.push("/cart")}
                  >
                    Go to cart
                  </button>
                  <Link
                    className={`${styles.button} ${styles.buttonSecondary}`}
                    href="/orders"
                  >
                    View my orders
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className={styles.cardDescription}>
                  You are browsing as a guest. Continue to the sign-in page to create an account or
                  log in, then return here to start booking.
                </p>
                <div className={styles.buttonRow} style={{ marginTop: 12 }}>
                  <button
                    className={styles.button}
                    type="button"
                    onClick={() => router.push("/signin")}
                  >
                    Go to sign in
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
