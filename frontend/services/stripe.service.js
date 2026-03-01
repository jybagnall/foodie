import Client from "./client";

class StripeService {
  constructor(abortController, getAccessToken) {
    this.client = new Client(abortController, getAccessToken);
  }

  async getErroredStripeEvents(params) {
    const query = new URLSearchParams();

    if (params.event_type) query.append("event_type", params.event_type);
    if (params.status) query.append("status", params.status);
    if (params.created_from) query.append("created_from", params.created_from);
    if (params.page) query.append("page", params.page);

    const url = `/api/stripe/events/unprocessed?${query.toString()}`;
    const data = await this.client.get(url);
    return data;
  }

  async getErroredStripeEventsCount() {
    const data = await this.client.get("/api/stripe/events/unprocessed/count");
    return data;
  }

  async getEventTypes() {
    const data = await this.client.get("/api/stripe/events/types");
    return data;
  }

  async getStripeDeadEventsCount() {
    const data = await this.client.get("/api/stripe/events/dead/count");
    return data;
  }

  async markStripeEventsAsNotified(lastSeenTime) {
    const data = await this.client.post("/api/stripe/events/dead/acknowledge", {
      lastSeenTime,
    });
    return data;
  }
}

// getFailedEvents(), retryEvent(id), replayEvent(id)
export default StripeService;
