-- Enable RLS (Seguridad a nivel de fila)
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- 1. Políticas para LIKES
-- Permitir que CUALQUIERA vea los likes
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);

-- Permitir a usuarios autenticados dar like
DROP POLICY IF EXISTS "Users can insert their own likes" ON likes;
CREATE POLICY "Users can insert their own likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permitir a usuarios borrar SUS PROPIOS likes
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;
CREATE POLICY "Users can delete their own likes" ON likes FOR DELETE USING (auth.uid() = user_id);


-- 2. Políticas para COMENTARIOS
-- Permitir que CUALQUIERA vea los comentarios
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);

-- Permitir a usuarios autenticados comentar
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
CREATE POLICY "Users can insert their own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permitir editar/borrar SOLO tus propios comentarios
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);


-- 3. Políticas para LIKES en COMENTARIOS
DROP POLICY IF EXISTS "Comment likes viewable by everyone" ON comment_likes;
CREATE POLICY "Comment likes viewable by everyone" ON comment_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own comment likes" ON comment_likes;
CREATE POLICY "Users can manage their own comment likes" ON comment_likes FOR ALL USING (auth.uid() = user_id);
