import { Heart } from "lucide-react";

export const FloatingHearts = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <Heart
          key={i}
          className="absolute text-romantic/20 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 3}s`,
            fontSize: `${20 + Math.random() * 40}px`,
          }}
          fill="currentColor"
        />
      ))}
    </div>
  );
};
