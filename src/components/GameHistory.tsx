import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History } from "lucide-react";

interface HistoryEntry {
  round: number;
  type: "truth" | "dare";
  question: string;
  answer?: string;
  playerName: string;
}

interface GameHistoryProps {
  history: HistoryEntry[];
}

export const GameHistory = ({ history }: GameHistoryProps) => {
  return (
    <Card className="p-4 bg-card/40 backdrop-blur-md border-2 border-primary/30">
      <div className="flex items-center gap-2 mb-3">
        <History className="text-accent" size={20} />
        <h3 className="font-semibold">Game History</h3>
      </div>
      
      <ScrollArea className="h-[200px] pr-4">
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No questions yet. Start playing!
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((entry, index) => (
              <div
                key={index}
                className="p-3 bg-primary/5 rounded-lg border border-primary/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-accent">
                    Round {entry.round}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-primary/20 rounded-full capitalize">
                    {entry.type}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {entry.playerName}
                  </span>
                </div>
                <p className="text-sm mb-1">{entry.question}</p>
                {entry.answer && (
                  <p className="text-xs text-accent italic">
                    → {entry.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
