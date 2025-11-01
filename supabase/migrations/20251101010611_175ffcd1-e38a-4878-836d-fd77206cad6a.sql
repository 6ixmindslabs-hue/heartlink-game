-- Create game_rooms table
CREATE TABLE public.game_rooms (
  id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  mode TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  current_round INTEGER DEFAULT 1,
  current_question JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  mood_emoji TEXT NOT NULL,
  is_host BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read game rooms
CREATE POLICY "Anyone can read game rooms"
  ON public.game_rooms
  FOR SELECT
  USING (true);

-- Allow anyone to create game rooms
CREATE POLICY "Anyone can create game rooms"
  ON public.game_rooms
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update game rooms
CREATE POLICY "Anyone can update game rooms"
  ON public.game_rooms
  FOR UPDATE
  USING (true);

-- Allow anyone to read players
CREATE POLICY "Anyone can read players"
  ON public.players
  FOR SELECT
  USING (true);

-- Allow anyone to create players
CREATE POLICY "Anyone can create players"
  ON public.players
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_game_rooms_updated_at
  BEFORE UPDATE ON public.game_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();