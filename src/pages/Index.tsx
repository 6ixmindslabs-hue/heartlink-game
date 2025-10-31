import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FloatingHearts } from "@/components/FloatingHearts";
import galaxyBg from "@/assets/galaxy-bg.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);

  const handleCreateRoom = () => {
    // In future: generate unique room ID and store in backend
    const generatedRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/profile?room=${generatedRoomId}`);
  };

  const handleJoinRoom = () => {
    if (roomId.length === 6) {
      navigate(`/profile?room=${roomId}`);
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
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      
      <FloatingHearts />

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full animate-fade-in">
        <div className="text-center mb-12">
          <Heart 
            className="mx-auto mb-6 text-romantic animate-heart-beat" 
            size={72} 
            fill="currentColor"
          />
          <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-romantic bg-clip-text text-transparent">
            HeartLink
          </h1>
          <p className="text-xl text-muted-foreground">
            Truth or Dare • Connect • Discover 💞
          </p>
        </div>

        <Card className="p-8 md:p-12 bg-card/40 backdrop-blur-md border-2 border-primary/30 shadow-glow">
          <div className="space-y-4">
            {!showJoinInput ? (
              <>
                <Button
                  variant="romantic"
                  size="lg"
                  className="w-full font-semibold text-lg h-14"
                  onClick={handleCreateRoom}
                >
                  <UserPlus className="mr-2" size={24} />
                  Create Room
                </Button>
                
                <Button
                  variant="glass"
                  size="lg"
                  className="w-full font-semibold text-lg h-14"
                  onClick={() => setShowJoinInput(true)}
                >
                  <Users className="mr-2" size={24} />
                  Join Room
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-center">
                    Enter 6-character Room ID
                  </label>
                  <Input
                    type="text"
                    placeholder="ABC123"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center text-lg tracking-widest bg-input/50 border-primary/30 focus:border-primary/50"
                  />
                </div>
                <Button
                  variant="romantic"
                  size="lg"
                  className="w-full font-semibold text-lg"
                  onClick={handleJoinRoom}
                  disabled={roomId.length !== 6}
                >
                  Join Game →
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setShowJoinInput(false);
                    setRoomId("");
                  }}
                >
                  ← Back
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-primary/20">
            <p className="text-center text-sm text-muted-foreground">
              Connect with friends or your crush through fun challenges ✨
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
