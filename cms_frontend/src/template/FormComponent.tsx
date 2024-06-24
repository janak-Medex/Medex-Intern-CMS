import React, { useState, FormEvent, useEffect, useCallback } from "react";
import {
  AiOutlineFileImage,
  AiOutlineClose,
  AiOutlineVideoCamera,
} from "react-icons/ai";
import axiosInstance from "../http/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ... (keep the DefaultImageSVG and interfaces)

const FormComponent: React.FC<FormComponentProps> = ({
  template_name,
  component_name,
  formData,
  setFormData,
}) => {
  const [selectedFilePreviews, setSelectedFilePreviews] = useState<{
    [key: string]: string[];
  }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const baseImageUrl = import.meta.env.VITE_APP_BASE_IMAGE_URL || "";

  const initializePreviews = useCallback(() => {
    const initialPreviews: { [key: string]: string[] } = {};
    Object.entries(formData || {}).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        if (typeof value[0] === "string") {
          initialPreviews[key] = value
            .map((item) => {
              if (item.startsWith("http")) return item;
              const splitUrl = item.split("uploads\\")?.[1];
              return splitUrl ? `${baseImageUrl}${splitUrl}` : "";
            })
            .filter(Boolean);
        } else if (value[0] instanceof File) {
          initialPreviews[key] = value.map((file) =>
            URL.createObjectURL(file as File)
          );
        }
      }
    });
    setSelectedFilePreviews(initialPreviews);
    console.log("Initial previews set:", initialPreviews);
  }, [formData, baseImageUrl]);

  useEffect(() => {
    initializePreviews();
  }, [initializePreviews]);

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value === "" ? null : value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [key]: "" }));
    console.log(`Field ${key} changed to:`, value);
  };

  const handleFileSelect = (key: string, files: FileList) => {
    const fileArray = Array.from(files);
    setFormData((prevData) => ({
      ...prevData,
      [key]: [...((prevData[key] as File[]) || []), ...fileArray],
    }));

    const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
    setSelectedFilePreviews((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...newPreviews],
    }));

    setErrors((prevErrors) => ({ ...prevErrors, [key]: "" }));
    console.log(`Files selected for ${key}:`, fileArray);
  };

  const handleClearFile = (key: string, index: number) => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      if (Array.isArray(newData[key])) {
        (newData[key] as (File | string)[]).splice(index, 1);
      }
      return newData;
    });

    setSelectedFilePreviews((prev) => {
      const newPreviews = { ...prev };
      if (Array.isArray(newPreviews[key])) {
        newPreviews[key].splice(index, 1);
      }
      return newPreviews;
    });
    console.log(`File cleared for ${key} at index ${index}`);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    Object.entries(formData || {}).forEach(([key, value]) => {
      if (
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "string" && value.trim() === "")
      ) {
        newErrors[key] = `${key} is required`;
      }
    });
    setErrors(newErrors);
    console.log("Form validation errors:", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      console.log("Form submission failed due to validation errors");
      return;
    }

    const formPayload = new FormData();

    formPayload.append("template_name", template_name);
    formPayload.append("component_name", component_name);

    Object.entries(formData || {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item instanceof File) {
            formPayload.append(`${key}`, item);
          } else if (typeof item === "string") {
            formPayload.append(`${key}`, item);
          }
        });
      } else if (value !== null) {
        formPayload.append(key, String(value));
      }
    });

    try {
      console.log("Submitting form data:", Object.fromEntries(formPayload));
      const response = await axiosInstance.post("/components", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        toast.success("Form submitted successfully");
        console.log("Form submitted successfully:", response.data);
        initializePreviews(); // Refresh previews after successful submission
      } else {
        toast.error("Form submission failed");
        console.error("Form submission failed:", response);
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      if (error.response && error.response.data) {
        const { message, errors } = error.response.data;
        toast.error(message || "An error occurred");
        if (errors && Array.isArray(errors)) {
          errors.forEach((err: string) => toast.error(err));
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const getFieldComponent = (
    key: string,
    value: string | null | File[] | string[]
  ) => {
    if (
      key.includes("image") ||
      key.includes("file") ||
      key.includes("video")
    ) {
      const isVideo = key.includes("video");
      const Icon = isVideo ? AiOutlineVideoCamera : AiOutlineFileImage;
      const previews = selectedFilePreviews[key] || [];

      return (
        <div key={key} className="mb-8">
          <label className="block text-gray-800 font-semibold mb-2">
            {key}
          </label>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {previews.length > 0 ? (
              previews.map((preview, index) => (
                <div key={index} className="relative">
                  {isVideo ? (
                    <video
                      src={preview}
                      className="w-full h-32 object-cover rounded-lg"
                      controls
                    />
                  ) : (
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleClearFile(key, index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <AiOutlineClose />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-3">
                <DefaultImageSVG />
              </div>
            )}
          </div>
          <div className="flex-1">
            <label
              className="flex items-center justify-center px-4 py-2 bg-[#39AF9F] text-white rounded-lg cursor-pointer hover:bg-green-500"
              htmlFor={`${key}-file-input`}
            >
              <Icon className="mr-2" />
              <span>Add {isVideo ? "Video" : "Image"}(s)</span>
            </label>
            <input
              type="file"
              id={`${key}-file-input`}
              className="hidden"
              multiple
              accept={isVideo ? "video/*" : "image/*"}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(key, e.target.files);
                }
              }}
            />
          </div>
          {errors[key] && (
            <p className="text-red-500 text-sm mt-1">{errors[key]}</p>
          )}
        </div>
      );
    } else {
      return (
        <div key={key} className="mb-4">
          <label className="block text-gray-800 font-semibold mb-2">
            {key}
          </label>
          <input
            type="text"
            value={
              typeof value === "string"
                ? value
                : Array.isArray(value)
                ? value[0] || ""
                : ""
            }
            onChange={(e) => handleFieldChange(key, e.target.value)}
            className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500 ${
              errors[key] ? "border-red-500" : ""
            }`}
          />
          {errors[key] && (
            <p className="text-red-500 text-sm mt-1">{errors[key]}</p>
          )}
        </div>
      );
    }
  };

  if (!formData || Object.keys(formData).length === 0) {
    return <div>No form data available</div>;
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto font-sans">
        <div className="mb-8">
          {Object.entries(formData).map(([key, value]) =>
            getFieldComponent(key, value)
          )}
        </div>
        <div className="flex justify-center mb-8">
          <button
            type="submit"
            className="px-6 py-3 w-full text-white bg-[#39AF9F] rounded-lg hover:bg-teal-700 focus:outline-none transition-colors duration-300"
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default FormComponent;
