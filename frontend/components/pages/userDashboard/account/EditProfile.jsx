import { Navigate, useParams } from "react-router-dom";
import EditNameForm from "./EditNameForm";
import EditPasswordForm from "./EditPasswordForm";

export default function EditProfile() {
  const { field } = useParams(); // "name" | "password"
  const forms = {
    name: <EditNameForm />,
    password: <EditPasswordForm />,
  };

  if (!forms[field]) return <Navigate to="/my-account" />;

  return <div>{forms[field]}</div>;
}
