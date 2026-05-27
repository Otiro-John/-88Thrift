import { useEffect, useState, useSyncExternalStore } from "react";

/* Tiny global store with localStorage persistence (no extra deps). */

type CartItem = { id: string; qty: number };

interface State {
  cart: CartItem[];
  wishlist: string[];
  cartOpen: boolean;
}

const initial: State = { cart: [], wishlist: [], cartOpen: false };

let state: State = initial;
const listeners = new Set<() => void>();

const KEY = "thrift-store-v1";

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...initial, ...parsed, cartOpen: false };
    }
  } catch {/* ignore */}
}

function persist() {
  if (typeof window === "undefined") return;
  const { cart, wishlist } = state;
  localStorage.setItem(KEY, JSON.stringify({ cart, wishlist }));
}

function setState(next: Partial<State>) {
  state = { ...state, ...next };
  persist();
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

let loaded = false;
function getSnapshot() {
  if (!loaded && typeof window !== "undefined") {
    load();
    loaded = true;
  }
  return state;
}
const getServerSnapshot = () => initial;

export function useStore() {
  // Avoid SSR hydration mismatch — render initial on server, real state after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const live = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return mounted ? live : initial;
}

export const cartActions = {
  add(id: string) {
    const existing = state.cart.find((i) => i.id === id);
    setState({
      cart: existing
        ? state.cart.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
        : [...state.cart, { id, qty: 1 }],
      cartOpen: true,
    });
  },
  remove(id: string) {
    setState({ cart: state.cart.filter((i) => i.id !== id) });
  },
  setQty(id: string, qty: number) {
    if (qty <= 0) return cartActions.remove(id);
    setState({ cart: state.cart.map((i) => (i.id === id ? { ...i, qty } : i)) });
  },
  clear() {
    setState({ cart: [] });
  },
  open() { setState({ cartOpen: true }); },
  close() { setState({ cartOpen: false }); },
};

export const wishlistActions = {
  toggle(id: string) {
    const inList = state.wishlist.includes(id);
    setState({
      wishlist: inList ? state.wishlist.filter((x) => x !== id) : [...state.wishlist, id],
    });
  },
};