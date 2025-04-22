'use client';

import Link from "next/link";
import { motion } from "framer-motion";

const footerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  },
};

const linkHover = {
  hover: {
    scale: 1.1,
    color: "#ffffff",
    transition: { type: "spring", stiffness: 300 },
  },
};

const Footer = () => {
  return (
    <motion.footer
      className="bg-gray-900 text-white py-6 text-center mt-0"
      initial="hidden"
      animate="visible"
      variants={footerVariants}
    >
      <p className="text-sm opacity-80 hover:opacity-100 transition-opacity duration-300">
        © {new Date().getFullYear()} CineReserve. Tüm hakları saklıdır.
      </p>
      <div className="mt-4 flex justify-center space-x-6">
        {["/about", "/contact", "/privacy"].map((href, i) => (
          <motion.div key={i} variants={linkHover} whileHover="hover">
            <Link href={href} className="text-gray-400">
              {href === "/about"
                ? "Hakkımızda"
                : href === "/contact"
                ? "İletişim"
                : "Gizlilik"}
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.footer>
  );
};

export default Footer;
