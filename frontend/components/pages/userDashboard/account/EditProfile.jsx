import { useParams } from "react-router-dom";

export default function EditProfile() {
  const { field } = useParams(); // "name" | "password"

  return <div></div>;
}
