import mongoose from "mongoose"

const reportCategories = ["road_dump", "unpicked_garbage", "overflowing_dustbin", "near_water_body", "dead_animal", "illegal_dumping", "industrial_waste", "open_dumpyard", "hospital_waste", "market_waste", "wastewater_leak"]

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minLength: 5, maxlength: 100 },
  desc: { type: String, required: true, trim: true, minLength: 10, maxlength: 1000 },
  category: { type: String, enum: reportCategories, required: true },
  status: { type: String, enum: ["pending", "resolved"], default: "pending", required: true, index: true },
  address: { type: String, required: true, trim: true, minLength: 10, maxlength: 200 },
  state: { type: String, required: true, trim: true, index: true },
  city: { type: String, required: true, trim: true, index: true },
  pincode: { type: Number, required: true },
  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 },
  images: { type: [String], default: [], validate: [arr => arr.length >= 1 && arr.length <= 4, "Must provide 1 to 4 images"] },
  resolvedImages: { type: [String], default: [], validate: [arr => arr.length <= 4, "Max 4 images"] },
  submittedBy: { type: String, required: true, trim: true, index: true },
  resolvedBy: { type: String, default: "", trim: true },
  officerResponse: { type: String, default: "", trim: true, minLength: 10, maxlength: 1000 },
  isAnonymous: { type: Boolean, required: true },
  submittedAt: { type: Date, default: Date.now, required: true },
  resolvedAt: { type: Date }
})

export default mongoose.models.Report || mongoose.model("Report", reportSchema)