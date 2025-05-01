import EditFilmPage from '../../../../../components/admin/EditFilmPage';
import { db } from '../../../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Page({ params }) {
  return <EditFilmPage id={params.id} />;
}

export async function generateStaticParams() {
  try {
    const filmsRef = collection(db, 'films');
    const snapshot = await getDocs(filmsRef);
    const params = snapshot.docs.map((doc) => ({
      id: doc.id,
    }));
    return params;
  } catch (error) {
    console.error('Error fetching film IDs for generateStaticParams:', error);
    return [];
  }
}