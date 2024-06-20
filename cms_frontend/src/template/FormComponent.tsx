import React, { useState } from "react";
import { AiOutlineFileImage } from "react-icons/ai";

const FormComponent: React.FC<{
  formData: any;
  setFormData: (data: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleInsertRule: () => void;
}> = ({ formData, setFormData, handleSubmit, handleInsertRule }) => {
  const baseImageUrl = import.meta.env.REACT_APP_BASE_IMAGE_URL || "";
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const getFieldComponent = (key: string, value: any) => {
    if (key.includes("image")) {
      const imageUrl = value
        ? `${baseImageUrl}${value.split("\\").pop()}`
        : null;

      return (
        <div key={key} className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">{key}</label>
          <div className="flex items-center">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Current Image"
                className="w-20 h-20 object-cover rounded-lg mr-4"
              />
            )}
            {!imageUrl && imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg mr-4"
              />
            )}
            <label className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg cursor-pointer">
              <AiOutlineFileImage className="mr-2" />
              <span>Choose Image</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, [key]: file.name });
                      setSelectedFileName(file.name);
                      setImagePreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
            {selectedFileName && (
              <p className="ml-2 text-sm text-gray-600">{selectedFileName}</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">{key}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-teal-500"
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {Object.entries(formData).map(([key, value]) =>
        getFieldComponent(key, value)
      )}
      <button
        type="submit"
        className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none"
      >
        Submit
      </button>
      <button
        type="button"
        onClick={handleInsertRule}
        className="ml-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none"
      >
        Insert New Schema Rule
      </button>
    </form>
  );
};

export default FormComponent;
