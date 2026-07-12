import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      required: true,
    },
    capacity: {
      type: Number,
      default: 0,
    },
    speakers: {
      type: [String],
      default: [],
    },
    category: { type: String, default: "General", trim: true },
    venue: { type: String, default: "Campus", trim: true },
    organizer: { type: String, default: "EventSphere Team", trim: true },
    startTime: { type: String, default: "10:00" },
    duration: { type: String, default: "2 hours", trim: true },
    mode: { type: String, enum: ["Offline", "Online", "Hybrid"], default: "Offline" },
    status: { type: String, enum: ["draft", "published", "cancelled"], default: "published" },
    registrationDeadline: { type: Date, default: null },
    tags: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
