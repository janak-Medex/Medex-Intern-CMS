// DynamicFormRenderer.tsx

import React, { useEffect, useState } from "react";
import axiosInstance from "../http/axiosInstance";

interface FieldType {
  type: string;
  required: boolean;
  fieldName: string;
  placeholder: string;
  options?: string[];
}

interface FormType {
  _id: {
    $oid: string;
  };
  name: string;
  fields: FieldType[];
}

interface TemplateType {
  _id: {
    $oid: string;
  };
  template_name: string;
  forms: FormType[];
}

const DynamicFormRenderer: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateType[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false); // State to manage loading state

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<TemplateType[]>("/templates");
        setTemplates(response.data); // Set the fetched templates
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateClick = (template: TemplateType) => {
    setSelectedTemplate(template);
  };

  const renderTemplateList = () => (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-bold mb-4">Select a Template</h3>
      <div className="w-full max-w-md">
        <ul className="border rounded-lg overflow-hidden">
          {templates.map((template) => (
            <li
              key={template._id.$oid}
              className="border-b last:border-b-0 cursor-pointer"
              onClick={() => handleTemplateClick(template)}
            >
              <p className="p-4">{template.template_name}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderForm = (form: FormType) => (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-bold mb-4">{form.name}</h3>
      <form
        key={form._id.$oid}
        className="w-full max-w-md bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4"
      >
        {form.fields.map((field) => (
          <div key={field.fieldName} className="mb-4">
            <label
              htmlFor={field.fieldName}
              className="block text-gray-700 font-bold mb-2"
            >
              {field.fieldName}
            </label>
            {getFieldComponent(field)}
          </div>
        ))}
        <div className="flex items-center justify-center mt-6">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );

  const getFieldComponent = (field: FieldType) => {
    switch (field.type) {
      case "text":
      case "textarea":
      case "number":
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        );
      case "select":
        return (
          <select className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "radio":
        return (
          <>
            {field.options?.map((option) => (
              <label key={option} className="block text-gray-700">
                <input
                  type="radio"
                  name={field.fieldName}
                  value={option}
                  className="mr-2 leading-tight"
                />
                {option}
              </label>
            ))}
          </>
        );
      case "checkbox":
        return <input type="checkbox" className="mr-2 leading-tight" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-2xl font-bold mb-4">Dynamic Form Renderer</h2>
      <div className="w-full max-w-md mb-8">
        {loading && <p className="text-gray-700">Loading...</p>}
        {!selectedTemplate && !loading && renderTemplateList()}
        {selectedTemplate && (
          <div className="w-full max-w-md">
            {selectedTemplate.forms.map((form) => (
              <div key={form._id.$oid} className="mb-8">
                {renderForm(form)}
              </div>
            ))}
          </div>
        )}
      </div>
      {!selectedTemplate && !loading && (
        <p className="text-red-500">Select a template to view forms</p>
      )}
    </div>
  );
};

export default DynamicFormRenderer;
