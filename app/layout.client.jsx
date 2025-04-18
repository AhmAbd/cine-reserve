"use client";

import "../styles/globals.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Footer from "../components/layout/Footer";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const hiddenPaths = ["/login", "/register", "/reset-password"];
  const showHeader = !hiddenPaths.includes(pathname);
  const showFooter = !hiddenPaths.includes(pathname); // <-- FOOTER GÖRÜNÜRLÜK KONTROLÜ

  return (
    <>
      {showHeader && (
        <header className="custom-header">
          <div
            className="container"
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
              <Image
                src="/images/cinereserve.png"
                alt="CineReserve"
                width={64}
                height={64}
                style={{ borderRadius: "0.5rem" }}
              />
            </Link>

            <nav
              style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}
            >
              <Link href="/movies" className="nav-link">
                Filmler
              </Link>
              <Link href="/cinemas" className="nav-link">
                Sinemalar
              </Link>
              <Link href="/login" className="login-button">
                Giriş Yap / Kayıt Ol
              </Link>
            </nav>
          </div>
        </header>
      )}
      <div className="main">
        <div className="gradient" />
      </div>
      <main className="app">{children}</main>
      {showFooter && <Footer />} {/* <-- FOOTER BURADA */}
    </>
  );
}
