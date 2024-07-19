import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import {
  AiOutlineFileImage,
  AiOutlineClose,
  AiOutlineVideoCamera,
  AiOutlineFile,
  AiOutlineEdit,
} from "react-icons/ai";
import { Image, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import { submitFormData } from "../api/form.api";
import { IoBagCheckOutline } from "react-icons/io5";

interface FormComponentProps {
  template_name: any;
  component_name: string;
  formData: { [key: string]: any }[];
  setFormData: (data: { [key: string]: any }[]) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  refetchData: () => Promise<void>;
}

const FormComponent: React.FC<FormComponentProps> = ({
  template_name,
  component_name,
  formData,
  setFormData,
  refetchData,
}) => {
  const [selectedFilePreviews, setSelectedFilePreviews] = useState<{
    [key: string]: any[][];
  }>({});
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [editingTags, setEditingTags] = useState<{
    [key: string]: string | null;
  }>({});
  const baseImageUrl = import.meta.env.VITE_APP_BASE_IMAGE_URL || "";

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
    const newData = [...formData];
    newData[index] = { ...newData[index], [key]: value === "" ? null : value };
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
    const newData = [...formData];
    const updatedFiles = (newData[index][key] as (File | string)[]).filter(
      (_, i) => i !== fileIndex
    );
    newData[index] = {
      ...newData[index],
      [key]: updatedFiles.length > 0 ? updatedFiles : null,
    };
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
          value === "" ||
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
      message.error("Please fill in all required fields");
      return;
    }

    const formPayload = new FormData();

    formPayload.append("template_name", template_name);
    formPayload.append("component_name", component_name);

    const dataArray = formData.map((item) => {
      const dataItem: { [key: string]: any } = {};
      Object.entries(item).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          dataItem[key] = value.map((fileItem) => {
            if (fileItem instanceof File) {
              formPayload.append(`files`, fileItem);
              return { name: fileItem.name, originalName: fileItem.name };
            }
            return fileItem;
          });
        } else {
          dataItem[key] = value;
        }
      });
      return dataItem;
    });

    formPayload.append("data", JSON.stringify(dataArray));
    formPayload.append("is_active", "true");
    formPayload.append("inner_component", "1");

    try {
      const response = await submitFormData(formPayload);
      if (response.status === 201) {
        setFormData([]);
        setSelectedFilePreviews({});
        setErrors({});
        await refetchData();
        Cookies.get("access_token");
        message.success("Form submitted successfully");
      } else {
        message.error("Form submission failed");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      message.error(
        error.response?.data?.message || "An unexpected error occurred"
      );
    }
  };

  const handleInputChange = (
    index: number,
    key: string,
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInputValues((prev) => ({
      ...prev,
      [`${index}-${key}`]: e.target.value,
    }));
  };

  const handleInputConfirm = (
    e:
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    key: string
  ) => {
    e.preventDefault();
    const inputKey = `${index}-${key}`;
    const inputValue = inputValues[inputKey];
    if (inputValue && !formData[index][key].includes(inputValue.trim())) {
      const newData = [...formData];
      newData[index] = {
        ...newData[index],
        [key]: [...(newData[index][key] || []), inputValue.trim()],
      };
      setFormData(newData);
    }
    setInputValues((prev) => ({ ...prev, [inputKey]: "" }));
    setEditingTags((prev) => ({ ...prev, [inputKey]: null }));
  };
  const handleInputBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    key: string
  ) => {
    handleInputConfirm(e, index, key);
  };

  const handleTagClose = (
    e: React.MouseEvent,
    index: number,
    key: string,
    removedTag: string
  ) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event propagation

    const inputKey = `${index}-${key}`;
    if (removedTag === editingTags[inputKey]) {
      setEditingTags((prev) => ({ ...prev, [inputKey]: null }));
    }
    const newData = [...formData];
    newData[index] = {
      ...newData[index],
      [key]: newData[index][key].filter((tag: string) => tag !== removedTag),
    };
    setFormData(newData);
  };

  const handleEditTags = (
    e: React.MouseEvent,
    index: number,
    key: string,
    tagToEdit: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const inputKey = `${index}-${key}`;

    // Check if this specific tag is already being edited
    if (editingTags[inputKey] === tagToEdit) {
      // If it is, close the edit mode and add the tag back to the list
      setEditingTags((prev) => ({ ...prev, [inputKey]: null }));
      setInputValues((prev) => ({ ...prev, [inputKey]: "" }));
      const newData = [...formData];
      newData[index] = {
        ...newData[index],
        [key]: [...newData[index][key], tagToEdit],
      };
      setFormData(newData);
    } else if (Object.values(editingTags).every((tag) => tag === null)) {
      // If no tag is being edited, start editing this one
      setInputValues((prev) => ({ ...prev, [inputKey]: tagToEdit }));
      setEditingTags((prev) => ({ ...prev, [inputKey]: tagToEdit }));
      const newData = [...formData];
      newData[index] = {
        ...newData[index],
        [key]: newData[index][key].filter((tag: string) => tag !== tagToEdit),
      };
      setFormData(newData);
    } else {
      // If another tag is being edited, show a warning
      message.warning(
        "Please complete editing the current tag before editing another."
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
                      style={{ minHeight: "32px", maxHeight: "112px" }}
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
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 z-10 hover:bg-red-600 transition-colors duration-200"
                >
                  <AiOutlineClose />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center">
            <label
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-500 transition-colors duration-300"
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
    } else if (key.toLowerCase().includes("_list") || /\blist\b/i.test(key)) {
      const inputKey = `${index}-${key}`;
      return (
        <div className="mb-8 ">
          <label className="block text-gray-800 font-semibold mb-2">
            {key}
          </label>
          <div className="flex flex-col mb-4 ">
            <textarea
              value={inputValues[inputKey] || ""}
              onChange={(e) => handleInputChange(index, key, e)}
              onBlur={(e) => handleInputBlur(e, index, key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleInputConfirm(e, index, key);
                }
              }}
              placeholder="Type content and press enter to add (Shift+Enter for new line)"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500 mb-2 resize-y"
              rows={3}
            />
            <button
              type="button"
              onClick={(e) => handleInputConfirm(e as any, index, key)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors duration-300 self-end"
            >
              Add
            </button>
          </div>
          <div className="min-h-[100px] max-h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50 custom-scrollbar ">
            {value && Array.isArray(value) && value.length > 0 ? (
              value.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`relative bg-white p-3 rounded mb-2 pr-16 shadow-sm ${
                    editingTags[`${index}-${key}`] === item
                      ? "border-2 border-blue-500"
                      : ""
                  }`}
                >
                  <p className="whitespace-pre-wrap">{item}</p>
                  <div className="absolute top-1 right-1 flex">
                    {editingTags[`${index}-${key}`] === item ? (
                      <button
                        onClick={(e) => handleEditTags(e, index, key, item)}
                        className="text-green-500 hover:text-green-700 mr-2"
                        title="Complete Editing"
                      >
                        <IoBagCheckOutline />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleEditTags(e, index, key, item)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        title="Edit Tag"
                      >
                        <AiOutlineEdit />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleTagClose(e, index, key, item)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove Tag"
                    >
                      <CloseOutlined />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No items added yet
              </div>
            )}
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

  if (!Array.isArray(formData) || formData.length === 0) {
    console.error("Invalid formData:", formData);
    return <div>No valid form data available</div>;
  }

  return (
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
          className="px-6 py-3 w-full text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none transition-colors duration-300"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default FormComponent;
