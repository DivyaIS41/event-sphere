// backend/src/models/Registration.js
import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    department: { type: String, default: "", trim: true },
    year: { type: String, default: "", trim: true },
    status: { type: String, enum: ["confirmed", "waitlisted", "attended"], default: "confirmed" },
  },
  { timestamps: true }
);

/**
 * Prevent duplicate registration for same event + email
 */
registrationSchema.index(
  { eventId: 1, email: 1 },
  { unique: true }
);

export const Registration = mongoose.model(
  "Registration",
  registrationSchema
);
