"use client";

import "../styles/globals.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Footer from "../components/layout/Footer";
import { app } from "../lib/firebase"; // kendi Firebase config'ine göre bu yolu kontrol et

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // Admin sayfasını kontrol et
  const isAdminPage = pathname.startsWith("/admin");

  // Admin sayfasında header ve footer'ı gizlemek için koşul ekleyin
  const hiddenPaths = ["/login", "/register", "/reset-password","/forgot-password"];
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
    router.push("/"); // anasayfaya yönlendir
  };

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

              {user ? (
                <>
                  <Link href="/account" className="nav-link">
                    Hesabım
                  </Link>
                  <button onClick={handleLogout} className="login-button">
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <Link href="/login" className="login-button">
                  Giriş Yap / Kayıt Ol
                </Link>
              )}
            </nav>
          </div>
        </header>
      )}

      <div className="main">
        <div className="gradient" />
      </div>

      <main className="app">{children}</main>

      {showFooter && <Footer />}
    </>
  );
}
