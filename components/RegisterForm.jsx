'use client';

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const AnimatedLink = ({ href, children, className }) => {
  return (
    <motion.span
      className="inline-block"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={href}
        className={`${className} text-purple-400 hover:text-purple-300 transition-colors`}
        onClick={(e) => {
          e.stopPropagation();
          console.log('Link clicked', { x: e.clientX, y: e.clientY });
        }}
      >
        {children}
      </Link>
    </motion.span>
  );
};

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    surname: '',
    mail: '',
    phone: '',
    birthdate: '',
    gender: '',
    password: '',
    confirmPassword: '',
    sms: false,
    emailConsent: false,
    kvkkConsent: false,
    role: 'user',
    suspended: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (form.password !== form.confirmPassword) {
      setError('Şifreler uyuşmuyor.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.mail, form.password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        name: form.name,
        surname: form.surname,
        phone: form.phone,
        mail: form.mail,
        birthdate: form.birthdate,
        gender: form.gender,
        sms: form.sms,
        emailConsent: form.emailConsent,
        kvkkConsent: form.kvkkConsent,
        createdAt: new Date(),
        role: form.role,
        suspended: form.suspended,
      });

      setSuccess(true);
    } catch (err) {
      setError('Hata: ' + err.message);
      console.error('Firebase error:', err);
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black pointer-events-none z-0"
        animate={{
          background: [
            'linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 50%, #0a0a0a 100%)',
            'linear-gradient(135deg, #0a0a0a 0%, #2d1a4b 50%, #0a0a0a 100%)',
            'linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 50%, #0a0a0a 100%)',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Message Modal */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className={`relative z-40 p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 ${
                success
                  ? 'bg-gradient-to-br from-green-600 to-green-700'
                  : 'bg-gradient-to-br from-red-600 to-red-700'
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center">
                <motion.div
                  className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {success ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {success ? 'Başarılı!' : 'Hata!'}
                </h3>
                <p className="text-gray-200 mb-4">
                  {success ? 'Kayıt başarılı! Yönlendiriliyorsunuz...' : error}
                </p>
                {success && (
                  <div className="w-full bg-green-100/20 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-green-100 h-full rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 3 }}
                    />
                  </div>
                )}
                {error && (
                  <motion.button
                    className="mt-4 px-4 py-1 bg-gray-800/50 text-white rounded-lg text-sm"
                    onClick={() => setError('')}
                    whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.7)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Kapat
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Container */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/20"
      >
        {/* Form Header */}
        <div className="text-center mb-4">
          <motion.div
            className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3"
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-1">
            Üye Ol
          </h1>
          <p className="text-gray-400 text-xs">Yeni bir hesap oluşturun</p>
        </div>

        {/* Name and Surname */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-300 mb-1">Ad</label>
            <motion.input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Adınız"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)',
              }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-300 mb-1">Soyad</label>
            <motion.input
              type="text"
              name="surname"
              value={form.surname}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Soyadınız"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)',
              }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>

        {/* Email and Phone */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-300 mb-1">E-posta</label>
            <motion.input
              type="email"
              name="mail"
              value={form.mail}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="email@example.com"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)',
              }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-300 mb-1">Telefon</label>
            <motion.input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Telefon"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)',
              }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>

        {/* Birthdate and Gender */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-300 mb-1">Doğum Tarihi</label>
            <motion.input
              type="date"
              name="birthdate"
              value={form.birthdate}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)',
              }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-300 mb-1">Cinsiyet</label>
            <motion.select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)',
              }}
              transition={{ duration: 0.2 }}
            >
              <option value="">Seç</option>
              <option value="Kadın">Kadın</option>
              <option value="Erkek">Erkek</option>
            </motion.select>
          </div>
        </div>

        {/* Password */}
        <div className="relative mb-4">
          <label className="block text-xs font-medium text-gray-300 mb-1">Şifre</label>
          <div className="relative">
            <motion.input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 pr-16 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)',
              }}
              transition={{ duration: 0.2 }}
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-purple-400 bg-gray-800/50 px-3 py-1 rounded-md"
              whileHover={{ backgroundColor: 'rgba(46, 16, 101, 0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              {showPassword ? 'Gizle' : 'Göster'}
            </motion.button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="relative mb-4">
          <label className="block text-xs font-medium text-gray-300 mb-1">Şifre Tekrar</label>
          <motion.input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="••••••••"
            required
            whileFocus={{
              borderColor: '#a855f7',
              boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)',
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Consents */}
        <div className="mb-4 space-y-2">
          <label className="flex items-center gap-2 text-gray-300 text-xs">
            <motion.input
              type="checkbox"
              name="sms"
              checked={form.sms}
              onChange={handleChange}
              className="h-4 w-4 text-purple-500 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
              whileTap={{ scale: 0.9 }}
            />
            <span>SMS almak istiyorum</span>
          </label>
          <label className="flex items-center gap-2 text-gray-300 text-xs">
            <motion.input
              type="checkbox"
              name="emailConsent"
              checked={form.emailConsent}
              onChange={handleChange}
              className="h-4 w-4 text-purple-500 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
              whileTap={{ scale: 0.9 }}
            />
            <span>E-posta almak istiyorum</span>
          </label>
          <label className="flex items-center gap-2 text-gray-300 text-xs">
            <motion.input
              type="checkbox"
              name="kvkkConsent"
              checked={form.kvkkConsent}
              onChange={handleChange}
              className="h-4 w-4 text-purple-500 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
              required
              whileTap={{ scale: 0.9 }}
            />
            <span>KVKK'yı okudum ve onaylıyorum</span>
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="relative w-full py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold text-sm"
          whileHover={{
            scale: 1.02,
            boxShadow: '0 0 15px rgba(192, 132, 252, 0.4)',
          }}
          whileTap={{
            scale: 0.98,
            boxShadow: '0 0 10px rgba(192, 132, 252, 0.2)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          Üye Ol
        </motion.button>

        {/* Login Link */}
        <p className="text-xs text-center mt-4 text-gray-400">
          Zaten üye misiniz?{' '}
          <AnimatedLink href="/login" className="px-2 py-1">
            Giriş Yap
          </AnimatedLink>
        </p>
      </motion.form>
    </div>
  );
};

export default RegisterPage;