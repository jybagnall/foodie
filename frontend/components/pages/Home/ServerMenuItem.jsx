import useServerCartActions from "../../../hooks/useServerCartActions";
import MenuItemView from "./MenuItemView";

export default function ServerMenuItem({ menuItem }) {
  const { addItem } = useServerCartActions();

  return <MenuItemView menuItem={menuItem} onAdd={addItem} />;
}
