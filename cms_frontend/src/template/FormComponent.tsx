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
        d="m20.82 25.43-9-13a1 1 0 0 0-1.57-.1l-9 10A1 1 0 0 0 1 23v1a3 3 0 0 0 3 3h16a1 1 0 0 0 .82-1.57Z"
      />
      <circle cx="20" cy="12" r="2" fill="#fff" />
    </svg>
  );

  const getFieldComponent = (key: string, value: any) => {
    if (key.includes("image")) {
      let imageUrl = value
        ? value.replace(
            /^D:\\intern\\backend_cms_template\\Medex-Intern-Backend\\public\\uploads\\/,
            baseImageUrl
          )
        : placeholderImage; // Use placeholder SVG if value is empty or null

      return (
        <div key={key} className="mb-8 flex items-center">
          <div className="mr-4">
            <label className="block text-gray-800 font-semibold mb-2">
              {key}
            </label>
            {value ? (
              <div>
                <img
                  src={imageUrl}
                  alt="Current Image"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <p className="mt-1 text-sm text-gray-600">
                  Currently Used Image
                </p>
              </div>
            ) : (
              placeholderImage
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
                  const file = e.target.files[0];
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
    }

    return (
      <div key={key} className="mb-4">
        <label className="block text-gray-800 font-semibold mb-2">{key}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500"
        />
      </div>
    );
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
