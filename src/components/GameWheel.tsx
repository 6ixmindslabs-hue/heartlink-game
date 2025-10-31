import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface GameWheelProps {
  onResult: (result: "truth" | "dare") => void;
  isSpinning: boolean;
}

export const GameWheel = ({ onResult, isSpinning }: GameWheelProps) => {
  const [rotation, setRotation] = useState(0);

  const spinWheel = () => {
    if (isSpinning) return;
    
    const spins = 5 + Math.random() * 3;
    const finalRotation = rotation + (spins * 360);
    const result = Math.random() > 0.5 ? "truth" : "dare";
    
    setRotation(finalRotation);
    
    setTimeout(() => {
      onResult(result);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative">
        <div 
          className="w-64 h-64 rounded-full bg-gradient-romantic shadow-glow border-4 border-primary/50 flex items-center justify-center transition-transform duration-[3000ms] ease-out"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            backgroundImage: "conic-gradient(from 0deg, hsl(272, 34%, 64%), hsl(307, 35%, 68%), hsl(328, 47%, 79%), hsl(307, 35%, 68%), hsl(272, 34%, 64%))"
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 rounded-full bg-background/90 backdrop-blur flex items-center justify-center border-2 border-primary/50">
              <Sparkles className="text-romantic animate-pulse-glow" size={48} />
            </div>
          </div>
          
          {/* Segments */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-background font-bold text-sm">
            TRUTH
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-background font-bold text-sm">
            DARE
          </div>
        </div>
        
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-romantic drop-shadow-glow" />
      </div>

      <Button 
        variant="romantic" 
        size="lg" 
        onClick={spinWheel}
        disabled={isSpinning}
        className="font-semibold text-lg px-12"
      >
        {isSpinning ? "Spinning..." : "Spin the Wheel ✨"}
      </Button>
    </div>
  );
};
