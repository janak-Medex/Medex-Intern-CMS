import React from "react";
import { motion } from "framer-motion";

interface HeroProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  backgroundImageUrl?: string;
}

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  buttonText,
  buttonUrl,
  backgroundImageUrl,
}) => {
  return (
    <motion.div
      className="hero bg-gray-100 p-8 rounded-lg text-center relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
      )}

      <div className="relative z-10">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-xl mb-6">{subtitle}</p>

        <a
          href={buttonUrl}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-block"
        >
          {buttonText}
        </a>
      </div>
    </motion.div>
  );
};

export default Hero;
