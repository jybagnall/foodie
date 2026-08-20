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

router.get("/events/dead/count", verifyAdminAuth, async (req, res, next) => {
  try {
    const { count, lastSeenId } = await getDeadEventsCount();
    res.status(200).json({ count, lastSeenId });
  } catch (err) {
    return next(err);
  }
});

router.get("/events/types", verifyAdminAuth, async (req, res, next) => {
  try {
    const eventTypes = await getEventTypes();
    res.status(200).json(eventTypes);
  } catch (err) {
    return next(err);
  }
});

router.get("/events/unprocessed", verifyAdminAuth, async (req, res, next) => {
  try {
    const filters = {
      event_type: req.query.event_type || null,
      status: req.query.status || null,
      created_from: req.query.created_from || null,
      page: Math.max(1, parseInt(req.query.page, 10) || 1),
    };

    const { events, totalMatchingEvents, pageLimit, totalPages } =
      await getUnprocessedEvents(filters);

    return res
      .status(200)
      .json({ events, totalMatchingEvents, pageLimit, totalPages });
  } catch (err) {
    return next(err);
  }
});

router.get(
  "/events/unprocessed/count",
  verifyAdminAuth,
  async (req, res, next) => {
    try {
      const { failedCount, deadCount } = await getUnprocessedEventsCount();
      return res.status(200).json({ failedCount, deadCount });
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  "/events/dead/acknowledge",
  verifyAdminAuth,
  async (req, res, next) => {
    try {
      const lastSeenId = Number(req.body.lastSeenId);

      if (req.body.lastSeenId == null) {
        return res.status(200).json({ success: true }); // 업데이트할 게 없음
      }

      if (!Number.isInteger(lastSeenId) || lastSeenId < 1) {
        return res.status(400).json({
          error: "lastSeenId must be a positive integer",
        });
      }

      await acknowledgeFailures(lastSeenId);
      return res.status(200).json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
