import React, { useState } from 'react';
import api from '../api/axios';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');

  const token = new URLSearchParams(window.location.search).get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/auth/reset-password', {
        token,
        password
      });

      alert("Password reset successful");
      window.location.href = "/login";
    } catch (err: any) {
      alert(err.response?.data?.detail || "Error");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow w-80">
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-4"
        />

        <button className="bg-green-600 text-white w-full py-2 rounded">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;