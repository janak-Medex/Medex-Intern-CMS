// FormComponent.tsx
import React, { useState, useEffect } from "react";
import { AiOutlineFileImage } from "react-icons/ai";

interface FormData {
  [key: string]: string | null;
}

interface FormComponentProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const FormComponent: React.FC<FormComponentProps> = ({
  formData,
  setFormData,
  handleSubmit,
}) => {
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(
    null
  );
  const baseImageUrl = import.meta.env.VITE_APP_BASE_IMAGE_URL || "";

  useEffect(() => {
    console.log("Current formData:", formData);
  }, [formData]);

  const handleFieldChange = (key: string, value: string) => {
    console.log(`Changing field ${key} to value:`, value);
    setFormData({
      ...formData,
      [key]: value === "" ? null : value,
    });
  };

  const handleFileChange = (key: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        [key]: `${baseImageUrl}${file.name}`,
      });
      setSelectedFileName(file.name);
      setSelectedFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getFieldComponent = (key: string, value: string | null) => {
    if (key.includes("image")) {
      return (
        <div key={key} className="mb-8 flex items-center">
          <div className="mr-4">
            <label className="block text-gray-800 font-semibold mb-2">
              {key}
            </label>
            {value ? (
              <div>
                <img
                  src={
                    value.startsWith(baseImageUrl)
                      ? value
                      : `${baseImageUrl}${value}`
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
                  handleFileChange(key, e.target.files[0]);
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
            value={value ?? ""}
            onChange={(e) => {
              console.log("Current value:", e.target.value);
              handleFieldChange(key, e.target.value);
            }}
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto font-sans">
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
