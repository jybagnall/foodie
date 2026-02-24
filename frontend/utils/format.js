// Intl.NumberFormat이라는 내장 클래스를 이용해서
// “숫자를 통화 형식으로 바꿔주는 객체”를 만드는 것.
// 따라서 이 객체가 가지고 있는 메서드 .format()을 써서 실제 변환을 수행함

export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function getTimeRangeStart(rangeKey) {
  if (!rangeKey) return null;

  const now = new Date();

  const ranges = {
    "30m": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "3h": 3 * 60 * 60 * 1000,
    "6h": 6 * 60 * 60 * 1000,
    "12h": 12 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
  };

  const diff = ranges[rangeKey];
  if (!diff) return null;

  return new Date(now.getTime() - diff).toISOString();
} // ISO 문자열로 변환: "2026-02-22T05:12:31.234Z"
