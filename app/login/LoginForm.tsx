import Link from "next/link";

export function LoginForm() {
  return (
    <div style={{ maxWidth: 400 }}>
      <h1 style={{ margin: "0 0 12px", fontSize: "1.5rem", fontWeight: 700 }}>
        Meld aan
      </h1>
      <p style={{ margin: "0 0 20px", lineHeight: 1.5, color: "#6B6B6B" }}>
        Meldfunksie kom nog. Gebruik intussen die winkel as gas.
      </p>
      <Link
        href="/shop"
        style={{
          display: "inline-flex",
          minHeight: 44,
          alignItems: "center",
          fontWeight: 600,
          color: "#2E5E3E",
        }}
      >
        ← Terug na winkel
      </Link>
    </div>
  );
}
