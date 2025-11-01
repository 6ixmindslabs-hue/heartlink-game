import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FloatingHearts } from "@/components/FloatingHearts";
import { GameWheel } from "@/components/GameWheel";
import { QuestionCard } from "@/components/QuestionCard";
import { HeartMeter } from "@/components/HeartMeter";
import galaxyBg from "@/assets/galaxy-bg.jpg";
import { supabase } from "@/integrations/supabase/client";

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
          
          setCurrentRound(newRound);
          setCurrentQuestion(newQuestion);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const handleSpinResult = async (result: "truth" | "dare") => {
    setIsSpinning(false);
    const questionList = result === "truth" ? questions[mode].truths : questions[mode].dares;
    const randomQuestion = questionList[Math.floor(Math.random() * questionList.length)];
    const newQuestion = { type: result, text: randomQuestion };
    
    setCurrentQuestion(newQuestion);

    // Sync to database if multiplayer
    if (roomId) {
      await supabase
        .from("game_rooms")
        .update({ current_question: newQuestion })
        .eq("id", roomId);
    }
  };

  const handleNext = async () => {
    if (currentRound < 10) {
      const newRound = currentRound + 1;
      setCurrentRound(newRound);
      setCurrentQuestion(null);

      // Sync to database if multiplayer
      if (roomId) {
        await supabase
          .from("game_rooms")
          .update({ 
            current_round: newRound,
            current_question: null 
          })
          .eq("id", roomId);
      }
    } else {
      // Game complete - could navigate to summary
      alert("🎉 You've completed all 10 rounds! Your HeartLink is strong! 💖");
    }
  };

  const handleDone = () => {
    handleNext();
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
        <div className="mb-8 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-romantic bg-clip-text text-transparent">
              Round {currentRound}/10
            </h2>
            <div className="px-4 py-2 bg-card/40 backdrop-blur-md rounded-full border border-primary/30">
              <span className="text-sm font-medium capitalize">{mode} Mode</span>
            </div>
          </div>
          <HeartMeter progress={progress} />
        </div>

        {/* Game Content */}
        <div className="flex-1 flex items-center justify-center">
          {!currentQuestion ? (
            <GameWheel 
              onResult={(result) => {
                setIsSpinning(true);
                handleSpinResult(result);
              }}
              isSpinning={isSpinning}
            />
          ) : (
            <QuestionCard
              type={currentQuestion.type}
              question={currentQuestion.text}
              onNext={handleNext}
              onDone={handleDone}
            />
          )}
        </div>
      </div>
    </div>
  );
}
