// 🍀 queryKeys를 만드는 factory 함수 (React Query key 중앙 관리실)
// 왜? 여러 곳에서 써야함

export const stripeKeys = {
  all: ["stripe"],
  events: (eventType, status, timeRange, page) => [
    ...stripeKeys.all,
    "events",
    eventType,
    status,
    timeRange,
    page,
  ],
  eventTypes: (eventType, status, timeRange) => [
    ...stripeKeys.all,
    "eventTypes",
    eventType,
    status,
    timeRange,
  ],
  erroredCounts: (eventType, status, timeRange) => [
    ...stripeKeys.all,
    "erroredCounts",
    eventType,
    status,
    timeRange,
  ],
  deadCounts: () => [...stripeKeys.all, "deadCounts"],
};
