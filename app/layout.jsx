<<<<<<< HEAD
import "../styles/globals.css"
=======
import "../styles/globals.css";
import Link from "next/link";
import Image from "next/image";
>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631

export const metadata = {
  title: "cinereserve",
  description: "Cinema Reservation System"
<<<<<<< HEAD
}

const RootLayout = ({children}) => {
  return (
    <html lang="en">
      <body>
        <div className="main">
          <div className="gradient" />
        </div>
=======
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

>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631
        <main className="app">
          {children}
        </main>
      </body>
    </html>
<<<<<<< HEAD
  )
}

export default RootLayout
=======
  );
};

export default RootLayout;
>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631
