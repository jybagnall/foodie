import express from "express";

import { verifyAdminAuth } from "../middleware/auth.middleware.js";
import {
  acknowledgeFailures,
  getUnprocessedEvents,
  getDeadEventsCount,
  getUnprocessedEventsCount,
} from "../services/stripe-service.js";

const router = express.Router();

router.get("/events/dead/count", verifyAdminAuth, async (req, res) => {
  try {
    const count = await getDeadEventsCount();
    res.status(200).json(count);
  } catch (err) {
    console.error("Stripe dead events count error:", err);
    return res.status(500).json({
      error: "Failed to get failed Stripe events count.",
    });
  }
});

router.get("/events/unprocessed", verifyAdminAuth, async (req, res) => {
  try {
    const { event_type, status, created_from, page = 1 } = req.query;
    const safePage = Math.max(1, Number(page) || 1);

    const { data, total } = await getUnprocessedEvents(
      event_type,
      status,
      created_from,
      safePage,
    );

    return res.status(200).json({ data, total });
  } catch (err) {
    console.error("fetching error:", err);
    return res.status(500).json({
      error: "Failed to get unprocessed Stripe events.",
    });
  }
});

router.get("/events/unprocessed/count", verifyAdminAuth, async (req, res) => {
  try {
    const { counts } = await getUnprocessedEventsCount();
    const failed = counts.failedCount;
    const dead = counts.deadCount;
    return res.status(200).json({ failed, dead });
  } catch (err) {
    console.error("fetching error:", err);
    return res.status(500).json({
      error: "Failed to get unprocessed Stripe events.",
    });
  }
});

router.post("/events/dead/acknowledge", verifyAdminAuth, async (req, res) => {
  try {
    await acknowledgeFailures();
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Acknowledge error:", err);
    return res.status(500).json({
      error: "Failed to acknowledge failures.",
    });
  }
});

export default router;

// GET    /api/stripe/events?status=failed
// GET    /api/stripe/events/failures/count
// POST   /api/stripe/events/:id/retry
// POST   /api/stripe/events/:id/replay
// GET    /api/stripe/events/:id/logs
