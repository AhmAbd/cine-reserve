"use client";

import "../styles/globals.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Footer from "../components/layout/Footer";
import { app } from "../lib/firebase";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientLayout({ children }) {
  const [isClient, setIsClient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Only render on the client side
  if (!isClient) {
    return null;
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
            className="absolute inset-0 opacity-10 md:opacity-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 2 }}
          >
            <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 rounded-full bg-purple-600 filter blur-2xl md:blur-3xl mix-blend-overlay"></div>
            <div className="absolute bottom-1/3 right-1/4 w-40 h-40 md:w-80 md:h-80 rounded-full bg-indigo-600 filter blur-2xl md:blur-3xl mix-blend-overlay"></div>
          </motion.div>

          <div className="container mx-auto flex justify-between items-center px-4 py-3 md:px-6 md:py-4 relative z-10">
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src="/logo.png"
                  alt="CineReserve"
                  width={48}
                  height={48}
                  className="md:w-16 md:h-16 rounded-lg"
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
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
              <Link href="/bilet-sorgula">
                <motion.span
                  className="nav-link text-gray-300 font-medium hover:text-purple-400 transition-colors duration-300"
                  whileHover={{ y: -2, color: "#c084fc" }}
                  transition={{ duration: 0.3 }}
                >
                  Bilet Sorgula
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
                    className="login-button bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-purple-500/20 flex items-center gap-2"
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
                    className="login-button bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-purple-500/20 flex items-center gap-2"
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

            {/* Hamburger Icon for Mobile */}
            <button
              className="md:hidden text-white focus:outline-none"
              onClick={toggleMenu}
            >
              <motion.svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </motion.svg>
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.nav
                className="md:hidden bg-gray-900/95 backdrop-blur-lg border-t border-purple-600/30"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="flex flex-col items-center py-4 gap-4">
                  <Link href="/movies" onClick={() => setIsMenuOpen(false)}>
                    <motion.span
                      className="text-gray-300 font-medium hover:text-purple-400 text-lg"
                      whileHover={{ y: -2, color: "#c084fc" }}
                      transition={{ duration: 0.3 }}
                    >
                      Filmler
                    </motion.span>
                  </Link>
                  <Link href="/cinemas" onClick={() => setIsMenuOpen(false)}>
                    <motion.span
                      className="text-gray-300 font-medium hover:text-purple-400 text-lg"
                      whileHover={{ y: -2, color: "#c084fc" }}
                      transition={{ duration: 0.3 }}
                    >
                      Sinemalar
                    </motion.span>
                  </Link>
                  <Link
                    href="/bilet-sorgula"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <motion.span
                      className="text-gray-300 font-medium hover:text-purple-400 text-lg"
                      whileHover={{ y: -2, color: "#c084fc" }}
                      transition={{ duration: 0.3 }}
                    >
                      Bilet Sorgula
                    </motion.span>
                  </Link>
                  {user ? (
                    <>
                      <Link
                        href="/account"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <motion.span
                          className="text-gray-300 font-medium hover:text-purple-400 text-lg"
                          whileHover={{ y: -2, color: "#c084fc" }}
                          transition={{ duration: 0.3 }}
                        >
                          Hesabım
                        </motion.span>
                      </Link>
                      <motion.button
                        onClick={handleLogout}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium text-lg flex items-center gap-2"
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
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <motion.div
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium text-lg flex items-center gap-2"
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
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
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
