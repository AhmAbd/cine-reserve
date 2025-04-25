'use client';
import { motion } from "framer-motion";

const CinemaCard = ({ cinema, isHovered }) => {
  return (
    <motion.div 
      className="bg-[#1a1a2e] rounded-xl shadow-lg overflow-hidden flex-shrink-0 w-64 flex flex-col relative"
      whileHover={{ boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.4)" }}
      animate={{ 
        scale: isHovered ? 1.05 : 1,
        zIndex: isHovered ? 10 : 1
      }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Image with gradient overlay */}
      <div className="relative">
        <motion.img
          src={cinema.imgSrc}
          alt={cinema.name}
          className="w-full h-48 object-cover"
          animate={{
            filter: isHovered ? "brightness(1.1)" : "brightness(0.9)"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6 flex-grow">
        <motion.h3 
          className="text-xl font-semibold text-white mb-2"
          animate={{ color: isHovered ? "#a855f7" : "#ffffff" }}
        >
          {cinema.name}
        </motion.h3>

        <motion.p
          className="text-gray-400 text-sm"
          animate={{ opacity: isHovered ? 0.9 : 0.7 }}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {cinema.location}
        </motion.p>

        {/* Hover effect indicator */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default CinemaCard;