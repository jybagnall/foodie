import useGuestCartActions from "../../../hooks/useGuestCartActions";
import MenuItemView from "./MenuItemView";

export default function GuestMenuItem({ menuItem }) {
  const { addItemLocally } = useGuestCartActions();

  return <MenuItemView menuItem={menuItem} onAdd={addItemLocally} />;
}
