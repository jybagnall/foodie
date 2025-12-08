import { useForm } from "react-hook-form";
import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MenuService from "../../services/menu.service";
import Spinner from "../UI/Spinner";
import AuthContext from "../../contexts/AuthContext";
import Input from "../UI/Input";
import Button from "../UI/Button";

export default function UploadNewMenu() {
  const [isUploadProcessing, setIsUploadProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  const watchFile = watch("image");

  // 🤔🤔
  useEffect(() => {
    if (watchFile && watchFile[0]) {
      const file = watchFile[0];
      const imageURL = URL.createObjectURL(file);
      setPreviewUrl(imageURL);

      return () => URL.revokeObjectURL(imageURL);
    }
  }, [watchFile]);

  const onUploadSubmit = async ({ name, price, description }) => {
    const menuService = new MenuService(new AbortController(), authContext);

    const formData = new FormData();

    if (watchFile && watchFile[0]) {
      formData.append("image", watchFile[0]);
    } // ?
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);

    setIsUploadProcessing(true);
    try {
      await menuService.createMenu(formData);
      navigate("/admin/admin-dashboard", { replace: true }); // ?
    } catch (err) {
      console.error(err);
      const returnedErrorMsg =
        err.response?.data?.error || "Unexpected upload error";
      setErrorMsg(returnedErrorMsg);
    } finally {
      setIsUploadProcessing(false);
      reset(); // 🤔
      setPreviewUrl(null);
    }
  };

  useEffect(() => {
    document.title = "Upload new menu | Foodie";
  }, []);

  if (isUploadProcessing) {
    return <Spinner />;
  }

  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-50 py-20 px-4">
      <div className="w-full max-w-lg">
        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert
              title="There was a problem with your request"
              message={errorMsg}
            />
          </div>
        )}

        <section className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
            Create account
          </h2>

          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit(onUploadSubmit)}
          >
            <Input
              label="Menu Name"
              type="text"
              id="name"
              register={register("name", {
                required: true,
              })}
              error={errors.name}
            />
            <Input
              label="Price"
              type="number"
              id="price"
              register={register("price", {
                required: true,
                min: 0,
              })}
              error={errors.price}
            />
            <Input
              label="Description"
              type="text"
              id="description"
              register={register("description", {
                required: "Please enter description.",
              })}
              error={errors.description}
            />

            <Input
              label="Image"
              type="file"
              id="image"
              accept="image/*"
              register={register("image", {
                validate: {
                  fileType: (value) => {
                    if (!value[0]) return "Please select a file.";

                    const type = value[0].type;
                    if (
                      ["image/jpeg", "image/jpg", "image/png"].includes(type)
                    ) {
                      return "Only JPG, JPEG and PNG files are allowed.";
                    }
                    return true;
                  },
                },
              })}
              error={errors.image}
            />

            {previewUrl && (
              <div className="mt-8 flex justify-center">
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-48 h-48 object-cover rounded-lg shadow-md border border-gray-300"
                />
              </div>
            )}
            <div className="mt-8">
              <Button
                type="submit"
                propStyle="py-1 px-3 bg-yellow-300 text-gray-800 border-yellow-300 hover:bg-yellow-400"
              >
                Create new Menu
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
