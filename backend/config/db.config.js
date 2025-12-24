import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected", mongoose.connection.host);
    console.log("Database Name:", mongoose.connection.name);
  } catch (err) {
    console.error("MongoDB Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
