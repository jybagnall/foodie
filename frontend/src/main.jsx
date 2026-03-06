import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import App from "../components/App.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1시간
      gcTime: 10 * 60 * 1000, // 어떤 화면에서도 그 쿼리를 안 쓰면 10분 뒤 캐시 삭제
      retry: 1, // 네트워크 실패시 queryFn (api 요청) 1번만 재시도
      refetchOnWindowFocus: false, // 포커스 돌아올 때 재요청 방지
      refetchOnReconnect: true, // 네트워크 복구 시 재요청
    },
    mutations: {
      retry: 0, // 주문/결제는 재시도 자동으로 하면 위험
    },
  },
});

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
);
