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
import { Image } from "antd";

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
    [key: string]: any[][];
  }>({});
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const baseImageUrl = import.meta.env.VITE_APP_BASE_IMAGE_URL || "";

  useEffect(() => {
    console.log("FormComponent rendered with formData:", formData);
  }, [formData]);

  useEffect(() => {
    if (!Array.isArray(formData) || formData.length === 0) {
      setSelectedFilePreviews({});
      return;
    }

    const initialPreviews: { [key: string]: any[][] } = {};

    formData.forEach((item, index) => {
      Object.entries(item).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          if (!initialPreviews[key]) {
            initialPreviews[key] = [];
          }
          initialPreviews[key][index] = value
            .map((item) => {
              if (item === null) {
                return null;
              }
              if (typeof item === "string") {
                const src = item.startsWith("http")
                  ? item
                  : `${baseImageUrl}${item.split("uploads\\")[1]}`;
                const type = src.match(/\.(mp4|webm|ogg)$/i)
                  ? "video"
                  : src.match(/\.(jpg|jpeg|png|gif)$/i)
                  ? "image"
                  : src.match(/\.svg$/i)
                  ? "svg"
                  : "file";
                return { src, type, name: item.split("\\").pop() || "" };
              } else if (item instanceof File) {
                return {
                  src: URL.createObjectURL(item),
                  type: item.type.startsWith("video/")
                    ? "video"
                    : item.type.startsWith("image/")
                    ? "image"
                    : item.type === "image/svg+xml"
                    ? "svg"
                    : "file",
                  name: item.name,
                };
              }
              return null;
            })
            .filter(Boolean);
        }
      });
    });

    setSelectedFilePreviews(initialPreviews);
  }, [formData, baseImageUrl]);

  const handleFieldChange = (index: number, key: string, value: any) => {
    console.log(`Updating field: index=${index}, key=${key}, value=`, value);
    const newData = [...formData];
    newData[index] = { ...newData[index], [key]: value === "" ? null : value };
    console.log("Updated formData:", newData);
    setFormData(newData);
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (!newErrors[key]) {
        newErrors[key] = [];
      }
      newErrors[key][index] = "";
      return newErrors;
    });
  };

  const handleFileSelect = (index: number, key: string, files: FileList) => {
    const fileArray = Array.from(files);
    const newData = [...formData];
    newData[index] = {
      ...newData[index],
      [key]: [
        ...((newData[index][key] as (File | string)[]) || []),
        ...fileArray,
      ],
    };
    setFormData(newData);

    const newPreviews = fileArray.map((file) => ({
      src: URL.createObjectURL(file),
      type: file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("image/")
        ? file.type === "image/svg+xml"
          ? "svg"
          : "image"
        : "file",
      name: file.name,
    }));

    setSelectedFilePreviews((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [index]: [...(prev[key]?.[index] || []), ...newPreviews],
      },
    }));
  };

  const handleClearFile = (index: number, key: string, fileIndex: number) => {
    console.log(
      `Clearing file: index=${index}, key=${key}, fileIndex=${fileIndex}`
    );
    const newData = [...formData];
    const updatedFiles = (newData[index][key] as (File | string)[]).filter(
      (_, i) => i !== fileIndex
    );
    newData[index] = {
      ...newData[index],
      [key]: updatedFiles.length > 0 ? updatedFiles : null,
    };
    console.log("Updated formData after clearing file:", newData);
    setFormData(newData);

    setSelectedFilePreviews((prev) => {
      const newState = { ...prev };
      newState[key][index] = newState[key][index].filter(
        (_, i) => i !== fileIndex
      );
      return newState;
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string[] } = {};
    formData.forEach((item, index) => {
      Object.entries(item).forEach(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0)
        ) {
          if (!newErrors[key]) {
            newErrors[key] = [];
          }
          newErrors[key][index] = `${key} is required`;
        }
      });
    });
    setErrors(newErrors);
    return Object.values(newErrors).every((arr) => arr.every((err) => !err));
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

    // Handle file uploads and create data array
    const dataArray = formData.map((item, index) => {
      const dataItem: { [key: string]: any } = {};
      Object.entries(item).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          dataItem[key] = value.map((fileItem, fileIndex) => {
            if (fileItem instanceof File) {
              formPayload.append(`files`, fileItem);
              return { name: fileItem.name, originalName: fileItem.name };
            }
            return fileItem; // For existing files, keep the string path
          });
        } else {
          dataItem[key] = value;
        }
      });
      return dataItem;
    });

    // Append the stringified data array to the FormData
    formPayload.append("data", JSON.stringify(dataArray));

    // Append other necessary fields
    formPayload.append("isActive", "true");
    formPayload.append("inner_component", "1");

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

  const getFieldComponent = (index: number, key: string, value: any) => {
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

      const previews = selectedFilePreviews[key]?.[index] || [];
      const acceptType = key.includes("video")
        ? "video/*"
        : key.includes("image")
        ? "image/*"
        : "*/*";

      return (
        <div key={`${index}-${key}`} className="mb-8">
          <label className="block text-gray-800 font-semibold mb-2">
            {key}
          </label>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {previews.map((preview, fileIndex) => (
              <div
                key={fileIndex}
                className="relative bg-gray-100 p-2 rounded-lg h-32 flex items-center justify-center"
              >
                <div className="w-full h-full flex items-center justify-center">
                  {preview.type === "video" && (
                    <video
                      src={preview.src}
                      className="max-w-full max-h-full object-contain rounded"
                      controls
                    />
                  )}
                  {(preview.type === "image" || preview.type === "svg") && (
                    <Image
                      src={preview.src}
                      alt={`Preview ${fileIndex}`}
                      preview={{
                        mask: (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                            Preview
                          </div>
                        ),
                      }}
                      className="max-w-full max-h-full object-contain"
                      style={{ minHeight: "32px", maxHeight: "112px" }} // Adjust these values as needed
                    />
                  )}
                  {preview.type === "file" && (
                    <div className="flex flex-col items-center justify-center">
                      <AiOutlineFile size={32} />
                      <span className="mt-2 text-sm text-center break-words max-w-full">
                        {preview.name}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile(index, key, fileIndex);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 z-10"
                >
                  <AiOutlineClose />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center">
            <label
              className="flex items-center justify-center px-4 py-2 bg-[#39AF9F] text-white rounded-lg cursor-pointer hover:bg-green-500 transition-colors duration-300"
              htmlFor={`${index}-${key}-file-input`}
            >
              <Icon className="mr-2" />
              <span>Select {key}</span>
            </label>
            <input
              type="file"
              id={`${index}-${key}-file-input`}
              className="hidden"
              multiple
              accept={acceptType}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0)
                  handleFileSelect(index, key, e.target.files);
              }}
            />
          </div>
          {errors[key]?.[index] && (
            <p className="text-red-500 text-sm mt-1">{errors[key][index]}</p>
          )}
        </div>
      );
    } else {
      return (
        <div key={`${index}-${key}`} className="mb-4">
          <label className="block text-gray-800 font-semibold mb-2">
            {key}
          </label>
          <input
            type="text"
            value={value || ""}
            onChange={(e) => handleFieldChange(index, key, e.target.value)}
            className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500 ${
              errors[key]?.[index] ? "border-red-500" : ""
            }`}
          />
          {errors[key]?.[index] && (
            <p className="text-red-500 text-sm mt-1">{errors[key][index]}</p>
          )}
        </div>
      );
    }
  };

  console.log("Rendering FormComponent with formData:", formData);

  if (!Array.isArray(formData) || formData.length === 0) {
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
        {formData.map((item, index) => (
          <div key={index} className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Item {index + 1}</h3>
            {Object.entries(item).map(([key, value]) =>
              getFieldComponent(index, key, value)
            )}
          </div>
        ))}
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
