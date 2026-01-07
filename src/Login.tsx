// This is the registration page component that allows new users to create an account
// I will only be using placeholder logic as of right now till the backend is implemented

// imports needed for this page
import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Login failed");
        setLoading(false);
        return;
      }

      // Remembers who is logged in
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("email", data.email);

      setMessage("Login successful! Redirecting...");
      setLoading(false);

      // Clear form
      setFormData({ email: "", password: "" });

      // Redirect after short delay
      setTimeout(() => {
        navigate("/home");
      }, 800);
    } catch (err) {
      console.error(err);
      setError("Backend not reachable");
      setLoading(false);
    }
  };

    // Actual registration form
   return (
  <div className='min-h-screen flex items-center justify-center bg-cover bg-center' style={{backgroundImage: "url('/saving1.webp')"}}>
   <div className="max-w-md w-full bg-white bg-opacity-90 p-6 border rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      {message && <div className="text-green-500 mb-4">{message}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <button
            type="submit"
            className={`bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
      </form>
    </div>
  </div>
  );
};

export default Login;