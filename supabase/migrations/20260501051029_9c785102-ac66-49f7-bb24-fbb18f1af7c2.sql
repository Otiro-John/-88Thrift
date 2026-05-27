-- Restore has_role as SECURITY DEFINER (canonical anti-recursion pattern for RLS).
ALTER FUNCTION public.has_role(uuid, app_role) SECURITY DEFINER;
-- It only reads user_roles for a specific user_id+role and returns boolean —
-- safe to expose to authenticated users (it's exactly what RLS policies use).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;
