'use client';
import MovieList from "../components/MovieList";
import CinemaList from "../components/CinemaList";
<<<<<<< HEAD
<<<<<<< HEAD
=======
import Link from "next/link";
>>>>>>> 546cdca91d6183d025495619f1f0bb3a73cc6458

const Home = () => {
  return (
    <div className="bg-gray-900 text-white">
      {/* Header Section */}
      <header className="bg-dark-700 text-white sticky top-0 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center w-full">
          {/* Logo (on the left side) */}
          <div className="w-24">
            <img src="../images/Logo.jpg" alt="CineReserve Logo" className="w-full h-auto" />
          </div>

          {/* Navigation (on the right side) */}
          <nav className="space-x-8 flex items-center text-lg font-semibold">
<<<<<<< HEAD
            <a href="#home" className="hover:text-accent transition-all">Anasayfa</a>
            <a href="#films" className="hover:text-accent transition-all">Filmler</a>
            <a href="#cinemas" className="hover:text-accent transition-all">Sinemalar</a>
            <a href="#login" className="bg-accent text-white px-6 py-2 rounded-full hover:bg-accent-light transition-all">Giriş Yap</a>
=======
            <Link href="#home" className="hover:text-accent transition-all">Anasayfa</Link>
            <Link href="#films" className="hover:text-accent transition-all">Filmler</Link>
            <Link href="#cinemas" className="hover:text-accent transition-all">Sinemalar</Link>
            <Link href="/login" className="bg-accent text-white px-6 py-2 rounded-full hover:bg-accent-light transition-all">
              Giriş Yap veya Kaydol
            </Link>
>>>>>>> 546cdca91d6183d025495619f1f0bb3a73cc6458
          </nav>
        </div>
      </header>

      {/* Film Section */}
      <section className="py-8 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-semibold text-gray-300 mb-6">Vizyondakiler</h2>
          <MovieList />
        </div>
      </section>

      {/* Cinema Section */}
      <section className="py-8 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-semibold text-gray-300 mb-6">Yakında</h2>
          <CinemaList />
        </div>
      </section>
    </div>
  )
}

export default Home
=======

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white">
      <MovieList />
      <CinemaList />
    </main>
  );
}
>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631
