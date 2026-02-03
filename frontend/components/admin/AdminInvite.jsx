import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import ErrorAlert from "../user_feedback/ErrorAlert";
import Input from "../UI/Input";
import Button from "../UI/Button";
import AuthContext from "../../contexts/AuthContext";
import AdminService from "../../services/admin.service";
import Spinner from "../user_feedback/Spinner";
import AdminFeedback from "./AdminFeedback";
import BackToAdminDash from "../UI/BackToAdminDash";

export default function AdminInvite() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.title = "Invite a new admin | Foodie";
  }, []);

  const authContext = useContext(AuthContext);
  const [isInviteProcessing, setIsInviteProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState("");

  const handleInvitation = async (email) => {
    setIsInviteProcessing(true);

    const adminService = new AdminService(
      new AbortController(),
      () => accessToken,
    );

    try {
      const res = await adminService.inviteNewAdmin(email);
      setInviteSuccessMsg(res?.message);
    } catch (err) {
      const returnedErrorMsg = err?.response?.data?.error || err.message;
      setErrorMsg(returnedErrorMsg);
    } finally {
      setIsInviteProcessing(false);
    }
  };

  const onInvitation = ({ email }) => {
    handleInvitation(email);
  };

  if (isInviteProcessing) {
    return <Spinner />;
  }

  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-50 py-20 px-4">
      <div className="w-full max-w-lg">
        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert title="There was a problem" message={errorMsg} />
          </div>
        )}

        {inviteSuccessMsg && (
          <div className="mb-4">
            <AdminFeedback msg={inviteSuccessMsg} />
          </div>
        )}

        <section className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
          <div className="flex flex p-3 -ml-4">
            <div className="mb-4">
              <BackToAdminDash title="Send invite" />
            </div>
          </div>

          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit(onInvitation)}
          >
            <Input
              label="New admin's email address"
              type="email"
              id="email"
              register={register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Please enter a valid email address.",
                },
              })}
              error={errors.email}
            />

            <div className="mt-4">
              <Button
                type="submit"
                propStyle="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Send invite
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
