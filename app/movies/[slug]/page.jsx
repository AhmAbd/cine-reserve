<<<<<<< HEAD
import movies from "@/data/movies.json";
=======
import movies from "../../../data/movies.json";
>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631
import Link from "next/link";

export async function generateStaticParams() {
  return movies.map((movie) => ({
    slug: movie.slug,
  }));
}

<<<<<<< HEAD
export default function MoviePage({ params }) {
  const movie = movies.find((m) => m.slug === params.slug);

  if (!movie) return <div className="text-white p-10">Film bulunamadı.</div>;

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Header */}
      <header className="bg-gray-800 py-4 px-6 shadow-lg sticky top-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold text-white">🎥 CineReserve</Link>
            <Link href="/" className="hover:text-accent">Anasayfa</Link>
            <Link href="/movies" className="hover:text-accent">Filmler</Link>
            <Link href="/cinemas" className="hover:text-accent">Sinemalar</Link>
          </div>
        </div>
      </header>

      {/* Movie Info */}
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-6">{movie.title}</h1>

        {/* Trailer */}
        <div className="mb-8">
          <iframe
            className="w-full rounded"
            height="400"
            src={movie.trailerUrl}
            title={movie.title}
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>

        {/* Movie Details */}
        <div className="space-y-3 mb-8">
          <p><strong>Vizyon Tarihi:</strong> {movie.releaseDate}</p>
          <p><strong>Tür:</strong> {movie.genre}</p>
          <p><strong>Süre:</strong> {movie.duration}</p>
          <p><strong>Film Özeti:</strong> {movie.description}</p>
        </div>

        {/* Buy Ticket Button */}
        <Link
          href="/tickets"
          className="bg-accent text-white px-6 py-3 rounded shadow hover:bg-accent-light transition"
        >
          🎟️ Bilet Al
        </Link>
      </main>
=======
export default function MovieDetailPage({ params }) {
  const movie = movies.find((m) => m.slug === params.slug);
  if (!movie) return <div className="text-white p-10">Film bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-6 py-12">
      {/* Movie Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">{movie.title}</h1>
        <div className="w-16 h-1 bg-[#a020f0] mx-auto rounded-full" />
      </div>

      {/* Poster / Image */}
      <div className="mb-10 max-w-4xl mx-auto">
        <img
          src={movie.imgSrc}
          alt={movie.title}
          className="w-full h-[400px] object-cover rounded-xl shadow-xl"
        />
      </div>

      {/* Movie Info */}
      <section className="max-w-4xl mx-auto mb-12 space-y-5 text-sm sm:text-base">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-gray-300">
          <div>
            <span className="block text-gray-500 text-xs mb-1">Tür</span>
            <p>{movie.genre}</p>
          </div>
          <div>
            <span className="block text-gray-500 text-xs mb-1">Süre</span>
            <p>{movie.duration}</p>
          </div>
          <div>
            <span className="block text-gray-500 text-xs mb-1">Vizyon Tarihi</span>
            <p>{movie.releaseDate}</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-white mb-3">Film Özeti</h2>
          <p className="text-gray-300 leading-relaxed">{movie.description}</p>
        </div>
      </section>

      {/* Ticket Button */}
      <div className="text-center">
        <Link
          href="/tickets"
          className="inline-block bg-[#a020f0] text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-600 transition"
        >
          Bilet Al
        </Link>
      </div>
>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631
    </div>
  );
}
