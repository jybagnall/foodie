import { useState, useEffect, useCallback } from "react";
import StripeService from "../services/stripe.service";
import { getUserErrorMessage } from "../utils/getUserErrorMsg";
import { getTimeRangeStart } from "../utils/format";

// onPageChange 로 검색
const LIMIT = 20;
export default function useStripeEventMonitor(accessToken) {
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isFetchingCount, setIsFetchingCount] = useState(false);
  const [isFetchingEventTypes, setIsFetchingEventTypes] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [totalMatchingEvents, setTotalMatchingEvents] = useState(0);
  const [statusSummary, setStatusSummary] = useState({
    failed: 0,
    dead: 0,
  });
  const [filters, setFilters] = useState({
    event_type: null,
    status: null,
    timeRange: null, // '30m', '1h', '3h', '6h', '12h','24h'
  });

  const totalPages = Math.ceil(totalMatchingEvents / LIMIT);

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
        failed: res.failed,
        dead: res.dead,
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
        setPageNum(page);
        setTotalMatchingEvents(res.total);
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
    [filters, accessToken],
  ); // 의존성 배열에 무엇을?

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
    setFilters({
      event_type: null,
      status: null,
      timeRange: null,
    });
  }; // useCallback 으로 감싸야 하나?

  // ✅ 페이지 진입 시 1회
  useEffect(() => {
    fetchCounts();
    fetchEventTypes();
  }, [accessToken]);

  // ✅ 필터 변경 시 테이블만 갱신
  useEffect(() => {
    fetchEvents(1);
  }, [filters]);

  return {
    events,
    eventTypes,
    pageNum,
    isFetchingData,
    isFetchingCount,
    isFetchingEventTypes,
    totalMatchingEvents,
    statusSummary,
    totalPages,
    filters,
    errorMsg,
    fetchEvents,
    setFilters,
    resetFilters,
  };
}
