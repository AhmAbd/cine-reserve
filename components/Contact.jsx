'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import countryCodes from '../utils/countryCodes';
import { motion, AnimatePresence } from 'framer-motion';

const Contact = () => {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: countryCodes[0].value,
    message: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // State for particle positions and window dimensions
  const [particlePositions, setParticlePositions] = useState([]);
  const [windowHeight, setWindowHeight] = useState(0);

  // Debug rendering
  useEffect(() => {
    console.log('Contact form rendered', { formData, loading, error, success });
  }, [formData, loading, error, success]);

  // Set particle positions and window height on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set window height
      setWindowHeight(window.innerHeight);

      // Generate particle positions
      const positions = [...Array(15)].map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.3 + 0.3,
      }));
      setParticlePositions(positions);

      // Update height on window resize
      const handleResize = () => setWindowHeight(window.innerHeight);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted', formData);
    setLoading(true);
    setError('');

    try {
      // Save to Firestore
      await addDoc(collection(db, 'messages'), {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: `${formData.countryCode} ${formData.phone}`,
        message: formData.message,
        isRead: false,
        timestamp: serverTimestamp(),
      });

      // Reset form on success
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        countryCode: countryCodes[0].value,
        message: '',
      });
      setSuccess(true);
    } catch (err) {
      setError('Mesajınız gönderilemedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
      setShowErrorModal(true);
      console.error('Firestore error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-close modals after 3 seconds
  useEffect(() => {
    const timers = [];

    if (success) {
      timers.push(setTimeout(() => setSuccess(false), 3000));
    }

    if (showErrorModal) {
      timers.push(setTimeout(() => setShowErrorModal(false), 3000));
    }

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [success, showErrorModal]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 sm:p-6 relative overflow-hidden">
      {/* Dark Animated Gradient Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black pointer-events-none"
        animate={{
          background: [
            'linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 50%, #0a0a0a 100%)',
            'linear-gradient(135deg, #0a0a0a 0%, #2d1a4b 50%, #0a0a0a 100%)',
            'linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 50%, #0a0a0a 100%)',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle Glowing Orbs */}
      <motion.div
        className="absolute top-1/5 left-1/5 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [-30, 30, -30],
          y: [-30, 30, -30],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/5 right-1/5 w-80 h-80 bg-pink-900/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.5, 0.3],
          x: [30, -30, 30],
          y: [30, -30, 30],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Minimal Starry Particle Effects */}
      {particlePositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-200/50 rounded-full pointer-events-none"
          initial={{
            x: pos.x,
            y: pos.y,
            scale: pos.scale,
          }}
          animate={{
            y: [null, -windowHeight],
            opacity: [0.6, 0],
            scale: [0.8, 0.3],
          }}
          transition={{
            duration: Math.random() * 6 + 6,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Main Form Container */}
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-6 sm:p-10 border border-purple-500/20 relative z-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        {/* Form Header */}
        <motion.h2
          className="text-3xl sm:text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          📬 İletişim Formu
        </motion.h2>

        {/* Name Fields */}
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.div
            className="w-full sm:w-1/2 relative z-20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <label className="block text-sm text-gray-300 mb-2">Adınız*</label>
            <motion.input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              required
              whileHover={{ scale: 1.02 }}
              whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)' }}
            />
          </motion.div>
          <motion.div
            className="w-full sm:w-1/2 relative z-20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <label className="block text-sm text-gray-300 mb-2">Soyadınız*</label>
            <motion.input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              required
              whileHover={{ scale: 1.02 }}
              whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)' }}
            />
          </motion.div>
        </div>

        {/* Email */}
        <motion.div
          className="relative mt-6 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <label className="block text-sm text-gray-300 mb-2">E-posta*</label>
          <motion.input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            required
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)' }}
          />
        </motion.div>

        {/* Phone */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <motion.div
            className="w-full sm:w-1/3 relative z-20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <label className="block text-sm text-gray-300 mb-2">Ülke Kodu*</label>
            <motion.select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              whileHover={{ scale: 1.02 }}
              whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)' }}
            >
              {countryCodes.map((code) => (
                <option key={code.value} value={code.value}>
                  {code.label}
                </option>
              ))}
            </motion.select>
          </motion.div>
          <motion.div
            className="w-full sm:w-2/3 relative z-20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <label className="block text-sm text-gray-300 mb-2">Telefon*</label>
            <motion.input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              required
              whileHover={{ scale: 1.02 }}
              whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)' }}
            />
          </motion.div>
        </div>

        {/* Message */}
        <motion.div
          className="relative mt-6 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <label className="block text-sm text-gray-300 mb-2">Mesajınız*</label>
          <motion.textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            required
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)' }}
          />
        </motion.div>

        {/* Submit Button */}
        <motion.div
          className="mt-8 text-center z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <motion.button
            type="submit"
            disabled={loading}
            className="relative w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold shadow-lg overflow-hidden"
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)' }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Gönderiliyor...
                </span>
              ) : (
                'Gönder'
              )}
            </span>
          </motion.button>
        </motion.div>

        {/* Success Modal */}
        <AnimatePresence>
          {success && (
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
                className="relative z-40 bg-gradient-to-br from-green-600 to-green-700 text-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="text-center">
                  <motion.div
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 sm:h-10 w-8 sm:w-10 text-green-100"
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
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Mesajınız Gönderildi!</h3>
                  <p className="text-sm sm:text-base mb-4 sm:mb-6">
                    En kısa sürede sizinle iletişime geçeceğiz.
                  </p>
                  <div className="w-full bg-green-100/20 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-green-100 h-full rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 3 }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Modal */}
        <AnimatePresence>
          {showErrorModal && (
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
                className="relative z-40 bg-gradient-to-br from-red-600 to-red-700 text-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="text-center">
                  <motion.div
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 sm:h-10 w-8 sm:w-10 text-red-100"
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
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Gönderim Başarısız!</h3>
                  <p className="text-sm sm:text-base mb-4 sm:mb-6">{error}</p>
                  <div className="w-full bg-red-100/20 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-red-100 h-full rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 3 }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
};

export default Contact;