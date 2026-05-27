export const STORE = {
  name: "88Thrift",
  tagline: "Fresh Finds. Unbeatable Prices.",
  description: "Curated pre-loved fashion, hand-picked just for you.",
  whatsapp: "254796956137", // WhatsApp Business number (no +, no spaces)
  whatsappDisplay: "+254 796 956 137",
  instagram: "88thrift",
  location: "Nairobi, Kenya · Pickup: Westlands",
  currency: "KES",
  deliveryNote: "Delivery from KES 100 within Nairobi",
};

export const formatPrice = (n: number) =>
  `${STORE.currency} ${n.toLocaleString("en-KE")}`;

export const waLink = (message: string, phone = STORE.whatsapp) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;