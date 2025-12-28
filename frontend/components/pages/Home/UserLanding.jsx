import { useState, useEffect, useContext } from "react";
import Spinner from "../../user_feedback/Spinner";
import MenuItem from "../Home/MenuItem";
import MenuService from "../../../services/menu.service";
import AuthContext from "../../../contexts/AuthContext";
import MenuLoadError from "../../user_feedback/MenuLoadError";

// 에러 메시지 렌더링을 넣어야 함
// 빈 배열이면 로고가 떠야 하는데?
export default function UserLanding() {
  const authContext = useContext(AuthContext);

  const [menu, setMenu] = useState([]);
  const [isFetchProcessing, setIsFetchProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    document.title = "Menu | Foodie";

    const abortController = new AbortController();
    const menuService = new MenuService(abortController, authContext);

    const fetchMenu = async () => {
      try {
        setIsFetchProcessing(true);
        const data = await menuService.getMenu();
        setMenu(data);
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error(err);
          const returnedErrorMsg = err?.response?.data?.error || err.message;
          setErrorMsg(returnedErrorMsg);
        }
      } finally {
        setIsFetchProcessing(false);
      }
    };

    fetchMenu();

    return () => {
      abortController.abort();
    };
  }, []);

  if (isFetchProcessing) {
    return <Spinner />;
  }

  if (errorMsg) {
    return <MenuLoadError errorMsg={errorMsg} />;
  } // 스타일을 바꿔야함

  return (
    <ul className="w-[80%] max-w-[1200px] list-none my-8 mx-auto p-4 grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.isArray(menu) && menu.length > 0 ? (
        menu.map((m) => <MenuItem key={m.id} meal={m} />)
      ) : (
        <MenuLoadError errorMsg={errorMsg} />
      )}
    </ul>
  );
}
