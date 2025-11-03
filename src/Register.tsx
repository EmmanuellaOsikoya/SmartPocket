// This is the registration page component that allows new users to create an account
// I will only be using placeholder logic as of right now till the backend is implemented

// imports needed for this page
import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Registration successful! Bringing you to the main page...');
        //Clears the form
        setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        });

        setTimeout(() => {
            navigate('/home');
        }, 800);

    }

    // Actual registration form
   return (
   <div className="bg-red-200 p-10">  
      <h2 className="text-2xl font-bold mb-4">Create Account</h2>

      {message && <div className="text-green-500 mb-4">{message}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="username"
          placeholder="Full Name"
          value={formData.username}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          Register
        </button>
      </form>

      <p className='text-center text-sm mt-4'>
        Already have an account? <a href="/login" className="text-blue-500 hover:underline">Log in here</a>
      </p>

    </div>
  );
};

export default Register;