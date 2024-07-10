import React from "react";

interface HeroProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
}

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  buttonText,
  buttonUrl,
}) => {
  return (
    <div className="hero bg-gray-100 p-8 rounded-lg text-center">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-xl mb-6">{subtitle}</p>

      <a
        href={buttonUrl}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        {buttonText}
      </a>
    </div>
  );
};

export default Hero;
