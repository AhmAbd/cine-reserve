"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const router = useRouter();

  // Debug rendering
  useEffect(() => {
    console.log("AdminLoginForm rendered", { email, password, error, fadeOut });
  }, [email, password, error, fadeOut]);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Form submitted", { email, password });
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data().role === "admin") {
        setFadeOut(true);
        setTimeout(() => {
          router.push("/admin/users");
        }, 600); // animasyon süresiyle eşleşiyor
      } else {
        setError("Bu kullanıcı bir admin değil.");
      }
    } catch (err) {
      setError("Giriş yapılamadı: " + err.message);
      console.error("Firebase error:", err);
    }
  };

  return (
    <div
      className={clsx(
        "fixed inset-0 h-screen w-screen bg-black flex items-center justify-center p-4 overflow-hidden transition-opacity duration-500",
        fadeOut && "opacity-0"
      )}
    >
      {/* Dark Animated Gradient Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black pointer-events-none"
        animate={{
          background: [
            "linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 50%, #0a0a0a 100%)",
            "linear-gradient(135deg, #0a0a0a 0%, #2d1a4b 50%, #0a0a0a 100%)",
            "linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 50%, #0a0a0a 100%)",
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle Glowing Orbs */}
      <motion.div
        className="absolute top-1/5 left-1/5 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [-30, 30, -30],
          y: [-30, 30, -30],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/5 right-1/5 w-80 h-80 bg-pink-900/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.5, 0.3],
          x: [30, -30, 30],
          y: [30, -30, 30],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Minimal Starry Particle Effects */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-200/50 rounded-full pointer-events-none"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.3 + 0.3,
          }}
          animate={{
            y: [null, -window.innerHeight],
            opacity: [0.6, 0],
            scale: [0.8, 0.3],
          }}
          transition={{
            duration: Math.random() * 6 + 6,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Form Container */}
      <motion.form
        onSubmit={handleLogin}
        className="relative z-20 w-full max-w-lg bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 sm:p-10 shadow-2xl border border-purple-500/20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Form Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Admin Girişi
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Admin paneline erişmek için giriş yapın
          </p>
        </motion.div>

        {/* Email Input */}
        <motion.div
          className="relative z-20 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">
            E-posta Adresi
          </label>
          <motion.input
            type="email"
            value={email}
            onChange={(e) => {
              console.log("Email input changed:", e.target.value);
              setEmail(e.target.value);
            }}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            placeholder="email@example.com"
            required
            whileHover={{ scale: 1.02 }}
            whileFocus={{
              scale: 1.02,
              boxShadow: "0 0 10px rgba(168, 85, 247, 0.3)",
            }}
          />
        </motion.div>

        {/* Password Input */}
        <motion.div
          className="relative z-20 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Şifre
          </label>
          <motion.input
            type="password"
            value={password}
            onChange={(e) => {
              console.log("Password input changed:", e.target.value);
              setPassword(e.target.value);
            }}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            placeholder="••••••••"
            required
            whileHover={{ scale: 1.02 }}
            whileFocus={{
              scale: 1.02,
              boxShadow: "0 0 10px rgba(168, 85, 247, 0.3)",
            }}
          />
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="text-red-400 text-sm text-center mb-4 bg-red-900/20 rounded-lg p-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.div
          className="relative z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold shadow-lg flex items-center justify-center"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 15px rgba(168, 85, 247, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Giriş Yap
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  );
}
