"use client";

import "../styles/globals.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Footer from "../components/layout/Footer";
import { app } from "../lib/firebase";
import { motion } from "framer-motion";

export default function ClientLayout({ children }) {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Set isClient to true only in the browser
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Admin sayfasını kontrol et
  const isAdminPage = pathname.startsWith("/admin");

  // Header ve footer'ı gizlemek için koşul
  const hiddenPaths = [
    "/login",
    "/register",
    "/reset-password",
    "/forgot-password",
  ];
  const showHeader = !hiddenPaths.includes(pathname) && !isAdminPage;
  const showFooter = !hiddenPaths.includes(pathname) && !isAdminPage;

  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    setUser(null);
    router.push("/");
  };

  // Only render on the client side
  if (!isClient) {
    return null; // Prevents rendering during SSR
  }

  return (
    <>
      {showHeader && (
        <motion.header
          className="custom-header bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg relative overflow-hidden"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 opacity-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 2 }}
          >
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600 filter blur-3xl mix-blend-overlay"></div>
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-600 filter blur-3xl mix-blend-overlay"></div>
          </motion.div>

          <div
            className="container relative z-10"
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem",
            }}
          >
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src="/logo.png"
                  alt="CineReserve"
                  width={64}
                  height={64}
                  style={{ borderRadius: "0.5rem" }}
                />
              </motion.div>
            </Link>

            <nav
              style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}
            >
              <Link href="/movies">
                <motion.span
                  className="nav-link text-gray-300 font-medium hover:text-purple-400 transition-colors duration-300"
                  whileHover={{ y: -2, color: "#c084fc" }}
                  transition={{ duration: 0.3 }}
                >
                  Filmler
                </motion.span>
              </Link>
              <Link href="/cinemas">
                <motion.span
                  className="nav-link text-gray-300 font-medium hover:text-purple-400 transition-colors duration-300"
                  whileHover={{ y: -2, color: "#c084fc" }}
                  transition={{ duration: 0.3 }}
                >
                  Sinemalar
                </motion.span>
              </Link>

              {user ? (
                <>
                  <Link href="/account">
                    <motion.span
                      className="nav-link text-gray-300 font-medium hover:text-purple-400 transition-colors duration-300"
                      whileHover={{ y: -2, color: "#c084fc" }}
                      transition={{ duration: 0.3 }}
                    >
                      Hesabım
                    </motion.span>
                  </Link>
                  <motion.button
                    onClick={handleLogout}
                    className="login-button bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-purple-500/20 flex items-center gap-2"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Çıkış Yap
                  </motion.button>
                </>
              ) : (
                <Link href="/login">
                  <motion.div
                    className="login-button bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-purple-500/20 flex items-center gap-2"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm10.293 4.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L10 8.586l2.293-2.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Giriş Yap / Kayıt Ol
                  </motion.div>
                </Link>
              )}
            </nav>
          </div>
        </motion.header>
      )}

      <div className="main">
        <div className="gradient" />
      </div>

      <main className="app">{children}</main>

      {showFooter && <Footer />}
    </>
  );
}
