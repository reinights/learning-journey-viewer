"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../api/supabaseClient";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }

    setLoading(false);
  }

  const loginWithMicrosoft = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: "http://localhost:3000/", //I think this needs to be an absolute path?
        scopes: "openid profile email",
        queryParams: { prompt: "select_account" },
      },
    });
  };

  return (
    <main>
      <h2 style={{ marginBottom: "1em" }}>Login</h2>
      <form
        onSubmit={handleLogin}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "400px",
        }}
      >
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>

      <button style={buttonStyle} onClick={loginWithMicrosoft}>
        Continue with Microsoft
      </button>
    </main>
  );
}

const inputStyle = {
  fontFamily: "Kollektif, sans-serif",
  padding: "0.75em",
  border: "1px solid var(--accent)",
  borderRadius: "4px",
  fontSize: "1rem",
  color: "var(--foreground)",
};

const buttonStyle = {
  backgroundColor: "var(--accent)",
  color: "white",
  fontWeight: "bold",
  padding: "0.75em",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontFamily: "Kollektif, sans-serif",
  fontSize: "1rem",
};
