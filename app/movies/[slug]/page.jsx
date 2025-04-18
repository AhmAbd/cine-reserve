import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";

export async function generateStaticParams() {
  const snapshot = await getDocs(collection(db, "films"));
  const paths = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.slug) {
      paths.push({ slug: data.slug });
    }
  });

  return paths;
}

export default async function MovieDetailPage({ params }) {
  const slug = params.slug;

  const filmSnap = await getDocs(collection(db, "films"));
  let movie = null;

  filmSnap.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.slug === slug) {
      movie = data;
    }
  });

  if (!movie) {
    return <div className="text-white p-10">Film bulunamadı.</div>;
  }

  // ✅ Fetch names for all cinemas
  const cinemaData = await Promise.all(
    (movie.cinemas || []).map(async (cinema) => {
      const snap = await getDoc(doc(db, "cinemas", cinema.id));
      return {
        ...cinema,
        name: snap.exists() ? snap.data().name : cinema.id,
      };
    })
  );

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
        <div className="w-16 h-1 bg-[#a020f0] mx-auto rounded-full" />
      </div>

      <div className="mb-10 max-w-4xl mx-auto">
        <img
          src={movie.imgSrc}
          alt={movie.title}
          className="w-full h-[400px] object-cover rounded-xl shadow-xl"
        />
      </div>

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
            <p>{new Date(movie.releaseDate.toDate()).toLocaleDateString("tr-TR")}</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Film Özeti</h2>
          <p className="text-gray-300 leading-relaxed">{movie.description}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto mt-8">
        <h2 className="text-xl font-semibold mb-4">Bu Filmi İzleyebileceğiniz Salonlar</h2>
        {cinemaData.length > 0 ? (
          <ul className="space-y-4">
            {cinemaData.map((cinema) => (
              <li
                key={cinema.id}
                className="bg-gray-800 p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center"
              >
                <div>
                  <p className="font-semibold">{cinema.name}</p>
                  <p className="text-gray-400 text-sm">
                    Seans: {new Date(cinema.showtime).toLocaleString("tr-TR")}
                  </p>
                </div>
                <Link
                  href={`/tickets/select-seat?movie=${movie.slug}&cinema=${cinema.id}`}
                  className="mt-2 sm:mt-0 bg-[#a020f0] text-white px-4 py-2 rounded-md font-medium hover:bg-purple-700 transition"
                >
                  Bilet Al
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">Bu film için uygun sinema bulunamadı.</p>
        )}
      </div>
    </div>
  );
}
