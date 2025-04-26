"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../../lib/firebase";
import { motion } from "framer-motion";

const AdminHeader = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    router.push("/admin/login");
  };

  const navLinks = [
    { href: "/admin/users", label: "Kullanıcılar" },
    { href: "/admin/movies", label: "Filmler" },
    { href: "/admin/cinemas", label: "Sinemalar" },
    { href: "/admin/manage", label: "Film veya Sinema Ekle" },
    { href: "/admin/messages", label: "Mesajlar" },
  ];

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-purple-900/90 to-blue-900/90 text-white shadow-lg border-b border-purple-500/20"
    >
      <div className="relative max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Subtle Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg blur-3xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Header Title */}
        <Link href="/admin/users">
          <motion.h1
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 relative z-10"
          >
            Admin Paneli
          </motion.h1>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-wrap gap-3 items-center text-sm font-medium relative z-10">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                ease: "easeOut",
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={link.href}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-300 text-white hover:text-purple-300 shadow-md"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}

          {/* Logout Button */}
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: navLinks.length * 0.1,
              duration: 0.5,
              ease: "easeOut",
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition duration-300 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/30"
          >
            Çıkış Yap
          </motion.button>
        </nav>
      </div>
    </motion.header>
  );
};

export default AdminHeader;
