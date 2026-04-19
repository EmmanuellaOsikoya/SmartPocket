// This is the registration page component that allows new users to create an account

// imports needed for this page
import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';

const Register: React.FC = () => {
  // Hook to programmatically navigate between routes
    const navigate = useNavigate();
  // State to store form input values for email and password  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

    // Function to handle registration form submission
    const handleRegister = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }), // Sends form data as JSON
    });

    // Parse response from backend
    const data = await res.json();

    // Handle failed registration response
    if (!res.ok) {
      alert(data.detail || "Registration failed");
      return;
    }

    // On successful registration, show success message and navigate to login page
    alert("Account created!");
    navigate("/home");
  } catch (err) {
    console.error(err);
    alert("Backend not reachable");
  }
};


    // Actual registration form
   return (

  <div className='min-h-screen flex items-center justify-center bg-cover bg-center' style={{backgroundImage: "url('/saving2.webp')"}}>
   <div className="max-w-md w-full bg-white bg-opacity-90 p-6 border rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Create Account</h2>

      <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Create Account
        </button>
      <p className='text-center text-sm mt-4'>
        Already have an account? <a href="/login" className="text-blue-500 hover:underline">Log in here</a>
      </p>

    </div>
  </div>
  );
};

export default Register;