import React, { useState, ChangeEvent, FormEvent } from "react";
import { AiOutlineFileImage } from "react-icons/ai";
import axiosInstance from "../http/axiosInstance";

interface FormData {
  [key: string]: string | null | File;
}

interface FormComponentProps {
  template_name: string;
  component_name: string;
  formData: {
    [key: string]: string | null | File;
  };
  setFormData: (data: { [key: string]: string | null | File }) => void;
}

const FormComponent: React.FC<FormComponentProps> = ({
  template_name,
  component_name,
  formData,
  setFormData,
}) => {
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(
    null
  );
  const baseImageUrl = import.meta.env.VITE_APP_BASE_IMAGE_URL || "";

  const handleFieldChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      [key]: value === "" ? null : value,
    });
  };

  const handleFileSelect = (key: string, file: File) => {
    setFormData({
      ...formData,
      [key]: file,
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFileName(file.name);
      setSelectedFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formPayload = new FormData();

    formPayload.append("template_name", template_name);
    formPayload.append("component_name", component_name);

    for (const key in formData) {
      const value = formData[key];
      if (value instanceof File) {
        formPayload.append(key, value);
      } else if (value !== null) {
        formPayload.append(key, value);
      }
    }

    try {
      const response = await axiosInstance.post("/components", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);

      if (response.status === 201) {
        console.log("Form submitted successfully:", response.data);
      } else {
        console.error("Form submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const getFieldComponent = (key: string, value: string | null | File) => {
    if (
      key.includes("image") ||
      key.includes("file") ||
      key.includes("video")
    ) {
      return (
        <div key={key} className="mb-8 flex items-center">
          <div className="mr-4">
            <label className="block text-gray-800 font-semibold mb-2">
              {key}
            </label>
            {value && typeof value === "string" ? (
              <div>
                <img
                  src={
                    value.startsWith(baseImageUrl)
                      ? value
                      : selectedFilePreview || `${baseImageUrl}image.svg`
                  }
                  alt="Current Image"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <p className="mt-1 text-sm text-gray-600">
                  Currently Used Image
                </p>
              </div>
            ) : (
              <img src={`${baseImageUrl}image.svg`} alt="" />
            )}
          </div>
          <div className="flex-1">
            <label
              className="flex items-center justify-center px-4 py-2 bg-[#39AF9F] text-white rounded-lg cursor-pointer hover:bg-green-500"
              htmlFor={`${key}-file-input`}
            >
              <AiOutlineFileImage className="mr-2" />
              <span>Select Image</span>
            </label>
            <input
              type="file"
              id={`${key}-file-input`}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(key, e.target.files[0]);
                } else {
                  setSelectedFileName("");
                  setSelectedFilePreview(null);
                }
              }}
            />
            {selectedFilePreview && (
              <div className="mt-4 flex items-center">
                <img
                  src={selectedFilePreview}
                  alt="Selected File Preview"
                  className="w-24 h-24 object-cover rounded-lg mr-4"
                />
                <div>
                  <p className="text-sm text-gray-600">Newly Selected Image</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedFileName}
                  </p>
                </div>
              </div>
            )}
          </div>
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
            value={typeof value === "string" ? value : ""}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
      );
    }
  };

  // debugger;
  return (
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
  );
};

export default FormComponent;
