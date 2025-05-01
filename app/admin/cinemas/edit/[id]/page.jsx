import EditCinemaPage from '../../../../../components/admin/EditCinemas';
import { db } from '../../../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Page({ params }) {
  return <EditCinemaPage id={params.id} />;
}

export async function generateStaticParams() {
  try {
    const cinemasRef = collection(db, 'cinemas');
    const snapshot = await getDocs(cinemasRef);
    const params = snapshot.docs.map((doc) => ({
      id: doc.id,
    }));
    return params;
  } catch (error) {
    console.error('Error fetching cinema IDs for generateStaticParams:', error);
    return [];
  }
}