import { useState, useEffect, useCallback } from "react";
import StripeService from "../services/stripe.service";
import { getUserErrorMessage } from "../utils/getUserErrorMsg";
import { getTimeRangeStart } from "../utils/format";

// React Query
// const { data, isLoading } = useQuery(...)

// loading 상태 3개

// createService가 매번 controller 생성, 이전 요청 cancel 안 함.
// useRef controller 패턴이 필요해?

const LIMIT = 6;
export default function useStripeEventMonitor(accessToken) {
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isFetchingCount, setIsFetchingCount] = useState(false);
  const [isFetchingEventTypes, setIsFetchingEventTypes] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusSummary, setStatusSummary] = useState({
    failed: 0,
    dead: 0,
  });
  const [filters, setFilters] = useState({
    event_type: null,
    status: null,
    timeRange: null, // '30m', '1h', '3h', '6h', '12h','24h'
  });

  const [pagination, setPagination] = useState({
    pageNum: 1,
    totalMatchingEvents: 0,
    pageLimit: 0,
    totalPages: 0,
  });

  const createService = () => {
    const controller = new AbortController();
    return new StripeService(controller, () => accessToken);
  };

  const fetchCounts = useCallback(async () => {
    const stripeService = createService();

    try {
      setIsFetchingCount(true);
      setErrorMsg("");

      const res = await stripeService.getErroredStripeEventsCount();
      setStatusSummary({
        failed: res.failedCount,
        dead: res.deadCount,
      });
    } catch (err) {
      console.error(err);
      const message = getUserErrorMessage(err);
      if (message) {
        setErrorMsg(message);
      }
    } finally {
      setIsFetchingCount(false);
    }
  }, [accessToken]);

  const fetchEvents = useCallback(
    async (page = 1) => {
      const stripeService = createService();
      const created_from = getTimeRangeStart(filters.timeRange);

      try {
        setIsFetchingData(true);
        setErrorMsg("");

        const res = await stripeService.getErroredStripeEvents({
          event_type: filters.event_type,
          status: filters.status,
          created_from,
          page,
        });
        setEvents(res.data);
        // 디버깅이 필요함
        console.log("🍋‍🟩keys:", Object.keys(res));
        console.log("🍋‍🟩totalMatchingEvents:", res.totalMatchingEvents);
        console.log("🍋‍🟩pageLimit:", res.pageLimit);
        console.log("🍋‍🟩totalPages:", res.totalPages);

        setPagination((prev) => ({
          ...prev,
          totalMatchingEvents: res.totalMatchingEvents,
          pageLimit: res.pageLimit,
          totalPages: res.totalPages,
        }));
      } catch (err) {
        console.error(err);
        const message = getUserErrorMessage(err);
        if (message) {
          setErrorMsg(message);
        }
      } finally {
        setIsFetchingData(false);
      }
    },
    [accessToken, filters],
  ); // 최신 filters 값을 참조해서 함수가 재생성됨.

  const fetchEventTypes = useCallback(async () => {
    const stripeService = createService();

    try {
      setIsFetchingEventTypes(true);
      setErrorMsg("");

      const data = await stripeService.getEventTypes();
      setEventTypes(data);
    } catch (err) {
      console.error(err);
      const message = getUserErrorMessage(err);
      if (message) {
        setErrorMsg(message);
      }
    } finally {
      setIsFetchingEventTypes(false);
    }
  }, [accessToken]);

  const resetFilters = () => {
    const reset = {
      event_type: null,
      status: null,
      timeRange: null,
    };
    setFilters(reset);
    fetchEvents(1);
  }; // useCallback 으로 감싸야 하나?

  useEffect(() => {
    if (!accessToken) return;

    fetchCounts();
    fetchEventTypes();
    fetchEvents(1);
  }, [accessToken]);

  return {
    events,
    eventTypes,
    pagination,
    isFetchingData,
    isFetchingCount,
    isFetchingEventTypes,
    statusSummary,
    filters,
    errorMsg,
    fetchEvents,
    setFilters,
    resetFilters,
  };
}
