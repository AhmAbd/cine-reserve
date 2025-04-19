'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
} from 'firebase/firestore';

const MessagesList = () => {
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [readMessages, setReadMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUnreadMessages(allMessages.filter((msg) => msg.isRead === false));
      setReadMessages(allMessages.filter((msg) => msg.isRead === true));
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const messageRef = doc(db, 'messages', id);
      await updateDoc(messageRef, {
        isRead: true,
      });
    } catch (err) {
      console.error('Güncelleme hatası:', err);
    }
  };

  const handleReply = async () => {
    if (!selectedEmail || !replyText.trim()) return;

    try {
      const res = await fetch('/api/sendReply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedEmail,
          subject: 'Mesajınıza Yanıt',
          text: replyText,
        }),
      });

      if (res.ok) {
        alert('Yanıt başarıyla gönderildi.');
        setReplyText('');
        setSelectedEmail(null);
      } else {
        alert('Yanıt gönderilemedi.');
      }
    } catch (err) {
      console.error('Yanıt gönderme hatası:', err);
    }
  };

  const renderMessage = (msg) => (
    <li
      key={msg.id}
      className="p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
    >
      <p><strong>Ad Soyad:</strong> {msg.name}</p>
      <p><strong>Telefon:</strong> {msg.phone}</p>
      <p><strong>E-posta:</strong> {msg.email}</p>
      <p><strong>Mesaj:</strong> {msg.message}</p>
      <p className="text-sm text-gray-400 mt-2">
        {msg.timestamp?.toDate?.().toLocaleString?.() || "Tarih yok"}
      </p>

      {!msg.isRead && (
        <button
          onClick={() => handleMarkAsRead(msg.id)}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md"
        >
          Okundu olarak işaretle
        </button>
      )}

      <div className="mt-4">
        <textarea
          placeholder="Yanıtınızı yazın..."
          className="w-full p-2 border rounded mb-2"
          value={selectedEmail === msg.email ? replyText : ''}
          onChange={(e) => {
            setReplyText(e.target.value);
            setSelectedEmail(msg.email);
          }}
        />
        <button
          onClick={handleReply}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Yanıtla
        </button>
      </div>
    </li>
  );

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 dark:bg-black-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6">Gelen Mesajlar</h2>

      <div className="mb-10">
        <h3 className="text-2xl font-semibold mb-4 text-red-600">📩 Okunmamış Mesajlar</h3>
        {unreadMessages.length === 0 ? (
          <p>Henüz okunmamış mesaj yok.</p>
        ) : (
          <ul className="space-y-4">{unreadMessages.map(renderMessage)}</ul>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-semibold mb-4 text-green-600">📨 Okunan Mesajlar</h3>
        {readMessages.length === 0 ? (
          <p>Henüz okunan mesaj yok.</p>
        ) : (
          <ul className="space-y-4">{readMessages.map(renderMessage)}</ul>
        )}
      </div>
    </div>
  );
};

export default MessagesList;
