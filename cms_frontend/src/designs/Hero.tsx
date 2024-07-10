// designs/Hero.tsx
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
    <div className="hero">
      <h1>{title} asvbhjsdbfh</h1>
      <p>{subtitle}</p>
      <a href={buttonUrl}>{buttonText}</a>
    </div>
  );
};

export default Hero;
