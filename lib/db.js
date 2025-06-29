import mongoose from "mongoose"
import dotenv from "dotenv"

if (process.env.NODE_ENV !== "production") dotenv.config()

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("MongoDB connected successfully")
  } catch (err) {
    console.error("MongoDB connection error : ", err)
  }
}

export default connectDB