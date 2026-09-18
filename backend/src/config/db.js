import mongoose from "mongoose";

export async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes("<db_password>")) {
    throw new Error(
      "Set a real MongoDB password in backend/.env (replace <db_password> in MONGO_URI)."
    );
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}
