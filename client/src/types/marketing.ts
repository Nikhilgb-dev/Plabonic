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
  buyerName: string;
  email: string;
  mobile: string;
  createdAt: string;
};
