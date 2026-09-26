"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("admin1");
  const [password, setPassword] = useState("password123");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("http://localhost:3001/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      router.push("/dashboard");
    } else {
      alert("Login failed");
    }
  }

return (
  <div className="flex h-screen items-center justify-center bg-gray-100">
    <form onSubmit={handleLogin} className="w-96 gap-4 flex flex-col rounded-lg bg-white p-8 shadow-lg">
      <h1 className="text22xl font-bold mb-4">
        Dashboard Login
      </h1>
      <input 
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        type="text"
        placeholder="Username"
        className="rounded border p-2"       
       />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        className="rounded border p-2"
      />
      <button type="submit" className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700">
        Login
      </button>
    </form>
  </div>
)
};