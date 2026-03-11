import Client from "./client";

class StripeService {
  constructor(getAccessToken) {
    this.getAccessToken = getAccessToken;
  }

  async getErroredStripeEvents(params) {
    const controller = new AbortController();
    const client = new Client(controller, this.getAccessToken);
    const query = new URLSearchParams();

    if (params.event_type) query.append("event_type", params.event_type);
    if (params.status) query.append("status", params.status);
    if (params.created_from) query.append("created_from", params.created_from);
    if (params.page) query.append("page", params.page);

    const url = `/api/stripe/events/unprocessed?${query.toString()}`;
    const data = await client.get(url);
    return data;
  }

  async getErroredStripeEventsCount() {
    const controller = new AbortController();
    const client = new Client(controller, this.getAccessToken);
    const data = await client.get("/api/stripe/events/unprocessed/count");
    return data;
  }

  async getEventTypes() {
    const controller = new AbortController();
    const client = new Client(controller, this.getAccessToken);
    const data = await client.get("/api/stripe/events/types");
    return data;
  }

  async getStripeDeadEventsCount() {
    const controller = new AbortController();
    const client = new Client(controller, this.getAccessToken);
    const data = await client.get("/api/stripe/events/dead/count");
    return data;
  }

  async markStripeEventsAsNotified(lastSeenTime) {
    const controller = new AbortController();
    const client = new Client(controller, this.getAccessToken);
    const data = await client.post("/api/stripe/events/dead/acknowledge", {
      lastSeenTime,
    });
    return data;
  }
}

export default StripeService;

// getFailedEvents(), retryEvent(id), replayEvent(id)
