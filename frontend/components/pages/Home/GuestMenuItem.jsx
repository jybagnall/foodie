import useGuestCartActions from "../../../hooks/useGuestCartActions";
import MenuItemView from "./MenuItemView";

export default function GuestMenuItem({ menuItem }) {
  const { addItem } = useGuestCartActions();

  return <MenuItemView menuItem={menuItem} onAdd={addItem} />;
}
