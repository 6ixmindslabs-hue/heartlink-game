import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FloatingHearts } from "@/components/FloatingHearts";
import { Heart, Flame, Smile } from "lucide-react";
import galaxyBg from "@/assets/galaxy-bg.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const gameModes = [
  {
    id: "friendly",
    title: "Friendly Mode",
    icon: Smile,
    description: "Fun, light, and laughter-filled questions",
    color: "text-accent",
  },
  {
    id: "crush",
    title: "Crush Mode",
    icon: Heart,
    description: "Emotional and flirty — build romantic tension",
    color: "text-romantic",
  },
  {
    id: "adult",
    title: "Adult Mode",
    icon: Flame,
    description: "Mature and daring — playful and romantic",
    color: "text-primary",
  },
];

export default function ModeSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room");
  const playerId = searchParams.get("player");
  const [isStarting, setIsStarting] = useState(false);

  const handleModeSelect = async (modeId: string) => {
    if (!roomId || !playerId) {
      navigate(`/game?mode=${modeId}`);
      return;
    }

    setIsStarting(true);
    try {
      // Update room with mode and status
      const { error } = await supabase
        .from("game_rooms")
        .update({
          mode: modeId,
          status: "playing",
        })
        .eq("id", roomId);

      if (error) throw error;

      // Navigate to game
      navigate(`/game?room=${roomId}&player=${playerId}&mode=${modeId}`);
    } catch (error) {
      console.error("Error starting game:", error);
      toast.error("Failed to start game. Please try again.");
      setIsStarting(false);
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
      
      <div className="relative z-10 max-w-4xl w-full animate-fade-in">
        <h1 className="text-5xl font-bold text-center mb-3 bg-gradient-romantic bg-clip-text text-transparent">
          Choose Your Game Mode
        </h1>
        <p className="text-center text-muted-foreground mb-12">
          Select the vibe that matches your connection 💫
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {gameModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card
                key={mode.id}
                className="p-6 bg-card/40 backdrop-blur-md border-2 border-primary/30 hover:border-primary/50 hover:shadow-glow transition-all cursor-pointer group"
                onClick={() => handleModeSelect(mode.id)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors ${mode.color}`}>
                    <Icon size={40} />
                  </div>
                  <h3 className="text-xl font-bold">{mode.title}</h3>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                  <Button 
                    variant="glass" 
                    className="w-full group-hover:border-primary/50"
                    disabled={isStarting}
                  >
                    {isStarting ? "Starting..." : "Select"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
