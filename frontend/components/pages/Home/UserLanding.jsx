import { useEffect } from "react";
import Spinner from "../../user_feedback/Spinner";
import MenuItem from "../Home/MenuItem";
import PageError from "../../user_feedback/PageError";
import useMenu from "../../../hooks/useMenu";

// 에러 메시지 렌더링을 넣어야 함
export default function UserLanding() {
  const { menu, fetchingError, isFetchingMenu } = useMenu();

  useEffect(() => {
    document.title = "Menu | Foodie";
  }, []);

  if (isFetchingMenu) {
    return <Spinner />;
  }

  if (fetchingError) {
    return <PageError title="We couldn’t load the menu" />;
  } // 스타일을 바꿔야함

  return (
    <ul className="w-[80%] max-w-[1200px] list-none my-8 mx-auto p-4 grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {menu.map((m) => (
        <MenuItem key={m.id} meal={m} />
      ))}
    </ul>
  );
}
