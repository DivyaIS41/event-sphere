import express from "express";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getRegistrations,
  healthCheck,
  getMyRegistrations,
  cancelRegistration,
  getAnalytics,
} from "../controllers/event.controller.js";

const router = express.Router();

router.get("/health", healthCheck);

router.get("/events", getEvents);
router.post("/events", createEvent);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);
router.post("/events/:id/register", registerForEvent);
router.get("/events/:id/registrations", getRegistrations);
router.get("/registrations", getMyRegistrations);
router.delete("/registrations/:id", cancelRegistration);
router.get("/analytics", getAnalytics);

export default router;
