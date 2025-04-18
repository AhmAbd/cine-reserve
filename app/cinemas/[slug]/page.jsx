import { db } from '../../../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

export default async function CinemaDetailPage({ params }) {
  const cinemaId = params.slug;

  const docRef = doc(db, 'cinemas', cinemaId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return <div className="text-white p-10">Sinema bulunamadı.</div>;
  }

  const cinema = docSnap.data();

  // Fetch all films and filter those showing at this cinema
  const filmsSnapshot = await getDocs(collection(db, 'films'));
  const films = [];

  filmsSnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const showing = data.cinemas?.find((c) => c.id === cinemaId);
    if (showing) {
      films.push({
        id: docSnap.id,
        title: data.title,
        slug: data.slug,
        showtime: showing.showtime,
        imgSrc: data.imgSrc,
      });
    }
  });

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">{cinema.name}</h1>
        <div className="w-16 h-1 bg-[#a020f0] mx-auto rounded-full" />
      </div>

      {/* Cinema Details Card */}
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-6 mb-12 shadow-md">
        <p className="mb-3">
          <span className="font-semibold">Yer:</span>{' '}
          <a href={cinema.mapLink} className="text-[#a020f0] underline" target="_blank" rel="noopener noreferrer">
            {cinema.location}
          </a>
        </p>
        <p className="mb-3">
          <span className="font-semibold">Koltuk Sayısı:</span> {cinema.seats}
        </p>
      </div>

      {/* Schedule */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Gösterimdeki Filmler</h2>

        {films.length === 0 ? (
          <p className="text-gray-400">Bu sinemada gösterimde film bulunamadı.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {films.map((film) => (
              <div
                key={film.id}
                className="bg-gray-900 rounded-xl overflow-hidden shadow-lg flex flex-col"
              >
                <img
                  src={film.imgSrc}
                  alt={film.title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-2">{film.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Seans: {new Date(film.showtime).toLocaleString('tr-TR')}
                  </p>
                  <Link
                    href={`/tickets/select-seat?movie=${film.slug}&cinema=${cinemaId}`}
                    className="mt-auto inline-block bg-[#a020f0] hover:bg-purple-700 text-white text-center py-2 px-4 rounded transition"
                  >
                    Bilet Al
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
