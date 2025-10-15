import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthForm from "../components/AuthForm";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/register",
        form,
        { withCredentials: true }
      );
      setSuccess(res.data.message);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      console.error("Register error:", err);
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Create Account"
      subtitle="Register to access the Railway Asset Portal"
      form={form}
      onChange={handleChange}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      success={success}
      submitText="Register"
      toggleText="Already have an account?"
      toggleAction={() => navigate("/login")}
    />
  );
}
