import movies from "../../../data/movies.json";
import Link from "next/link";

export async function generateStaticParams() {
  return movies.map((movie) => ({
    slug: movie.slug,
  }));
}

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
    </div>
  );
}
