export type Condition = "Excellent" | "Good" | "Fair";
export type Category = "Women" | "Men" | "Kids";

export interface Product {
  id: string;
  slug: string;
  title: string;
  category: string;
  type: string;
  brand?: string;
  size: string;
  color: string;
  condition: Condition;
  conditionNotes?: string;
  price: number;
  comparePrice?: number;
  description: string;
  measurements?: string;
  tags: string[];
  images: string[];
  status: "available" | "sold" | "reserved";
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isOnSale?: boolean;
}

export const CATEGORIES = [
  { name: "Women", emoji: "👗" },
  { name: "Men", emoji: "🧥" },
  { name: "Kids", emoji: "🧸" },
  { name: "Dresses", emoji: "💃" },
  { name: "Tops", emoji: "👚" },
  { name: "Trousers", emoji: "👖" },
  { name: "Shoes", emoji: "👟" },
  { name: "Bags", emoji: "👜" },
];

/** Map a DB row (snake_case) to the camelCase Product shape used in the UI. */
export function mapProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    type: row.type,
    brand: row.brand ?? undefined,
    size: row.size,
    color: row.color,
    condition: row.condition,
    conditionNotes: row.condition_notes ?? undefined,
    price: Number(row.price),
    comparePrice: row.compare_price != null ? Number(row.compare_price) : undefined,
    description: row.description ?? "",
    measurements: row.measurements ?? undefined,
    tags: row.tags ?? [],
    images: row.images ?? [],
    status: row.status,
    isFeatured: row.is_featured,
    isNewArrival: row.is_new_arrival,
    isOnSale: row.is_on_sale,
  };
}