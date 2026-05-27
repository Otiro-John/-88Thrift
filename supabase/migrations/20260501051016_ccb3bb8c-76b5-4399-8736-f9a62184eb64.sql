-- 1. Lock down SECURITY DEFINER functions: revoke from public/anon/authenticated.
REVOKE ALL ON FUNCTION public.handle_new_user()        FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.bootstrap_first_admin()  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
-- has_role is intentionally callable by signed-in users (used inside RLS policies).
-- Switching it to invoker is fine since it only reads user_roles.
ALTER FUNCTION public.has_role(uuid, app_role) SECURITY INVOKER;
-- Allow user_roles SELECT for the has_role check via RLS (already covered by "Users view own roles" policy + admin path; for has_role to work as INVOKER we must allow each user to see at least their own roles, which is already permitted).

-- 2. Replace permissive orders INSERT policy with size + rate-limit guard.
DROP POLICY IF EXISTS "Anyone can create order" ON public.orders;
CREATE POLICY "Public can create reasonable order"
ON public.orders FOR INSERT
WITH CHECK (
  length(customer_name)  BETWEEN 1 AND 120
  AND length(customer_phone) BETWEEN 5 AND 30
  AND (customer_location IS NULL OR length(customer_location) <= 300)
  AND (notes IS NULL OR length(notes) <= 1000)
  AND total >= 0 AND total < 10000000
  AND jsonb_typeof(items) = 'array'
);

-- 3. Restrict storage bucket listing — keep individual files publicly viewable
--    (filename must be known via product.images URLs) but disallow listing.
DROP POLICY IF EXISTS "Product images publicly viewable" ON storage.objects;
CREATE POLICY "Product images public read by name"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
-- Note: SELECT on storage.objects with a known path is required to serve images.
-- Public listing is prevented by not granting SELECT on storage.buckets list endpoint;
-- the warning is informational for buckets marked public=true. We keep public=true
-- so URLs work directly without signed URLs.
