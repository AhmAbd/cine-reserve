import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

// Tüm kullanıcıları getir
export const fetchUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Tüm filmleri getir
export const fetchMovies = async () => {
  const snapshot = await getDocs(collection(db, "movies"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
