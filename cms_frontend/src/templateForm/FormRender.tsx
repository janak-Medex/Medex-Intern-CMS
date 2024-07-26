import React, { useEffect, useState } from "react";
import { message } from "antd";
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

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<TemplateType[]>("/templates");
        setTemplates(response.data);
      } catch (error) {
        console.error("Error fetching templates:", error);
        message.error("Failed to fetch templates. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateClick = (template: TemplateType) => {
    setSelectedTemplate(template);
    setFormData({});
    setShowStripeElement(false);
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

    if (name === "payment method") {
      setShowStripeElement(value === "stripe");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) {
      message.error("Stripe.js hasn't loaded yet.");
      return;
    }

    try {
      setLoading(true);
      const paymentMethod = formData["payment method"];
      let gateway = "cash on counter";
      let stripeToken;
      let cardInfo;

      if (paymentMethod === "stripe") {
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error("Card Element not found");
        }

        const { error, paymentMethod: stripePaymentMethod } =
          await stripe.createPaymentMethod({
            type: "card",
            card: cardElement,
          });

        if (error) {
          throw new Error(error.message);
        }

        if (stripePaymentMethod.card) {
          stripeToken = stripePaymentMethod.id;
          gateway = `stripe_${stripePaymentMethod.card.brand}`;
          cardInfo = {
            last4: stripePaymentMethod.card.last4,
            expMonth: stripePaymentMethod.card.exp_month,
            expYear: stripePaymentMethod.card.exp_year,
            brand: stripePaymentMethod.card.brand,
          };
        }
      } else if (paymentMethod === "khalti") {
        gateway = "khalti";
      }

      const response = await axiosInstance.post("/formData/submit", {
        template_name: selectedTemplate?.template_name,
        form_name: selectedTemplate?.forms[0].name,
        formData: { ...formData, gateway, stripeToken, cardInfo },
      });

      message.success("Form submitted successfully!");
      console.log("Form submitted successfully:", response.data);
      // Reset form or redirect user as needed
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to submit form. Please try again.");
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Details
            </label>
            <CardElement
              className="w-full p-3 border border-gray-300 rounded-md"
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#32325d",
                    "::placeholder": {
                      color: "#a0aec0",
                    },
                  },
                },
              }}
            />
          </div>
        )}
        <button
          type="submit"
          className={`${
            loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          } text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out`}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );

  const getFieldComponent = (field: FieldType) => {
    const requiredProps = field.required ? { required: true } : {};
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
    const inputClasses = "w-full p-3 border border-gray-300 rounded-md";

    switch (field.type) {
      case "text":
      case "number":
      case "email":
      case "tel":
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
              onChange={handleInputChange}
              value={formData[field.fieldName] || ""}
              className={inputClasses}
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
              onChange={handleInputChange}
              value={formData[field.fieldName] || ""}
              className={`${inputClasses} h-24`}
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
              onChange={handleInputChange}
              value={formData[field.fieldName] || ""}
              className={inputClasses}
              {...requiredProps}
            >
              <option value="">{field.placeholder}</option>
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
            <label className="inline-flex items-center">
              <input
                type="checkbox"
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      {!selectedTemplate ? (
        renderTemplateList()
      ) : (
        <div className="flex flex-col items-center space-y-4">
          {renderForm(selectedTemplate.forms[0])}
        </div>
      )}
    </div>
  );
};

const FormComponent: React.FC = () => (
  <Elements stripe={stripePromise}>
    <DynamicFormRenderer />
  </Elements>
);

export default FormComponent;
