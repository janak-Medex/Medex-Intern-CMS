import React, { useEffect, useState } from "react";
import axiosInstance from "../http/axiosInstance";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51PfxfMDABU1U1jxAZbOpil26MSyGYTbVC8ACplXYG9ms3oaXdTxqCftGVF8MeIZnpaYi2VtG1jJwUxVdhM5iNnze00HhLOCXm3"
);

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
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [showStripeElement, setShowStripeElement] = useState<boolean>(false);

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
    setFormData({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    if (name === "payment method" && value === "stripe") {
      setShowStripeElement(true);
    } else {
      setShowStripeElement(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axiosInstance.post("/formData/submit", {
        template_name: selectedTemplate?.template_name,
        form_name: selectedTemplate?.forms[0].name,
        formData: formData,
      });
      console.log("Form submitted successfully:", response.data);
      // Handle successful submission (e.g., show a success message, reset form)
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error (e.g., show error message)
    } finally {
      setLoading(false);
    }
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
    <div className="w-[50vw] bg-white shadow-lg rounded-lg overflow-hidden">
      <h3 className="text-xl font-bold p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        {form.name}
      </h3>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {form.fields.map((field) => getFieldComponent(field))}
        {showStripeElement && (
          <Elements stripe={stripePromise}>
            <StripePaymentElement />
          </Elements>
        )}
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
          <div key={field.fieldName} className="mb-4">
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
              onChange={handleInputChange}
              value={formData[field.fieldName] || ""}
              {...requiredProps}
            />
          </div>
        );
      case "textarea":
        return (
          <div key={field.fieldName} className="mb-4">
            <label htmlFor={field.fieldName} className={labelClasses}>
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              id={field.fieldName}
              name={field.fieldName}
              placeholder={field.placeholder}
              className={`${baseClasses} h-24 resize-none`}
              onChange={handleInputChange}
              value={formData[field.fieldName] || ""}
              {...requiredProps}
            />
          </div>
        );
      case "select":
        return (
          <div key={field.fieldName} className="mb-4">
            <label htmlFor={field.fieldName} className={labelClasses}>
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={field.fieldName}
              name={field.fieldName}
              className={baseClasses}
              onChange={handleInputChange}
              value={formData[field.fieldName] || ""}
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
          <div key={field.fieldName} className="mb-4">
            <label className={labelClasses}>
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="mt-2 space-y-2">
              {field.options?.map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    name={field.fieldName}
                    value={option}
                    onChange={handleInputChange}
                    checked={formData[field.fieldName] === option}
                    className="form-radio text-blue-500"
                    {...requiredProps}
                  />
                  <span className="ml-2">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case "checkbox":
        return (
          <div key={field.fieldName} className="mb-4">
            <label htmlFor={field.fieldName} className={labelClasses}>
              <input
                type="checkbox"
                id={field.fieldName}
                name={field.fieldName}
                onChange={handleInputChange}
                checked={formData[field.fieldName] || false}
                className="form-checkbox text-blue-500"
                {...requiredProps}
              />
              <span className="ml-2">{field.fieldName}</span>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen py-12 bg-gradient-to-r from-gray-100 via-blue-100 to-purple-100">
      {loading ? (
        <div>Loading...</div>
      ) : selectedTemplate ? (
        renderForm(selectedTemplate.forms[0])
      ) : (
        renderTemplateList()
      )}
    </div>
  );
};

const StripePaymentElement: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (cardElement) {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        console.error("Stripe Payment Error:", error);
      } else {
        console.log("Stripe Payment Method:", paymentMethod);
        // Handle the payment method ID and send to your server
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Card Details
      </label>
      <CardElement className="p-4 border border-gray-300 rounded-md" />
      <button
        type="submit"
        className="mt-4 w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-2 px-4 rounded-md hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
      >
        Pay
      </button>
    </form>
  );
};

export default DynamicFormRenderer;
