export const authEvents = new EventTarget();

export const emitTokenRefreshed = (newToken) => {
  authEvents.dispatchEvent(
    new CustomEvent("tokenRefreshed", { detail: newToken }),
  );
};

export const emitSessionExpired = () => {
  authEvents.dispatchEvent(new CustomEvent("sessionExpired"));
};

// 🔹EventTarget: 이벤트를 등록하고 발생시키는 역할을 하는 기본 객체
// authEvents: 로그인/인증 관련 이벤트를 관리하는 객체가 생성됨 →
// "인증 상태 변화를 앱 전체에 알리는 이벤트 시스템"

// 🔹CustomEvent: 내가 직접 만든 이벤트, 데이터까지 전달 가능.
// 🔹dispatchEvent: 이벤트를 실제로 발생시킴

// emitTokenRefreshed: 토큰이 새로 발급됐을 때 호출하는 함수
// "tokenRefreshed"라는 이벤트 생성 & 이벤트에 새 토큰 같이 전달

// emitSessionExpired: 세션이 만료됐을 때 호출하는 함수
// "sessionExpired" 이벤트 발생, 데이터 없이 "세션 종료" 알림
