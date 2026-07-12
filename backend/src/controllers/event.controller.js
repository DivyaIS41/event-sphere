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

const eventPayload = (body) => ({
  title: body.title, description: body.description, date: body.date,
  capacity: parseCapacity(body.capacity), speakers: normalizeSpeakers(body.speakers),
  category: body.category || "General", venue: body.venue || "Campus",
  organizer: body.organizer || "EventSphere Team", startTime: body.startTime || "10:00",
  duration: body.duration || "2 hours", mode: body.mode || "Offline",
  status: body.status || "published", registrationDeadline: body.registrationDeadline || null,
  tags: normalizeSpeakers(body.tags), featured: Boolean(body.featured),
});

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
    const payload = eventPayload(req.body);

    const event = await Event.create(payload);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = eventPayload(req.body);

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
    const { name, email, department, year } = req.body;

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

    if (event.status !== "published") return res.status(409).json({ message: "Registration is not open" });
    if (event.registrationDeadline && new Date() > event.registrationDeadline) return res.status(409).json({ message: "Registration deadline has passed" });

    if (event.capacity > 0 && registrationsCount >= event.capacity) {
      return res.status(409).json({
        message: "Event is full",
      });
    }

    await Registration.create({
      eventId: id,
      name,
      email,
      department,
      year,
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

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    await Registration.deleteMany({ eventId: req.params.id });
    return res.status(204).send();
  } catch (err) { return res.status(400).json({ message: err.message }); }
};

export const getMyRegistrations = async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required" });
    return res.json(await Registration.find({ email }).populate("eventId").sort({ createdAt: -1 }));
  } catch { return res.status(500).json({ message: "Failed to load registrations" }); }
};

export const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) return res.status(404).json({ message: "Registration not found" });
    return res.status(204).send();
  } catch { return res.status(400).json({ message: "Unable to cancel registration" }); }
};

export const getAnalytics = async (req, res) => {
  try {
    const [events, registrations, attended, categories] = await Promise.all([
      Event.countDocuments(), Registration.countDocuments(), Registration.countDocuments({ status: "attended" }),
      Event.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }])
    ]);
    return res.json({ events, registrations, attended, categories });
  } catch { return res.status(500).json({ message: "Failed to load analytics" }); }
};
