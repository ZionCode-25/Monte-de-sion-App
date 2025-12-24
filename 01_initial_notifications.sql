
-- 1. Create Enum for Notification Types if it doesn't exist
-- DO $$ BEGIN
--     CREATE TYPE notification_type AS ENUM ('comment', 'like', 'system', 'event');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- 2. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'like', 'system', 'event')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

-- 3. RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Trigger Function: Notify on Comment
CREATE OR REPLACE FUNCTION public.handle_new_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  commenter_name TEXT;
  post_content_snippet TEXT;
BEGIN
  -- Get post owner and content snippet
  SELECT user_id, LEFT(content, 20) INTO post_owner_id, post_content_snippet
  FROM public.posts
  WHERE id = NEW.post_id;

  -- Get commenter name
  SELECT name INTO commenter_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Verify it's not self-comment
  IF post_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      post_owner_id,
      'comment',
      'Nuevo Comentario',
      COALESCE(commenter_name, 'Alguien') || ' comentó: "' || LEFT(NEW.content, 30) || '..."',
      jsonb_build_object('post_id', NEW.post_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger: Notify on Comment
DROP TRIGGER IF EXISTS on_comment_create_notify ON public.comments;
CREATE TRIGGER on_comment_create_notify
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_comment_notification();


-- 6. Trigger Function: Notify on Like
CREATE OR REPLACE FUNCTION public.handle_new_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  liker_name TEXT;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id
  FROM public.posts
  WHERE id = NEW.post_id;

  -- Get liker name
  SELECT name INTO liker_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Verify it's not self-like
  IF post_owner_id != NEW.user_id THEN
    -- Check if notification already exists to avoid spam (optional, but good)
    IF NOT EXISTS (
        SELECT 1 FROM public.notifications 
        WHERE user_id = post_owner_id 
        AND type = 'like' 
        AND metadata->>'post_id' = NEW.post_id::text
        AND created_at > NOW() - INTERVAL '1 hour'
    ) THEN
        INSERT INTO public.notifications (user_id, type, title, message, metadata)
        VALUES (
          post_owner_id,
          'like',
          'Nuevo Me Gusta',
          'A ' || COALESCE(liker_name, 'Alguien') || ' le gustó tu publicación.',
          jsonb_build_object('post_id', NEW.post_id)
        );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger: Notify on Like
DROP TRIGGER IF EXISTS on_like_create_notify ON public.likes;
CREATE TRIGGER on_like_create_notify
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_like_notification();
