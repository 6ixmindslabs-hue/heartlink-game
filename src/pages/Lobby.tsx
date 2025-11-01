import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingHearts } from "@/components/FloatingHearts";
import { Users, Copy, Check } from "lucide-react";
import galaxyBg from "@/assets/galaxy-bg.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Player {
  id: string;
  nickname: string;
  mood_emoji: string;
  is_host: boolean;
}

export default function Lobby() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room");
  const playerId = searchParams.get("player");
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  const [roomStatus, setRoomStatus] = useState<string>("waiting");

  useEffect(() => {
    if (!roomId || !playerId) {
      navigate("/");
      return;
    }

    // Fetch initial players
    const fetchPlayers = async () => {
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", roomId)
        .order("joined_at");
      
      if (data) {
        setPlayers(data);
        const currentPlayer = data.find(p => p.id === playerId);
        setIsHost(currentPlayer?.is_host || false);
      }
    };

    fetchPlayers();

    // Subscribe to player changes
    const playersChannel = supabase
      .channel(`players-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          fetchPlayers();
        }
      )
      .subscribe();

    // Subscribe to room status changes
    const roomChannel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const newStatus = payload.new.status as string;
          setRoomStatus(newStatus);
          
          if (newStatus === "playing") {
            const mode = payload.new.mode;
            navigate(`/game?room=${roomId}&player=${playerId}&mode=${mode}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(roomChannel);
    };
  }, [roomId, playerId, navigate]);

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success("Room ID copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartGame = () => {
    if (isHost) {
      navigate(`/mode-select?room=${roomId}&player=${playerId}`);
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

      <div className="relative z-10 max-w-2xl w-full animate-fade-in">
        <Card className="p-8 md:p-12 bg-card/40 backdrop-blur-md border-2 border-primary/30 shadow-glow">
          <div className="text-center mb-8">
            <Users className="mx-auto mb-4 text-romantic animate-pulse" size={48} />
            <h1 className="text-4xl font-bold mb-2 bg-gradient-romantic bg-clip-text text-transparent">
              Game Lobby
            </h1>
            <p className="text-muted-foreground">Waiting for all players to join...</p>
          </div>

          <div className="mb-8 p-4 bg-primary/10 rounded-lg border border-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Room ID</p>
                <p className="text-2xl font-bold tracking-widest">{roomId}</p>
              </div>
              <Button
                variant="glass"
                size="icon"
                onClick={handleCopyRoomId}
                className="h-12 w-12"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Players ({players.length})</h3>
            <div className="space-y-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 bg-card/30 rounded-lg border border-primary/20"
                >
                  <span className="text-3xl">{player.mood_emoji}</span>
                  <span className="flex-1 font-medium">{player.nickname}</span>
                  {player.is_host && (
                    <span className="px-2 py-1 bg-romantic/20 text-romantic text-xs rounded-full border border-romantic/30">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isHost && (
            <Button
              variant="romantic"
              size="lg"
              className="w-full font-semibold text-lg"
              onClick={handleStartGame}
              disabled={players.length < 2}
            >
              Start Game →
            </Button>
          )}

          {!isHost && (
            <div className="text-center text-muted-foreground">
              Waiting for host to start the game...
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
