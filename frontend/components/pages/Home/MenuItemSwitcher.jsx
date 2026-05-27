import { useContext } from "react";
import CartContext from "../../../contexts/CartContext";
import ServerMenuItem from "./ServerMenuItem";
import GuestMenuItem from "./GuestMenuItem";

export default function MenuItemSwitcher({ menuItem }) {
  const { mode } = useContext(CartContext);

  return mode === "server" ? (
    <ServerMenuItem menuItem={menuItem} />
  ) : (
    <GuestMenuItem menuItem={menuItem} />
  );
}
