import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.config.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import jobRoutes from "./routes/job.routes.js";
import communityRoutes from "./routes/community.routes.js";
import authRoutes from "./routes/auth.route.js";
import companyRoutes from "./routes/company.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import freelanceRoutes from "./routes/freelancer.routes.js";
import marketingRoutes from "./routes/marketing.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import path from "path";

const __dirname = path.resolve();

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get("/", (req, res) => res.send("Job Portal API running..."));

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

app.use("/api/jobs", jobRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/freelancers", freelanceRoutes);
app.use("/api/marketing", marketingRoutes);
app.use("/api/upload", uploadRoutes);

app.use(express.static(path.join(__dirname, "/client/dist")));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
