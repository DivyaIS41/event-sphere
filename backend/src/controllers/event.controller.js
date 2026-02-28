import { Event } from "../models/Event.js";
import { Registration } from "../models/Registration.js";

const normalizeSpeakers = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseCapacity = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.floor(num);
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    const ids = events.map((event) => event._id);

    const registrationStats = await Registration.aggregate([
      { $match: { eventId: { $in: ids } } },
      { $group: { _id: "$eventId", count: { $sum: 1 } } },
    ]);

    const countByEventId = new Map(
      registrationStats.map((entry) => [String(entry._id), entry.count])
    );

    const enriched = events.map((event) => {
      const eventObj = event.toObject();
      const registrationsCount = countByEventId.get(String(event._id)) || 0;
      const hasCapacity = eventObj.capacity > 0;
      const remainingSeats = hasCapacity
        ? Math.max(eventObj.capacity - registrationsCount, 0)
        : null;

      return {
        ...eventObj,
        registrationsCount,
        remainingSeats,
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const createEvent = async (req, res) => {
  try {
    const payload = {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      capacity: parseCapacity(req.body.capacity),
      speakers: normalizeSpeakers(req.body.speakers),
    };

    const event = await Event.create(payload);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      capacity: parseCapacity(req.body.capacity),
      speakers: normalizeSpeakers(req.body.speakers),
    };

    const event = await Event.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.json(event);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// backend/src/controllers/event.controller.js
export const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const registrationsCount = await Registration.countDocuments({
      eventId: id,
    });

    if (event.capacity > 0 && registrationsCount >= event.capacity) {
      return res.status(409).json({
        message: "Event is full",
      });
    }

    await Registration.create({
      eventId: id,
      name,
      email,
    });

    res.json({ message: "Registration successful" });
  } catch (err) {
    // 🔑 Duplicate registration
    if (err.code === 11000) {
      return res.status(409).json({
        message: "You are already registered for this event",
      });
    }

    res.status(500).json({
      message: "Registration failed",
    });
  }
};

export const getRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({
      eventId: req.params.id,
    });
    res.json(regs);
  } catch {
    res.status(500).json({ message: "Failed to load registrations" });
  }
};

export const healthCheck = (req, res) => {
  res.json({ status: "ok" });
};
