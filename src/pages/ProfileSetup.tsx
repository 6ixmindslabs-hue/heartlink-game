import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FloatingHearts } from "@/components/FloatingHearts";
import galaxyBg from "@/assets/galaxy-bg.jpg";

const avatarMoods = [
  { emoji: "😇", label: "Cute" },
  { emoji: "😎", label: "Cool" },
  { emoji: "😊", label: "Shy" },
  { emoji: "😏", label: "Bold" },
  { emoji: "💞", label: "Romantic" },
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [selectedMood, setSelectedMood] = useState("");

  const handleContinue = () => {
    if (nickname && selectedMood) {
      navigate("/mode-select");
    }
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${galaxyBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <FloatingHearts />
      
      <Card className="relative z-10 p-8 md:p-12 bg-card/40 backdrop-blur-md border-2 border-primary/30 shadow-glow max-w-lg w-full animate-fade-in">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-romantic bg-clip-text text-transparent">
          Create Your Profile
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Let's get to know you better! ✨
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Your Nickname</label>
            <Input
              type="text"
              placeholder="Enter your nickname..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="bg-input/50 border-primary/30 focus:border-primary/50"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Choose Your Mood</label>
            <div className="grid grid-cols-5 gap-3">
              {avatarMoods.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => setSelectedMood(mood.emoji)}
                  className={`
                    aspect-square rounded-lg border-2 transition-all p-3 flex flex-col items-center justify-center gap-1
                    ${selectedMood === mood.emoji 
                      ? "border-primary bg-primary/20 shadow-glow scale-110" 
                      : "border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                    }
                  `}
                >
                  <span className="text-3xl">{mood.emoji}</span>
                  <span className="text-xs">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="romantic"
            size="lg"
            className="w-full font-semibold text-lg"
            onClick={handleContinue}
            disabled={!nickname || !selectedMood}
          >
            Continue →
          </Button>
        </div>
      </Card>
    </div>
  );
}
