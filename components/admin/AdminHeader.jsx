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
      transition={{ duration: 0.6 }}
      className="backdrop-blur-md bg-gradient-to-r from-purple-900/80 to-blue-900/80 text-white shadow-md sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/admin/users">
          <motion.h1
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-extrabold tracking-wide"
          >
            Admin Paneli
          </motion.h1>
        </Link>

        <nav className="flex flex-wrap gap-3 items-center text-sm font-medium">
          {navLinks.map((link) => (
            <motion.div
              key={link.href}
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href={link.href}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition duration-200 text-white shadow-lg"
          >
            Çıkış Yap
          </motion.button>
        </nav>
      </div>
    </motion.header>
  );
};

export default AdminHeader;
