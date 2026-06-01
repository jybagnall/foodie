import useServerCartActions from "../../../hooks/useServerCartActions";
import MenuItemView from "./MenuItemView";

export default function ServerMenuItem({ menuItem }) {
  const { addItemAndSync } = useServerCartActions();

  return <MenuItemView menuItem={menuItem} onAdd={addItemAndSync} />;
}
