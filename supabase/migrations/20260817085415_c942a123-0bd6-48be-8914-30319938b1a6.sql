CREATE TABLE public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'paddle',
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);
GRANT ALL ON public.payment_events TO service_role;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.canvas_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.canvas_state TO authenticated;
GRANT ALL ON public.canvas_state TO service_role;
ALTER TABLE public.canvas_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "canvas_state_select_own" ON public.canvas_state FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "canvas_state_insert_own" ON public.canvas_state FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "canvas_state_update_own" ON public.canvas_state FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS favorite BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.generations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS variation_group UUID;

CREATE POLICY "generations_update_own" ON public.generations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
