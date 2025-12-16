import MarketingCard from "../models/marketingCard.model.js";
import MarketingEnquiry from "../models/marketingEnquiry.model.js";

export const createMarketingCard = async (req, res) => {
  try {
    const { name, title, description, price, coverImage, logo, badges = {}, gallery = [] } = req.body;

    if (!name || !title || !description || !price || !coverImage || !logo) {
      return res.status(400).json({ message: "name, title, description, price, coverImage, and logo are required" });
    }

    const normalizedBadges = {
      trusted: Boolean(badges.trusted),
      verified: Boolean(badges.verified),
      recommended: Boolean(badges.recommended),
    };

    const card = await MarketingCard.create({
      name,
      title,
      description,
      price,
      coverImage,
      logo,
      gallery,
      badges: normalizedBadges,
      createdBy: req.user?._id,
    });

    res.status(201).json(card);
  } catch (err) {
    console.error("Failed to create marketing card", err);
    res.status(500).json({ message: "Failed to create marketing card" });
  }
};

export const getMarketingCards = async (_req, res) => {
  try {
    const cards = await MarketingCard.find().sort({ createdAt: -1 });
    res.json(cards);
  } catch (err) {
    console.error("Failed to fetch marketing cards", err);
    res.status(500).json({ message: "Failed to fetch marketing cards" });
  }
};

export const getMarketingCardById = async (req, res) => {
  try {
    const card = await MarketingCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Marketing card not found" });
    res.json(card);
  } catch (err) {
    console.error("Failed to fetch marketing card", err);
    res.status(500).json({ message: "Failed to fetch marketing card" });
  }
};

export const createMarketingEnquiry = async (req, res) => {
  try {
    const { buyerName, email, mobile } = req.body;
    const { id } = req.params;

    if (!buyerName || !email || !mobile) {
      return res.status(400).json({ message: "buyerName, email, and mobile are required" });
    }

    const card = await MarketingCard.findById(id);
    if (!card) return res.status(404).json({ message: "Marketing card not found" });

    const enquiry = await MarketingEnquiry.create({
      card: card._id,
      cardName: card.name,
      cardTitle: card.title,
      cardPrice: card.price,
      buyerName,
      email,
      mobile,
    });

    res.status(201).json(enquiry);
  } catch (err) {
    console.error("Failed to create marketing enquiry", err);
    res.status(500).json({ message: "Failed to create marketing enquiry" });
  }
};

export const updateMarketingCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, description, price, coverImage, logo, badges = {}, gallery = [] } = req.body;

    if (!name || !title || !description || !price || !coverImage || !logo) {
      return res.status(400).json({ message: "name, title, description, price, coverImage, and logo are required" });
    }

    const normalizedBadges = {
      trusted: Boolean(badges.trusted),
      verified: Boolean(badges.verified),
      recommended: Boolean(badges.recommended),
    };

    const card = await MarketingCard.findByIdAndUpdate(
      id,
      {
        name,
        title,
        description,
        price,
        coverImage,
        logo,
        gallery,
        badges: normalizedBadges,
      },
      { new: true }
    );

    if (!card) return res.status(404).json({ message: "Marketing card not found" });

    res.json(card);
  } catch (err) {
    console.error("Failed to update marketing card", err);
    res.status(500).json({ message: "Failed to update marketing card" });
  }
};

export const deleteMarketingCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await MarketingCard.findByIdAndDelete(id);
    if (!card) return res.status(404).json({ message: "Marketing card not found" });
    res.json({ message: "Marketing card deleted successfully" });
  } catch (err) {
    console.error("Failed to delete marketing card", err);
    res.status(500).json({ message: "Failed to delete marketing card" });
  }
};

export const getMarketingEnquiries = async (_req, res) => {
  try {
    const enquiries = await MarketingEnquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    console.error("Failed to fetch marketing enquiries", err);
    res.status(500).json({ message: "Failed to fetch marketing enquiries" });
  }
};
