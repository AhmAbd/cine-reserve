// admin.js (Backend tarafında çalışacak dosya)
import admin from 'firebase-admin';

// Firebase Admin SDK'yı başlat
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Kullanıcıya admin yetkisi verme
const setAdminRole = async (uid) => {
  const userRef = db.collection('users').doc(uid);

  await userRef.set({
    role: 'admin'
  }, { merge: true });

  console.log(`Kullanıcı ${uid} admin olarak ayarlandı.`);
};

// Örnek kullanım
setAdminRole('NT7XjAxovNRcqEcQY19j9xHZBZl1');
