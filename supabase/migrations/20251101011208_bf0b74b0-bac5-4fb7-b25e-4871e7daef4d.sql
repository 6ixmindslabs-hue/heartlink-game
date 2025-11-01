-- Add turn management and history to game_rooms
ALTER TABLE public.game_rooms 
  ADD COLUMN current_player_id UUID REFERENCES public.players(id),
  ADD COLUMN question_history JSONB DEFAULT '[]'::jsonb;

-- Add answer field to store player responses
ALTER TABLE public.game_rooms
  ADD COLUMN current_answer TEXT;