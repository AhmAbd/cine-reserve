// components/layout/Footer.jsx
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 text-center mt-10">
      <p className="text-sm">
        © {new Date().getFullYear()} CineReserve. Tüm hakları saklıdır.
      </p>
      <div className="mt-2">
        <Link href="/about" className="text-gray-400 hover:text-white mx-2">
          Hakkımızda
        </Link>
        <Link href="/contact" className="text-gray-400 hover:text-white mx-2">
          İletişim
        </Link>
        <Link href="/privacy" className="text-gray-400 hover:text-white mx-2">
          Gizlilik
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
