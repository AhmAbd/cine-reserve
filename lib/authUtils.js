import { getDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export const isUserSuspended = async (uid) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() && userDoc.data().suspended === true;
};
