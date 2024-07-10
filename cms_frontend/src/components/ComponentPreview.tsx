import React from "react";
import Hero from "../designs/Hero";
import { ComponentPreviewProps } from "./types";

const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  component_name,
  formFields,
}) => {
  console.log("ComponentPreview - formFields:", formFields);

  let fieldValues: Record<string, any> = {};

  if (formFields) {
    if (Array.isArray(formFields)) {
      formFields.forEach((field) => {
        fieldValues[field.key?.toLowerCase()] = field.value;
      });
    } else {
      Object.entries(formFields).forEach(([key, value]) => {
        fieldValues[key.toLowerCase()] = value;
      });
    }
  }

  console.log("ComponentPreview - fieldValues:", fieldValues);

  switch (component_name?.toLowerCase()) {
    case "hero":
      return (
        <Hero
          title={fieldValues["title"] || ""}
          subtitle={fieldValues["subtitle"] || ""}
          buttonText={fieldValues["buttontext"] || ""}
          buttonUrl={fieldValues["buttonurl"] || ""}
        />
      );
    // Add more cases for other components as needed
    default:
      return (
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-gray-500">
            No preview available for this component.
          </p>
        </div>
      );
  }
};

export default ComponentPreview;
