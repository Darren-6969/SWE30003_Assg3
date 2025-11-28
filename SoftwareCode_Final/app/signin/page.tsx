"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import styles from "../page.module.css";
import { TopNav, type UserSession } from "@/components/TopNav";

type FlashState = { type: "success" | "error" | "info"; text: string } | null;

export default function SignInPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [authMode, setAuthMode] = useState<"register" | "login">("login");
  const [flash, setFlash] = useState<FlashState>(null);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const postFlash = (message: FlashState) => {
    setFlash(message);
    if (message) {
      setTimeout(() => setFlash(null), 3200);
    }
  };

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("npopUser") : null;
    if (stored) {
      try {
        const parsed: UserSession = JSON.parse(stored);
        // This pattern is used throughout the app for session hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentUser(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        postFlash({ type: "error", text: data.message ?? "Registration failed." });
        return;
      }
      postFlash({ type: "success", text: data.message });
      setAuthMode("login");
      setRegisterPassword("");
    } catch (err) {
      console.error(err);
      postFlash({ type: "error", text: "Registration failed." });
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        postFlash({ type: "error", text: data.message ?? "Login failed." });
        return;
      }
      const session: UserSession = data.user;
      setCurrentUser(session);
      if (typeof window !== "undefined") {
        localStorage.setItem("npopUser", JSON.stringify(session));
      }
      postFlash({
        type: "success",
        text: `Welcome back, ${session.fullName ?? session.email}.`,
      });
      router.push("/");
    } catch (err) {
      console.error(err);
      postFlash({ type: "error", text: "Login failed." });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("npopUser");
    }
    postFlash({ type: "info", text: "Signed out." });
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <TopNav
          title="Sign in"
          subtitle="Access your National Parks account"
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
            <div className={styles.sectionTitle}>Welcome back</div>
            <p className={styles.sectionLead}>
              Sign in to continue booking park tickets or review your existing orders. You can also
              create a new account if this is your first visit.
            </p>
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <div className={styles.cardTitle}>Account access</div>
                  <p className={styles.cardDescription}>
                    Use your email and password to sign in, or register a new visitor account.
                  </p>
                </div>
                <div className={styles.buttonRow}>
                  <button
                    className={`${styles.button} ${
                      authMode === "login" ? "" : styles.buttonSecondary
                    }`}
                    type="button"
                    onClick={() => setAuthMode("login")}
                  >
                    Log in
                  </button>
                  <button
                    className={`${styles.button} ${
                      authMode === "register" ? "" : styles.buttonSecondary
                    }`}
                    type="button"
                    onClick={() => setAuthMode("register")}
                  >
                    Register
                  </button>
                </div>
              </div>

              {authMode === "login" ? (
                <form className={styles.form} onSubmit={handleLogin} autoComplete="off">
                  <div className={styles.field}>
                    <label className={styles.label}>Email</label>
                    <input
                      className={styles.input}
                      type="email"
                      value={loginEmail}
                      autoComplete="off"
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Password</label>
                    <input
                      className={styles.input}
                      type="password"
                      value={loginPassword}
                      autoComplete="off"
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <div className={styles.buttonRow}>
                    <button className={styles.button} type="submit">
                      Log in
                    </button>
                    {currentUser && (
                      <button
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        type="button"
                        onClick={handleLogout}
                      >
                        Sign out
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <form className={styles.form} onSubmit={handleRegister} autoComplete="off">
                  <div className={styles.field}>
                    <label className={styles.label}>Full name</label>
                    <input
                      className={styles.input}
                      placeholder="Jane Ranger"
                      value={registerName}
                      autoComplete="off"
                      onChange={(e) => setRegisterName(e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Email</label>
                    <input
                      className={styles.input}
                      type="email"
                      placeholder="you@email.com"
                      value={registerEmail}
                      autoComplete="off"
                      onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Password</label>
                    <input
                      className={styles.input}
                      type="password"
                      value={registerPassword}
                      autoComplete="new-password"
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                  </div>
                  <div className={styles.buttonRow}>
                    <button className={styles.button} type="submit">
                      Create account
                    </button>
                  </div>
                </form>
              )}

              {currentUser ? (
                <div className={styles.cardDescription} style={{ marginTop: 10 }}>
                  You are signed in as <strong>{currentUser.fullName ?? currentUser.email}</strong>{" "}
                  ({currentUser.email}). Use the navigation above to start a new booking or review
                  your orders.
                </div>
              ) : (
                <div className={styles.cardDescription} style={{ marginTop: 10 }}>
                  Once you sign in, this account will be used to keep all of your bookings together.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
