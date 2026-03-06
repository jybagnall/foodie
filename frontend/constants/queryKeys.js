export const queryKeys = {
  stripeEvents: "stripeEvents",
  stripeEventTypes: "stripeEventTypes",
  stripeErroredCounts: "stripeErroredCounts",
  stripeDeadCounts: "stripeDeadCounts",
};

// 🍀 queryKeys를 factory 함수 형태로 만드는 방법도 있음.
// 장점: 1. queryKey 구조 통일, 2. invalidateQueries 편함

// export const queryKeys = {
//   stripeEvents: (filters, page) => [
//     "stripeEvents",
//     filters.event_type,
//     filters.status,
//     filters.timeRange,
//     page,
//   ],

//   stripeEventTypes: ["stripeEventTypes"],

//   stripeDeadCounts: ["stripeDeadCounts"],
// };
