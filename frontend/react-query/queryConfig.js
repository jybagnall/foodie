export const POLLING_30S = {
  staleTime: 30000,
  refetchInterval: 30000,
  refetchOnWindowFocus: true, // 탭에 다시 돌아왔을 때 refetch?
  refetchIntervalInBackground: false, // 사용자가 안 보고 있으면 API 요청?
};

export const adaptivePolling = (data) => {
  if (!data) return false; // 문제 없음 → polling 없음

  const { deadCount, failedCount } = data;
  return deadCount > 0 || failedCount > 0 ? 30000 : 60000;
};
// React Query가 자동으로 data를 넣어줌. 즉,
// queryFn의 return 값이 cache (= query.data = data) 에 저장되어 있음.
