import useAccessToken from "../../hooks/useAccessToken";
import CartMergeEffect from "./CartMergeEffect";

export default function CartMergeHandler() {
  const accessToken = useAccessToken();

  if (!accessToken) return null;

  return <CartMergeEffect accessToken={accessToken} />;
}
// 로그인 상태가 아니라면 카트를 병합하는 로직 자체가 실행되지 않음.
