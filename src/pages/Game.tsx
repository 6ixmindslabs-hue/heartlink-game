import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FloatingHearts } from "@/components/FloatingHearts";
import { GameWheel } from "@/components/GameWheel";
import { QuestionCard } from "@/components/QuestionCard";
import { HeartMeter } from "@/components/HeartMeter";
import { GameHistory } from "@/components/GameHistory";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import galaxyBg from "@/assets/galaxy-bg.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Sample questions database
const questions = {
  friendly: {
    truths: [
      "What's your funniest school memory?",
      "If you could have any superpower, what would it be?",
      "What's the most embarrassing thing that happened to you?",
      "What's your secret talent?",
      "Who's your celebrity crush?",
    ],
    dares: [
      "Take a selfie making your goofiest face!",
      "Do your best impression of a celebrity",
      "Dance for 30 seconds without music",
      "Send a funny meme to a random contact",
      "Speak in an accent for the next 2 rounds",
    ],
  },
  crush: {
    truths: [
      "Who do you secretly think about when you wake up?",
      "What's your idea of a perfect date?",
      "Have you ever had a crush on someone in this chat?",
      "What makes you instantly attracted to someone?",
      "What's the sweetest thing someone has done for you?",
    ],
    dares: [
      "Send your crush a random emoji without explanation 😏",
      "Compliment the other player in the sweetest way",
      "Share your favorite love song",
      "Tell a romantic story that moved you",
      "Describe what your dream partner looks like",
    ],
  },
  adult: {
    truths: [
      "What kind of moment instantly melts your heart?",
      "If we were together right now, what would you want to do first?",
      "What's your love language?",
      "What's the most romantic thing you've ever experienced?",
      "What makes you feel most connected to someone?",
    ],
    dares: [
      "Compliment the other player in the sweetest way you can",
      "Send a voice note describing your perfect date",
      "Share a song that describes how you feel right now",
      "Write a short romantic message to the other player",
      "Share what you find most attractive about the other person",
    ],
  },
};

export default function Game() {
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") || "friendly") as keyof typeof questions;
  const roomId = searchParams.get("room");
  const playerId = searchParams.get("player");
  
  const [currentRound, setCurrentRound] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<{type: "truth" | "dare", text: string} | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMyTurn = currentPlayerId === playerId;
  const currentPlayerName = players.find(p => p.id === currentPlayerId)?.nickname || "Unknown";

  // Load initial game state
  useEffect(() => {
    if (!roomId) return;

    const loadGameState = async () => {
      // Load room data
      const { data: room } = await supabase
        .from("game_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (room) {
        setCurrentRound(room.current_round);
        setCurrentQuestion(room.current_question as {type: "truth" | "dare", text: string} | null);
        setCurrentPlayerId(room.current_player_id);
        setHistory((room.question_history as any[]) || []);
      }

      // Load players
      const { data: playersData } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", roomId)
        .order("joined_at");

      if (playersData) {
        setPlayers(playersData);
        
        // Set first player as current if not set
        if (!room?.current_player_id && playersData.length > 0) {
          await supabase
            .from("game_rooms")
            .update({ current_player_id: playersData[0].id })
            .eq("id", roomId);
        }
      }
    };

    loadGameState();
  }, [roomId]);

  // Sync game state with database if multiplayer
  useEffect(() => {
    if (!roomId) return;

    // Subscribe to room updates
    const channel = supabase
      .channel(`game-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const newRound = payload.new.current_round as number;
          const newQuestion = payload.new.current_question as {type: "truth" | "dare", text: string} | null;
          const newCurrentPlayerId = payload.new.current_player_id as string;
          const newHistory = (payload.new.question_history as any[]) || [];
          
          setCurrentRound(newRound);
          setCurrentQuestion(newQuestion);
          setCurrentPlayerId(newCurrentPlayerId);
          setHistory(newHistory);
          setAnswer("");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const handleSpinResult = async (result: "truth" | "dare") => {
    if (!isMyTurn) return;
    
    setIsSpinning(false);
    const questionList = result === "truth" ? questions[mode].truths : questions[mode].dares;
    const randomQuestion = questionList[Math.floor(Math.random() * questionList.length)];
    const newQuestion = { type: result, text: randomQuestion };
    
    setCurrentQuestion(newQuestion);

    // Sync to database if multiplayer
    if (roomId) {
      await supabase
        .from("game_rooms")
        .update({ 
          current_question: newQuestion,
          current_answer: null
        })
        .eq("id", roomId);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!isMyTurn || !answer.trim() || !currentQuestion) return;
    
    setIsSubmitting(true);
    try {
      // Add to history
      const newHistoryEntry = {
        round: currentRound,
        type: currentQuestion.type,
        question: currentQuestion.text,
        answer: answer.trim(),
        playerName: currentPlayerName,
      };

      const updatedHistory = [...history, newHistoryEntry];

      if (roomId) {
        await supabase
          .from("game_rooms")
          .update({ 
            question_history: updatedHistory,
            current_answer: answer.trim()
          })
          .eq("id", roomId);
      }

      setHistory(updatedHistory);
      toast.success("Answer submitted!");
      
      // Auto-advance after answer
      setTimeout(() => handleNext(), 1000);
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!isMyTurn && roomId) {
      toast.error("Not your turn!");
      return;
    }

    // Add to history if dare (no answer needed)
    if (currentQuestion?.type === "dare" && roomId) {
      const newHistoryEntry = {
        round: currentRound,
        type: currentQuestion.type,
        question: currentQuestion.text,
        playerName: currentPlayerName,
      };
      const updatedHistory = [...history, newHistoryEntry];
      
      await supabase
        .from("game_rooms")
        .update({ question_history: updatedHistory })
        .eq("id", roomId);
    }

    if (currentRound < 10) {
      const newRound = currentRound + 1;
      
      // Switch to next player
      const currentPlayerIndex = players.findIndex(p => p.id === currentPlayerId);
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      const nextPlayerId = players[nextPlayerIndex]?.id;

      setCurrentRound(newRound);
      setCurrentQuestion(null);
      setAnswer("");

      // Sync to database if multiplayer
      if (roomId) {
        await supabase
          .from("game_rooms")
          .update({ 
            current_round: newRound,
            current_question: null,
            current_player_id: nextPlayerId,
            current_answer: null
          })
          .eq("id", roomId);
      }
    } else {
      // Game complete
      toast.success("🎉 You've completed all 10 rounds! Your HeartLink is strong! 💖");
    }
  };

  const handleDone = () => {
    if (currentQuestion?.type === "dare") {
      handleNext();
    }
  };

  const progress = (currentRound / 10) * 100;

  return (
    <div 
      className="min-h-screen relative flex flex-col p-4 md:p-8"
      style={{
        backgroundImage: `url(${galaxyBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <FloatingHearts />
      
      <div className="relative z-10 max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-romantic bg-clip-text text-transparent">
              Round {currentRound}/10
            </h2>
            <div className="px-4 py-2 bg-card/40 backdrop-blur-md rounded-full border border-primary/30">
              <span className="text-sm font-medium capitalize">{mode} Mode</span>
            </div>
          </div>
          
          {roomId && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Current Turn: <span className="font-bold text-romantic">{currentPlayerName}</span>
                {isMyTurn && <span className="ml-2 text-accent">(Your turn!)</span>}
              </p>
            </div>
          )}
          
          <HeartMeter progress={progress} />
        </div>

        {/* History Panel */}
        {roomId && (
          <div className="mb-6">
            <GameHistory history={history} />
          </div>
        )}

        {/* Game Content */}
        <div className="flex-1 flex items-center justify-center">
          {!currentQuestion ? (
            <div className="text-center">
              {isMyTurn ? (
                <GameWheel 
                  onResult={(result) => {
                    setIsSpinning(true);
                    handleSpinResult(result);
                  }}
                  isSpinning={isSpinning}
                />
              ) : (
                <div className="p-8 bg-card/40 backdrop-blur-md rounded-lg border-2 border-primary/30">
                  <p className="text-lg text-muted-foreground">
                    Waiting for {currentPlayerName} to spin...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-2xl">
              {currentQuestion.type === "truth" ? (
                <div className="p-8 bg-card/40 backdrop-blur-md border-2 border-primary/30 shadow-soft rounded-lg animate-fade-in">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold capitalize bg-gradient-romantic bg-clip-text text-transparent mb-4">
                      Truth Question
                    </h3>
                    <p className="text-lg leading-relaxed mb-6">
                      {currentQuestion.text}
                    </p>
                  </div>

                  {isMyTurn ? (
                    <div className="space-y-4">
                      <Input
                        placeholder="Type your answer here..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="bg-input/50 border-primary/30 text-lg"
                        disabled={isSubmitting}
                      />
                      <div className="flex gap-4">
                        <Button
                          variant="romantic"
                          size="lg"
                          onClick={handleSubmitAnswer}
                          disabled={!answer.trim() || isSubmitting}
                          className="flex-1"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Answer"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">
                        Waiting for {currentPlayerName} to answer...
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <QuestionCard
                  type={currentQuestion.type}
                  question={currentQuestion.text}
                  onNext={handleNext}
                  onDone={handleDone}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
