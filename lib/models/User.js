import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: Number, required: true },
  role: { type: String, enum: ["citizen", "officer"], required: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: Number, required: true },
  registeredAt: { type: Date, default: Date.now(), required: true }
})

export default mongoose.models.User || mongoose.model("User", userSchema)