import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FloatingHearts } from "@/components/FloatingHearts";
import galaxyBg from "@/assets/galaxy-bg.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const avatarMoods = [
  { emoji: "😇", label: "Cute" },
  { emoji: "😎", label: "Cool" },
  { emoji: "😊", label: "Shy" },
  { emoji: "😏", label: "Bold" },
  { emoji: "💞", label: "Romantic" },
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room");
  
  const [nickname, setNickname] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (nickname && selectedMood && roomId) {
      setIsLoading(true);
      try {
        // Check if room exists
        const { data: existingRoom } = await supabase
          .from("game_rooms")
          .select("*")
          .eq("id", roomId)
          .single();

        const isHost = !existingRoom;

        // Create room if host
        if (isHost) {
          const { error: roomError } = await supabase
            .from("game_rooms")
            .insert({
              id: roomId,
              host_id: roomId, // Using room ID as host identifier
              status: "waiting",
            });

          if (roomError) throw roomError;
        }

        // Add player to room
        const { data: player, error: playerError } = await supabase
          .from("players")
          .insert({
            room_id: roomId,
            nickname,
            mood_emoji: selectedMood,
            is_host: isHost,
          })
          .select()
          .single();

        if (playerError) throw playerError;

        // Navigate based on role
        if (isHost) {
          navigate(`/lobby?room=${roomId}&player=${player.id}`);
        } else {
          navigate(`/lobby?room=${roomId}&player=${player.id}`);
        }
      } catch (error) {
        console.error("Error setting up profile:", error);
        toast.error("Failed to join room. Please try again.");
      } finally {
        setIsLoading(false);
      }
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
            disabled={!nickname || !selectedMood || isLoading}
          >
            {isLoading ? "Joining..." : "Continue →"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
