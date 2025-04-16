import cinemas from "../../../data/cinemas.json";
import MovieCard from "../../../components/MovieCard";
import Link from "next/link";

export async function generateStaticParams() {
  return cinemas.map((cinema) => ({
    slug: cinema.slug,
  }));
}

export default function CinemaPage({ params }) {
  const cinema = cinemas.find((c) => c.slug === params.slug);
  if (!cinema) return <div className="text-white p-10">Sinema bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-6 py-12">
      {/* Cinema Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">{cinema.name}</h1>
        <div className="w-16 h-1 bg-[#a020f0] mx-auto rounded-full" />
      </div>

      {/* Cinema Image */}
      <div className="mb-10 max-w-4xl mx-auto">
        <img
          src={cinema.imgSrc}
          alt={cinema.name}
          className="w-full h-[400px] object-cover rounded-xl shadow-lg"
        />
      </div>

      {/* Location Button */}
      <div className="text-center mb-16">
        <a
          href={cinema.mapLink}
          target="_blank"
          className="inline-block bg-[#a020f0] text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-600 transition"
        >
          Haritada Görüntüle
        </a>
      </div>

      {/* Weekly Schedule Section */}
      <section className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-2 text-white">Haftalık Gösterim Takvimi</h2>
          <div className="w-24 h-1 bg-[#a020f0] mx-auto rounded-full" />
          <p className="text-sm text-gray-400 mt-3">
            Bu sinemada hafta boyunca gösterimde olan filmleri aşağıda bulabilirsiniz.
          </p>
        </div>

        {/* Day-by-Day Movie List */}
        {cinema.weeklySchedule.map((daySchedule) => (
          <div key={daySchedule.day} className="mb-14">
            {/* Day Title */}
            <div className="flex items-center justify-between border-b border-[#333] pb-2 mb-6">
              <h3 className="text-2xl font-semibold text-white">{daySchedule.day}</h3>
              <span className="text-sm text-gray-400">
                {daySchedule.movies.length} film
              </span>
            </div>

            {/* Movie Cards */}
            {daySchedule.movies.length === 0 ? (
              <p className="text-gray-500">Bugün için herhangi bir film gösterimi bulunmamaktadır.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {daySchedule.movies.map((movie) => (
                  <Link key={movie.slug} href={`/movies/${movie.slug}`}>
                    <div className="movie-card hover:scale-105 transition-transform">
                      <MovieCard movie={movie} showtime={movie.showtime} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
