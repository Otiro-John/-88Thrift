import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mapProduct, type Product } from "@/lib/products";

let cache: Product[] | null = null;
const subs = new Set<() => void>();
let loading = false;

async function fetchAll() {
  if (loading) return;
  loading = true;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  loading = false;
  if (error) { console.error("Failed to load products", error); return; }
  cache = (data ?? []).map(mapProduct);
  subs.forEach((s) => s());
}

export function refreshProducts() {
  cache = null;
  return fetchAll();
}

export function useProducts() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const sub = () => setTick((t) => t + 1);
    subs.add(sub);
    if (cache === null) fetchAll();
    return () => { subs.delete(sub); };
  }, []);
  return { products: cache ?? [], loaded: cache !== null };
}

export function useProduct(slug: string) {
  const { products, loaded } = useProducts();
  return { product: products.find((p) => p.slug === slug), loaded };
}

export function findById(id: string): Product | undefined {
  return cache?.find((p) => p.id === id);
}