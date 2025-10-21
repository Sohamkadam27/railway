import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthForm from "../components/AuthForm";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/login",
        form,
        { withCredentials: true }
      );

      // Save user info in localStorage for auth check
      localStorage.setItem("auth", JSON.stringify(res.data.user));
      setSuccess("Login successful! Redirecting...");

      // Redirect after short delay
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Login"
      subtitle="Sign in to your Railway Asset Portal"
      form={form}
      onChange={handleChange}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      success={success}
      submitText="Login"
      toggleText="Don’t have an account?"
      toggleAction={() => navigate("/register")}
    />
  );
}
