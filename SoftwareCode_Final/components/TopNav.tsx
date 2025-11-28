/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";

export type UserSession = {
  userId: string;
  fullName?: string | null;
  email: string;
};

type TopNavProps = {
  title: string;
  subtitle: string;
  user?: UserSession | null;
  onLogout?: () => void;
};

export function TopNav({
  title,
  subtitle,
  user,
  onLogout,
}: TopNavProps) {
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
  const [hydratedUser, setHydratedUser] = useState<UserSession | null>(user ?? null);

  useEffect(() => {
    if (user !== undefined) {
      setHydratedUser(user);
      return;
    }
    const stored = typeof window !== "undefined" ? localStorage.getItem("npopUser") : null;
    if (stored) {
      try {
        setHydratedUser(JSON.parse(stored));
        return;
      } catch {
        // ignore bad data
      }
    }
    setHydratedUser(null);
  }, [user]);

  // Basic session timeout: clears stored user after inactivity window.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkExpiry = () => {
      const tsRaw = localStorage.getItem("npopSessionTs");
      const ts = tsRaw ? Number(tsRaw) : 0;
      if (ts && Date.now() - ts > SESSION_TIMEOUT_MS) {
        localStorage.removeItem("npopUser");
        localStorage.removeItem("npopSessionTs");
        setHydratedUser(null);
        onLogout?.();
      }
    };
    checkExpiry();
    const markActive = () => {
      localStorage.setItem("npopSessionTs", Date.now().toString());
    };
    window.addEventListener("mousemove", markActive);
    window.addEventListener("keydown", markActive);
    const interval = window.setInterval(checkExpiry, 60_000);
    return () => {
      window.removeEventListener("mousemove", markActive);
      window.removeEventListener("keydown", markActive);
      clearInterval(interval);
    };
  }, [onLogout, SESSION_TIMEOUT_MS]);

  const sessionUser = user ?? hydratedUser;

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("npopUser");
    }
    setHydratedUser(null);
    onLogout?.();
  };

  return (
    <header className={styles.topNav}>
      <div className={styles.brand}>
        <div className={styles.brandMark} aria-hidden="true">
          <svg
            width="26"
            height="26"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 4c-.8 0-1.5.4-1.9 1L8 14.5c-.7 1.2.2 2.7 1.6 2.7h2.9l-3.6 6.3C8 24.7 8.8 26 10.1 26H22c1.3 0 2.1-1.3 1.5-2.5L19.9 17H22c1.4 0 2.3-1.5 1.6-2.7L17.9 5c-.4-.6-1.1-1-1.9-1Z"
              fill="#fff"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.2"
            />
            <path
              d="M14.5 12 16 9.5 17.5 12h-3ZM14 14h4l2 3.5h-8L14 14Zm-1.8 7H20l1.6 3H12.2l1.6-3Z"
              fill="#0a84ff"
              opacity="0.9"
            />
          </svg>
        </div>
        <div>
          <div className={styles.brandTitle}>{title}</div>
          <div className={styles.brandSub}>{subtitle}</div>
        </div>
      </div>
      <nav className={styles.topLinks} aria-label="Primary">
        {sessionUser?.email === "admin@admin.com" ? (
          <>
            <Link className={styles.navLink} href="/admin/dashboard">
              Admin
            </Link>
            <Link className={styles.navLink} href="/admin/reports">
              Reports
            </Link>
            <Link className={styles.navLink} href="/admin-bookings">
              Bookings
            </Link>
          </>
        ) : (
          <>
            <Link className={styles.navLink} href="/">
              Home
            </Link>
            <Link className={styles.navLink} href="/parks">
              Parks
            </Link>
            <Link className={styles.navLink} href="/cart">
              Cart
            </Link>
            <Link className={styles.navLink} href="/orders">
              Orders
            </Link>
          </>
        )}
        {sessionUser && (
          <span className={styles.navUser}>{sessionUser.fullName ?? sessionUser.email}</span>
        )}
        {sessionUser ? (
          <button
            className={`${styles.button} ${styles.navCta}`}
            type="button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        ) : (
          <Link className={`${styles.button} ${styles.navCta}`} href="/auth/login">
            Log in
          </Link>
        )}
      </nav>
    </header>
  );
}
