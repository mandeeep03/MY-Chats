    import { useState } from "react";
    import { API_BASE } from "./api";

    export default function Signup() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
        const res = await fetch(`${API_BASE}/users/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.msg || "Signup failed");
        } else {
            setMessage(data.msg || "User created");
            setForm({ name: "", email: "", password: "" });
        }
        } catch (err) {
        setError("Server not reachable");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

            {message && (
            <p className="text-green-600 mb-3 text-center">{message}</p>
            )}
            {error && <p className="text-red-600 mb-3 text-center">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
            <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />

            <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />

            <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />

            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
                Sign Up
            </button>
            </form>
        </div>
        </div>
    );
    }
