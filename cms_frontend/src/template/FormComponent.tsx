import React, { useState, useEffect, FormEvent } from "react";
import {
  AiOutlineFileImage,
  AiOutlineClose,
  AiOutlineVideoCamera,
  AiOutlineFile,
} from "react-icons/ai";
import axiosInstance from "../http/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FormComponentProps {
  template_name: string;
  component_name: string;
  formData: { [key: string]: any }[];
  setFormData: (data: { [key: string]: any }[]) => void;
}

const FormComponent: React.FC<FormComponentProps> = ({
  template_name,
  component_name,
  formData,
  setFormData,
}) => {
  const [selectedFilePreviews, setSelectedFilePreviews] = useState<{
    [key: string]: any[];
  }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const baseImageUrl = import.meta.env.VITE_APP_BASE_IMAGE_URL || "";

  useEffect(() => {
    console.log("FormComponent rendered with formData:", formData);
  }, [formData]);

  useEffect(() => {
    if (!Array.isArray(formData) || formData.length === 0) {
      setSelectedFilePreviews({});
      return;
    }

    const initialPreviews: { [key: string]: any[] } = {};

    Object.entries(formData[0]).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        initialPreviews[key] = value.map((item) => {
          if (typeof item === "string") {
            const src = item.startsWith("http")
              ? item
              : `${baseImageUrl}${item.split("uploads\\")[1]}`;
            const type = src.match(/\.(mp4|webm|ogg)$/i)
              ? "video"
              : src.match(/\.(jpg|jpeg|png|gif)$/i)
              ? "image"
              : "file";
            return { src, type, name: item.split("\\").pop() || "" };
          } else {
            return {
              src: URL.createObjectURL(item as File),
              type: (item as File).type.startsWith("video/")
                ? "video"
                : (item as File).type.startsWith("image/")
                ? "image"
                : "file",
              name: (item as File).name,
            };
          }
        });
      }
    });

    setSelectedFilePreviews(initialPreviews);
  }, [formData, baseImageUrl]);

  const handleFieldChange = (key: string, value: any) => {
    console.log(`Updating field: key=${key}, value=`, value);
    const newData = [...formData];
    newData[0] = { ...newData[0], [key]: value === "" ? null : value };
    console.log("Updated formData:", newData);
    setFormData(newData);
    setErrors((prevErrors) => ({ ...prevErrors, [key]: "" }));
  };

  // In FormComponent.tsx

  const handleFileSelect = (key: string, files: FileList) => {
    console.log(`Selecting files: key=${key}, files=`, files);
    const fileArray = Array.from(files);
    const newData = [...formData];
    newData[0] = {
      ...newData[0],
      [key]: [...((newData[0][key] as (File | string)[]) || []), ...fileArray],
    };
    console.log("Updated formData after file selection:", newData);
    setFormData(newData);

    const newPreviews = fileArray.map((file) => ({
      src: URL.createObjectURL(file),
      type: file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("image/")
        ? "image"
        : "file",
      name: file.name,
    }));
    setSelectedFilePreviews((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...newPreviews],
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [key]: "" }));
  };

  const handleClearFile = (key: string, fileIndex: number) => {
    console.log(`Clearing file: key=${key}, fileIndex=${fileIndex}`);
    const newData = [...formData];
    const updatedFiles = (newData[0][key] as (File | string)[]).filter(
      (_, i) => i !== fileIndex
    );
    newData[0] = {
      ...newData[0],
      [key]: updatedFiles.length > 0 ? updatedFiles : null,
    };
    console.log("Updated formData after clearing file:", newData);
    setFormData(newData);

    setSelectedFilePreviews((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== fileIndex),
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    Object.entries(formData[0]).forEach(([key, value]) => {
      if (
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0)
      ) {
        newErrors[key] = `${key} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const formPayload = new FormData();
    formPayload.append("template_name", template_name);
    formPayload.append("component_name", component_name);

    Object.entries(formData[0]).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
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
      const response = await axiosInstance.post("/components", formPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 201) {
        toast.success("Form submitted successfully");
      } else {
        toast.error("Form submission failed");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(
        error.response?.data?.message || "An unexpected error occurred"
      );
    }
  };

  const getFieldComponent = (key: string, value: any) => {
    if (
      key.includes("image") ||
      key.includes("video") ||
      key.includes("file")
    ) {
      const Icon = key.includes("video")
        ? AiOutlineVideoCamera
        : key.includes("image")
        ? AiOutlineFileImage
        : AiOutlineFile;
      const previews = selectedFilePreviews[key] || [];
      const acceptType = key.includes("video")
        ? "video/*"
        : key.includes("image")
        ? "image/*"
        : "*/*";

      return (
        <div key={key} className="mb-8">
          <label className="block text-gray-800 font-semibold mb-2">
            {key}
          </label>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {previews.map((preview, fileIndex) => (
              <div
                key={fileIndex}
                className="relative bg-gray-100 p-2 rounded-lg"
              >
                {preview.type === "video" && (
                  <video
                    src={preview.src}
                    className="w-full h-32 object-cover rounded"
                    controls
                  />
                )}
                {preview.type === "image" && (
                  <img
                    src={preview.src}
                    alt={`Preview ${fileIndex}`}
                    className="w-full h-32 object-cover rounded"
                  />
                )}
                {preview.type === "file" && (
                  <div className="w-full h-32 flex items-center justify-center bg-gray-200 rounded">
                    <AiOutlineFile size={32} />
                    <span className="ml-2 text-sm">{preview.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile(key, fileIndex);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <AiOutlineClose />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center">
            <label
              className="flex items-center justify-center px-4 py-2 bg-[#39AF9F] text-white rounded-lg cursor-pointer hover:bg-green-500 transition-colors duration-300"
              htmlFor={`${key}-file-input`}
            >
              <Icon className="mr-2" />
              <span>Select {key}</span>
            </label>
            <input
              type="file"
              id={`${key}-file-input`}
              className="hidden"
              multiple
              accept={acceptType}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0)
                  handleFileSelect(key, e.target.files);
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
            value={value || ""}
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

  console.log("Rendering FormComponent with formData:", formData);

  if (
    !Array.isArray(formData) ||
    formData.length === 0 ||
    typeof formData[0] !== "object"
  ) {
    console.error("Invalid formData:", formData);
    return <div>No valid form data available</div>;
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <form
        onSubmit={handleFormSubmit}
        className="max-w-2xl mx-auto font-sans bg-white p-6 rounded-lg shadow-md"
      >
        <div className="mb-8">
          {Object.entries(formData[0]).map(([key, value]) =>
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
