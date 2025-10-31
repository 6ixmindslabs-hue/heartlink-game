import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Zap } from "lucide-react";

interface QuestionCardProps {
  type: "truth" | "dare";
  question: string;
  onNext: () => void;
  onDone: () => void;
}

export const QuestionCard = ({ type, question, onNext, onDone }: QuestionCardProps) => {
  return (
    <Card className="p-8 bg-card/40 backdrop-blur-md border-2 border-primary/30 shadow-soft max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        {type === "truth" ? (
          <Heart className="text-romantic" size={28} fill="currentColor" />
        ) : (
          <Zap className="text-accent" size={28} />
        )}
        <h3 className="text-2xl font-bold capitalize bg-gradient-romantic bg-clip-text text-transparent">
          {type}
        </h3>
      </div>
      
      <p className="text-lg text-foreground leading-relaxed mb-8 min-h-[80px]">
        {question}
      </p>
      
      <div className="flex gap-4">
        <Button 
          variant="glass" 
          size="lg" 
          onClick={onDone}
          className="flex-1"
        >
          Done ✅
        </Button>
        <Button 
          variant="romantic" 
          size="lg" 
          onClick={onNext}
          className="flex-1"
        >
          Next ➜
        </Button>
      </div>
    </Card>
  );
};
