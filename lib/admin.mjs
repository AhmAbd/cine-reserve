import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

// Sadece Authentication'da admin yapmak
const setAdminRole = async (uid) => {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(`Kullanıcı ${uid} artık admin.`);
};

setAdminRole("XMVpFh0nMvNwWoSOh6y5hP3DhWU2");
setAdminRole("1rnrO9BUU5QnyLLOI3JrKahGuh32");
