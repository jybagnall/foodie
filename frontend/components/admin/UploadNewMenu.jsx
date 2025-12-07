import { useForm } from "react-hook-form";
import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { createMenu } from "../../services/menu.service";
import Spinner from "../UI/Spinner";

export default function UploadNewMenu() {
  const [isUploadProcessing, setIsUploadProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.title = "Upload new menu | Foodie";
  }, []);

  if (isSignupProcessing) {
    return <Spinner />;
  }

  return <div></div>;
}
