import { useEffect, useRef, useState } from "react";
import lottie, { AnimationItem } from "lottie-web";

const LottieLogo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationLoaded, setAnimationLoaded] = useState(false);

  useEffect(() => {
    let animation: AnimationItem | null = null;

    const loadAnimation = async () => {
      try {
        const module = await import("./logo.json");
        const animationData = module.default;

        if (containerRef.current) {
          animation = lottie.loadAnimation({
            container: containerRef.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            animationData: animationData,
          });

          animation.addEventListener("DOMLoaded", () => {
            setAnimationLoaded(true);
          });
        }
      } catch (error) {
        console.error("Failed to load Lottie animation:", error);
      }
    };

    loadAnimation();

    return () => {
      if (animation) {
        animation.destroy();
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {!animationLoaded && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          TM
        </div>
      )}
    </div>
  );
};

export default LottieLogo;
