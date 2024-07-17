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
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<TemplateType[]>("/templates");
        setTemplates(response.data);
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
    <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
      <h3 className="text-xl font-bold p-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        Select a Template
      </h3>
      <ul className="divide-y divide-gray-200">
        {templates.map((template) => (
          <li
            key={template._id.$oid}
            className="p-4 hover:bg-gray-50 cursor-pointer transition duration-300 ease-in-out flex items-center justify-between"
            onClick={() => handleTemplateClick(template)}
          >
            <p className="text-gray-800 font-medium">
              {template.template_name}
            </p>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderForm = (form: FormType) => (
    <div className="w-[50vw]  bg-white shadow-lg rounded-lg overflow-hidden">
      <h3 className="text-xl font-bold p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        {form.name}
      </h3>
      <form key={form._id.$oid} className="p-6 space-y-6">
        {form.fields.map((field) => getFieldComponent(field))}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-4 rounded-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );

  const getFieldComponent = (field: FieldType) => {
    const baseClasses =
      "w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-300 ease-in-out bg-white text-gray-700";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
    const requiredProps = field.required ? { required: true } : {};

    switch (field.type) {
      case "text":
      case "number":
      case "date":
        return (
          <div className="mb-4">
            <label htmlFor={field.fieldName} className={labelClasses}>
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              id={field.fieldName}
              name={field.fieldName}
              placeholder={field.placeholder}
              className={baseClasses}
              {...requiredProps}
            />
          </div>
        );
      case "textarea":
        return (
          <div className="mb-4">
            <label htmlFor={field.fieldName} className={labelClasses}>
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              id={field.fieldName}
              name={field.fieldName}
              placeholder={field.placeholder}
              className={`${baseClasses} h-24 resize-none`}
              {...requiredProps}
            />
          </div>
        );
      case "select":
        return (
          <div className="mb-4">
            <label htmlFor={field.fieldName} className={labelClasses}>
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={field.fieldName}
              name={field.fieldName}
              className={baseClasses}
              {...requiredProps}
            >
              <option value="">Select an option</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      case "radio":
        return (
          <div className="mb-4">
            <label className={labelClasses}>
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="mt-2 space-y-2">
              {field.options?.map((option) => (
                <label key={option} className="inline-flex items-center mr-4">
                  <input
                    type="radio"
                    name={field.fieldName}
                    value={option}
                    className="form-radio h-4 w-4 text-blue-600"
                    {...requiredProps}
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case "checkbox":
        return (
          <div className="mb-4">
            <label className={labelClasses}>
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="mt-2 space-y-2">
              {field.options ? (
                field.options.map((option) => (
                  <label key={option} className="inline-flex items-center mr-4">
                    <input
                      type="checkbox"
                      name={field.fieldName}
                      value={option}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded"
                      {...requiredProps}
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))
              ) : (
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name={field.fieldName}
                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    {...requiredProps}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {field.placeholder}
                  </span>
                </label>
              )}
            </div>
          </div>
        );
      case "switch":
        return (
          <div className="mb-4">
            <label className="inline-flex items-center cursor-pointer">
              <span className={`${labelClasses} mr-3`}>
                {field.fieldName}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  name={field.fieldName}
                  className="sr-only peer"
                  {...requiredProps}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
          </div>
        );
      case "boolean":
        return (
          <div className="mb-4">
            <label htmlFor={field.fieldName} className={labelClasses}>
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={field.fieldName}
              name={field.fieldName}
              className={baseClasses}
              {...requiredProps}
            >
              <option value="">Select an option</option>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        );
      default:
        return (
          <div className="mb-4">
            <label htmlFor={field.fieldName} className={labelClasses}>
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              id={field.fieldName}
              name={field.fieldName}
              placeholder={field.placeholder}
              className={baseClasses}
              {...requiredProps}
            />
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Dynamic Form Renderer
      </h2>
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {!loading && !selectedTemplate && renderTemplateList()}
      {selectedTemplate && (
        <div className="space-y-8">
          {selectedTemplate.forms.map((form) => (
            <div key={form._id.$oid}>{renderForm(form)}</div>
          ))}
        </div>
      )}
      {!selectedTemplate && !loading && (
        <p className="text-red-500 text-center mt-4 text-sm">
          Select a template to view forms
        </p>
      )}
    </div>
  );
};

export default DynamicFormRenderer;
