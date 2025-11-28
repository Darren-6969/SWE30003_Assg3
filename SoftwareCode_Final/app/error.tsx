"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Something went wrong</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>{error.message || "Unexpected error."}</p>
      <button
        onClick={() => reset()}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid #0f766e",
          background: "#0f766e",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Retry
      </button>
    </div>
  );
}
