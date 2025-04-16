import "../styles/globals.css";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "cinereserve",
  description: "Cinema Reservation System"
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>
        {/* Header */}
        <header className="custom-header">
          <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem" }}>
            {/* Logo */}
            <Link href="/">
              <Image
                src="/images/cinereserve.png"
                alt="CineReserve"
                width={64}
                height={64}
                style={{ borderRadius: "0.5rem" }}
              />
            </Link>

            {/* Navigation */}
            <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <Link href="/movies" className="nav-link">Filmler</Link>
              <Link href="/cinemas" className="nav-link">Sinemalar</Link>
              <Link href="/login" className="login-button">Giriş Yap / Kayıt Ol</Link>
            </nav>
          </div>
        </header>

        {/* Background gradient and main */}
        <div className="main">
          <div className="gradient" />
        </div>

        <main className="app">
          {children}
        </main>
      </body>
    </html>
  );
};

export default RootLayout;
