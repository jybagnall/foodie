// Intl.NumberFormat이라는 내장 클래스를 이용해서
// “숫자를 통화 형식으로 바꿔주는 객체”를 만드는 것.
// 따라서 이 객체가 가지고 있는 메서드 .format()을 써서 실제 변환을 수행함

export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
