"use client";

import React, { useState } from "react";
import Link from "next/link";
import AppLogo from "@/components/ui/AppLogo";
import Icon from "@/components/ui/AppIcon";

export default function ManagementPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 800));
    if (password.length < 4) {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
      return;
    }
    setLoggedIn(true);
    setLoading(false);
  };

  if (loggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircleIcon" size={32} className="text-green-600" variant="solid" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Management Portal</h2>
          <p className="text-gray-500 mb-6">You are now logged in as management staff.</p>
          <button
            onClick={() => { setLoggedIn(false); setEmail(""); setPassword(""); }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary-dark transition-all duration-300"
          >
            <Icon name="ArrowRightOnRectangleIcon" size={16} variant="solid" />
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex flex-col items-center justify-center p-6">
      {/* Back to Home */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/homepage"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <Icon name="ArrowLeftIcon" size={14} />
          Back to Home
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <AppLogo className="h-16 w-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 font-heading">Management Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Sri Saraswathi Vidhya Mandir</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon name="EnvelopeIcon" size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="management@ssvm.edu.in"
                required
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon name="LockClosedIcon" size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
              <Icon name="ExclamationCircleIcon" size={15} variant="solid" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <Icon name="LockClosedIcon" size={15} variant="solid" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Admin access?{" "}
          <Link href="/admin-panel" className="text-primary hover:underline font-medium">
            Go to Admin Panel
          </Link>
        </p>
      </div>
    </div>
  );
}
