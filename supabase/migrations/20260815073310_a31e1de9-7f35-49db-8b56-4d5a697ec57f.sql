CREATE TYPE public.gen_mode AS ENUM ('mobile', 'web', 'system');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.credit_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  plan TEXT NOT NULL DEFAULT 'free',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_balances TO authenticated;
GRANT ALL ON public.credit_balances TO service_role;
ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credit_balances_select_own" ON public.credit_balances FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_ledger TO authenticated;
GRANT ALL ON public.credit_ledger TO service_role;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credit_ledger_select_own" ON public.credit_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX credit_ledger_user_idx ON public.credit_ledger (user_id, created_at DESC);

CREATE TABLE public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  mode public.gen_mode NOT NULL DEFAULT 'mobile',
  style TEXT NOT NULL DEFAULT 'modern',
  image_url TEXT,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generations TO authenticated;
GRANT ALL ON public.generations TO service_role;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "generations_select_own" ON public.generations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "generations_insert_own" ON public.generations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "generations_delete_own" ON public.generations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX generations_user_idx ON public.generations (user_id, created_at DESC);

CREATE TABLE public.subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  provider TEXT NOT NULL DEFAULT 'paddle',
  provider_ref TEXT,
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)), NEW.raw_user_meta_data ->> 'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.credit_balances (user_id, credits, plan)
  VALUES (NEW.id, 0, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.grant_credits(_user_id UUID, _amount INTEGER, _reason TEXT, _reference TEXT DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  INSERT INTO public.credit_balances (user_id, credits)
  VALUES (_user_id, GREATEST(_amount, 0))
  ON CONFLICT (user_id) DO UPDATE SET credits = public.credit_balances.credits + _amount, updated_at = now()
  RETURNING credits INTO new_balance;
  INSERT INTO public.credit_ledger (user_id, delta, reason, reference)
  VALUES (_user_id, _amount, _reason, _reference);
  RETURN new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION public.spend_credits(_user_id UUID, _amount INTEGER, _reason TEXT, _reference TEXT DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE public.credit_balances
  SET credits = credits - _amount, updated_at = now()
  WHERE user_id = _user_id AND credits >= _amount
  RETURNING credits INTO new_balance;
  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;
  INSERT INTO public.credit_ledger (user_id, delta, reason, reference)
  VALUES (_user_id, -_amount, _reason, _reference);
  RETURN new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_credits(UUID, INTEGER, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_credits(UUID, INTEGER, TEXT, TEXT) TO service_role;
REVOKE ALL ON FUNCTION public.spend_credits(UUID, INTEGER, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spend_credits(UUID, INTEGER, TEXT, TEXT) TO service_role;