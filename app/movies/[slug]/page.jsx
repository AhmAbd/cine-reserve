import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import MovieDetailPage from './MovieDetailPage';

export async function generateStaticParams() {
  const filmsSnapshot = await getDocs(
    query(
      collection(db, 'films'),
      orderBy('popularity', 'desc'),
      limit(20)
    )
  );
  
  return filmsSnapshot.docs.map((doc) => ({
    slug: doc.data().slug || doc.id
  }));
}

export const revalidate = 3600;

export default function Page({ params }) {
  return <MovieDetailPage params={params} />;
}