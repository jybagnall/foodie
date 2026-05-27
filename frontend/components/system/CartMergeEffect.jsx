import { useCartMergeOnLogin } from "../../hooks/useCartMergeOnLogin";

export default function CartMergeEffect({ accessToken }) {
  useCartMergeOnLogin(accessToken);

  return null;
}
// 아무 UI도 렌더링하지 않고 hook 실행만 한다
