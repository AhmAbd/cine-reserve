'use client';

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiUser, FiUserPlus, FiMail, FiPhone, FiCalendar, FiLock, FiCheckSquare } from 'react-icons/fi';

// Registration-themed icons
const registerIcons = [
  { icon: <FiUser />, name: 'user', size: 24 },
  { icon: <FiUserPlus />, name: 'user-plus', size: 28 },
  { icon: <FiMail />, name: 'mail', size: 22 },
  { icon: <FiPhone />, name: 'phone', size: 26 },
  { icon: <FiCalendar />, name: 'calendar', size: 30 },
  { icon: <FiLock />, name: 'lock', size: 24 },
  { icon: <FiCheckSquare />, name: 'check-square', size: 32 },
];

// Floating icons configuration
const floatingIcons = registerIcons.map((icon, i) => ({
  ...icon,
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  z: Math.random() * 20 - 10,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 6,
}));

// Particles configuration
const particles = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  z: Math.random() * 100 - 50,
  size: Math.random() * 4 + 1,
}));

const AnimatedLink = ({ href, children, className }) => {
  return (
    <motion.span
      className="inline-block"
      whileHover={{ scale: 1.05, rotateX: 10, rotateY: 5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={href}
        className={`${className} text-purple-400 hover:text-purple-300 transition-colors`}
        onClick={(e) => {
          e.stopPropagation();
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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
      console.error('Firebase error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kullanılıyor. Lütfen başka bir e-posta deneyin veya giriş yapın.');
      } else {
        setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  // Mouse movement for 3D form tilt
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      {/* 3D Particle Background */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ perspective: 1000 }}>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-purple-400/40 rounded-full shadow-md"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              translateZ: `${particle.z}px`,
            }}
            animate={{
              y: [0, -dimensions.height * 0.6, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.3, 1],
              translateZ: [particle.z, particle.z + 50, particle.z],
            }}
            transition={{
              duration: Math.random() * 12 + 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* 3D Floating Registration Icons Background */}
      <div className="absolute inset-0 pointer-events-none z-5" style={{ perspective: 500 }}>
        {floatingIcons.map((icon) => (
          <motion.div
            key={icon.id}
            className="absolute text-purple-400 opacity-70 hover:opacity-100 transition-opacity"
            style={{
              fontSize: `${icon.size}px`,
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              translateZ: `${icon.z}px`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.15, 1],
              rotateZ: [0, 45, 0],
            }}
            transition={{
              duration: icon.duration,
              delay: icon.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            whileHover={{
              opacity: 1,
              scale: 1.5,
              textShadow: '0 0 10px rgba(168, 85, 247, 0.8)',
              transition: { duration: 0.3 },
            }}
          >
            {icon.icon}
          </motion.div>
        ))}
      </div>

      {/* Gradient Background */}
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
            className="fixed inset-0 flex items-center justify-center z-50"
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
              className={`relative z-50 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 ${
                success
                  ? 'bg-gradient-to-br from-green-600/80 to-green-700/80'
                  : 'bg-gradient-to-br from-red-600/80 to-red-700/80'
              } backdrop-blur-sm border border-white/10`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
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
                      className="bg-green-300 h-full rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 3 }}
                    />
                  </div>
                )}
                {error && (
                  <motion.button
                    className="mt-4 px-4 py-2 bg-gray-800/50 text-white rounded-lg text-sm border border-purple-500/30"
                    onClick={() => setError('')}
                    whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.7)', scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    Kapat
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Form Container */}
      <motion.form
        initial={{ opacity: 0, y: 50, rotateX: -30 }}
        animate={{
          opacity: 1,
          y: 0,
          rotateX: 0,
          rotateY: mousePos.x * 15,
          rotateX: -mousePos.y * 15,
        }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        onSubmit={handleSubmit}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
        className="relative z-10 w-full max-w-lg bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl p-8 border border-purple-500/30 shadow-2xl backdrop-blur-sm"
        style={{ perspective: 1000 }}
      >
        {/* Form Header */}
        <div className="text-center mb-8">
          <motion.div
            className="w-20 h-20 bg-purple-600/30 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0, rotateX: -90 }}
            animate={{ scale: 1, rotateX: 0 }}
            whileHover={{ scale: 1.2, rotateY: 360, translateZ: 20 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-purple-400"
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
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Üye Ol
          </h1>
          <p className="text-gray-400 text-sm">Yeni bir hesap oluşturun</p>
        </div>

        {/* Name and Surname */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Ad</label>
            <motion.input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              placeholder="Adınız"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                scale: 1.01,
                rotateX: 5,
                translateZ: 10,
              }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Soyad</label>
            <motion.input
              type="text"
              name="surname"
              value={form.surname}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              placeholder="Soyadınız"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                scale: 1.01,
                rotateX: 5,
                translateZ: 10,
              }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>

        {/* Email and Phone */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
            <motion.input
              type="email"
              name="mail"
              value={form.mail}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              placeholder="email@example.com"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                scale: 1.01,
                rotateX: 5,
                translateZ: 10,
              }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Telefon</label>
            <motion.input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              placeholder="Telefon"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                scale: 1.01,
                rotateX: 5,
                translateZ: 10,
              }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>

        {/* Birthdate and Gender */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Doğum Tarihi</label>
            <motion.input
              type="date"
              name="birthdate"
              value={form.birthdate}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                scale: 1.01,
                rotateX: 5,
                translateZ: 10,
              }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Cinsiyet</label>
            <motion.select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                scale: 1.01,
                rotateX: 5,
                translateZ: 10,
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
        <div className="relative mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
          <div className="relative">
            <motion.input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-20 bg-gray-800/30 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              placeholder="••••••••"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                scale: 1.01,
                rotateX: 5,
                translateZ: 10,
              }}
              transition={{ duration: 0.2 }}
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-purple-400 bg-gray-800/50 px-4 py-2 rounded-md"
              whileHover={{ backgroundColor: 'rgba(46, 16, 101, 0.5)', scale: 1.05, translateZ: 10 }}
              whileTap={{ scale: 0.95 }}
            >
              {showPassword ? 'Gizle' : 'Göster'}
            </motion.button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="relative mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Şifre Tekrar</label>
          <motion.input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
            placeholder="••••••••"
            required
            whileFocus={{
              borderColor: '#a855f7',
              boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
              scale: 1.01,
              rotateX: 5,
              translateZ: 10,
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Consents */}
        <div className="mb-6 space-y-3">
          <label className="flex items-center gap-2 text-gray-300 text-sm">
            <motion.input
              type="checkbox"
              name="sms"
              checked={form.sms}
              onChange={handleChange}
              className="h-4 w-4 text-purple-500 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
              whileTap={{ scale: 0.9, rotate: 45 }}
              transition={{ duration: 0.2 }}
            />
            <span>SMS almak istiyorum</span>
          </label>
          <label className="flex items-center gap-2 text-gray-300 text-sm">
            <motion.input
              type="checkbox"
              name="emailConsent"
              checked={form.emailConsent}
              onChange={handleChange}
              className="h-4 w-4 text-purple-500 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
              whileTap={{ scale: 0.9, rotate: 45 }}
              transition={{ duration: 0.2 }}
            />
            <span>E-posta almak istiyorum</span>
          </label>
          <label className="flex items-center gap-2 text-gray-300 text-sm">
            <motion.input
              type="checkbox"
              name="kvkkConsent"
              checked={form.kvkkConsent}
              onChange={handleChange}
              className="h-4 w-4 text-purple-500 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
              required
              whileTap={{ scale: 0.9, rotate: 45 }}
              transition={{ duration: 0.2 }}
            />
            <span>KVKK'yı okudum ve onaylıyorum</span>
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="relative w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold overflow-hidden"
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 20px rgba(192, 132, 252, 0.6)',
            rotateX: 10,
            translateZ: 20,
          }}
          whileTap={{
            scale: 0.95,
            boxShadow: '0 0 10px rgba(192, 132, 252, 0.3)',
            rotateX: -10,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-pink-500/50"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
          <span className="relative z-10">Üye Ol</span>
        </motion.button>

        {/* Login Link */}
        <p className="text-sm text-center mt-6 text-gray-400">
          Zaten üye misiniz?{' '}
          <AnimatedLink href="/login" className="px-3 py-2">
            Giriş Yap
          </AnimatedLink>
        </p>
      </motion.form>
    </div>
  );
};

export default RegisterPage;