import express from "express";

import { verifyAdminAuth } from "../middleware/auth.middleware.js";
import {
  acknowledgeFailures,
  getUnprocessedEvents,
  getDeadEventsCount,
  getUnprocessedEventsCount,
  getEventTypes,
} from "../services/stripe-service.js";

const router = express.Router();

router.get("/events/dead/count", verifyAdminAuth, async (req, res) => {
  try {
    const { count, lastSeenTime } = await getDeadEventsCount();
    res.status(200).json({ count, lastSeenTime });
  } catch (err) {
    console.error("Stripe dead events count error:", err);
    return res.status(500).json({
      error: "Failed to get failed Stripe events count.",
    });
  }
});

router.get("/events/types", verifyAdminAuth, async (req, res) => {
  try {
    const eventTypes = await getEventTypes();
    res.status(200).json(eventTypes);
  } catch (err) {
    console.error("Stripe event_types fetching error:", err);
    return res.status(500).json({
      error: "Failed to get Stripe event_types.",
    });
  }
});

router.get("/events/unprocessed", verifyAdminAuth, async (req, res) => {
  try {
    const filters = {
      event_type: req.query.event_type || null,
      status: req.query.status || null,
      created_from: req.query.created_from || null,
      page: Math.max(1, Number(req.query.page) || 1),
    };

    const { data, totalMatchingEvents, pageLimit, totalPages } =
      await getUnprocessedEvents(filters);

    return res
      .status(200)
      .json({ data, totalMatchingEvents, pageLimit, totalPages });
  } catch (err) {
    console.error("fetching error:", err);
    return res.status(500).json({
      error: "Failed to get unprocessed Stripe events.",
    });
  }
});

router.get("/events/unprocessed/count", verifyAdminAuth, async (req, res) => {
  try {
    const { failedCount, deadCount } = await getUnprocessedEventsCount();
    return res.status(200).json({ failedCount, deadCount });
  } catch (err) {
    console.error("fetching error:", err);
    return res.status(500).json({
      error: "Failed to get unprocessed Stripe events.",
    });
  }
});

router.post("/events/dead/acknowledge", verifyAdminAuth, async (req, res) => {
  try {
    const { lastSeenTime } = req.body;

    if (!lastSeenTime) {
      return res.status(200).json({ success: true }); // 업데이트할 게 없음
    }
    await acknowledgeFailures(lastSeenTime);
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
