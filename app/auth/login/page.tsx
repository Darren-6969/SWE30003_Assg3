"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/app/page.module.css";
import { TopNav } from "@/components/TopNav";

type Flash = { type: "success" | "error"; text: string } | null;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [flash, setFlash] = useState<Flash>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlash(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFlash({ type: "error", text: data.message ?? "Login failed" });
        return;
      }
      setFlash({ type: "success", text: data.message ?? "Login successful" });
      if (typeof window !== "undefined") {
        localStorage.setItem("npopUser", JSON.stringify(data.user));
        localStorage.setItem("npopSessionTs", Date.now().toString());
      }
      setTimeout(() => router.push("/"), 500);
    } catch (err) {
      console.error(err);
      setFlash({ type: "error", text: "Login failed" });
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <TopNav title="Log in" subtitle="Access your National Parks account" />

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
            <div className={styles.sectionTitle}>Welcome back</div>
            <p className={styles.sectionLead}>
              Sign in to continue booking park tickets or review your existing orders.
            </p>
          </div>

          <div className={styles.card}>
            <form className={styles.form} onSubmit={handleLogin}>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
              <div className={styles.buttonRow}>
                <button className={styles.button} type="submit">
                  Log in
                </button>
                <Link className={`${styles.button} ${styles.buttonSecondary}`} href="/auth/register">
                  Create account
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
