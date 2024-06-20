import React, { useState } from "react";
import { AiOutlineFileImage } from "react-icons/ai";
import placeholderImage from "../assets/image.svg";

const FormComponent: React.FC<{
  formData: any;
  setFormData: (data: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
}> = ({ formData, setFormData, handleSubmit }) => {
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(
    null
  );
  const baseImageUrl = import.meta.env.VITE_APP_BASE_IMAGE_URL || "";

  const placeholderImage = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className="w-24 h-24 object-cover rounded-lg"
      aria-labelledby="image"
    >
      <title id="image">Placeholder Image</title>
      <path
        fill="#56aaff"
        d="M28 5H4a3 3 0 0 0-3 3v15a1 1 0 0 0 1.74.67l8.15-9.08 5.6 8.09a1 1 0 0 0 1.43.22l6-4.59 5.38 5.47a1 1 0 0 0 1.7-.68V8a3 3 0 0 0-3-3Z"
      />
      <path
        fill="#0478ed"
        d="m30.71 22.4-6-6.1a1 1 0 0 0-1.32-.09l-6.68 5.13a1 1 0 0 0-.21 1.36l2.68 3.87A1 1 0 0 0 20 27h8a3 3 0 0 0 3-3v-.9a1 1 0 0 0-.29-.7Z"
      />
      <path
        fill="#0478ed"
        d="m20.82 25.43-9-13a1 1 0 0 1 1.52-1.29l7.89 11.35 5.59-4.28 4.15 4.23Z"
      />
    </svg>
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearFile = () => {
    setSelectedFileName("");
    setSelectedFilePreview(null);
  };

  const handleFormDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <h2 className="text-xl font-semibold mb-4">Form Component</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Component Name
          </label>
          <input
            type="text"
            name="component_name"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-teal-500"
            value={formData.component_name || ""}
            onChange={handleFormDataChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Data</label>
          {/* Example fields, adjust based on actual form fields */}
          {Object.keys(formData).map((key, index) => (
            <div key={index} className="mb-2">
              <label className="text-gray-700">{key}</label>
              <input
                type="text"
                name={key}
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-teal-500"
                value={formData[key] || ""}
                onChange={handleFormDataChange}
              />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Image</label>
          <div className="flex items-center">
            {selectedFilePreview ? (
              <img
                src={selectedFilePreview}
                alt="Selected File"
                className="w-24 h-24 object-cover rounded-lg mr-4"
              />
            ) : (
              placeholderImage
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer text-teal-600 font-semibold"
              >
                Choose File
              </label>
              {selectedFileName && (
                <button
                  type="button"
                  className="ml-2 text-red-500 focus:outline-none"
                  onClick={handleClearFile}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-4 py-3 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormComponent;
