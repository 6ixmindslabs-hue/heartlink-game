import { Heart } from "lucide-react";

interface HeartMeterProps {
  progress: number; // 0-100
}

export const HeartMeter = ({ progress }: HeartMeterProps) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Heart className="text-romantic animate-heart-beat" size={24} fill="currentColor" />
        <span className="text-sm text-muted-foreground">HeartLink Progress</span>
      </div>
      <div className="relative h-4 bg-card/50 rounded-full overflow-hidden border border-primary/30">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-romantic transition-all duration-500 ease-out shadow-glow"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-center mt-2 text-xs text-accent">
        {progress}% Connection
      </div>
    </div>
  );
};
