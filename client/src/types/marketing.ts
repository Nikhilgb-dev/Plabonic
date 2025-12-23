export type MarketingBadges = {
  trusted: boolean;
  verified: boolean;
  recommended: boolean;
};

export type MarketingCard = {
  _id: string;
  id?: string;
  name: string;
  title: string;
  description: string;
  originalPrice?: number;
  price: number;
  coverImage: string;
  logo: string;
  badges: MarketingBadges;
  gallery: string[];
  createdAt: string;
};

export type MarketingEnquiry = {
  _id: string;
  id?: string;
  card: string;
  cardId?: string;
  cardTitle: string;
  cardName: string;
  cardPrice: number;
  quantity: number;
  total: number;
  buyerName: string;
  email: string;
  mobile: string;
  whatsappNumber?: string;
  createdAt: string;
};
