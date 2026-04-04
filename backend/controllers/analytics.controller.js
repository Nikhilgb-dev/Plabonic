import SiteStat from "../models/siteStat.model.js";

export const recordVisit = async (_req, res) => {
  try {
    await SiteStat.findOneAndUpdate(
      { key: "website_visits" },
      { $inc: { value: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const getAnalyticsOverview = async (_req, res) => {
  try {
    const visits = await SiteStat.findOne({ key: "website_visits" });
    res.json({
      websiteVisits: visits?.value || 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};
