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
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
