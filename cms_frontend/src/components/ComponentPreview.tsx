import React from "react";
import { FormField } from "./types";
import Hero from "../designs/Hero";

interface ComponentPreviewProps {
  component_name: string;
  formFields: FormField[];
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  component_name,
  formFields,
}) => {
  console.log("ComponentPreview - formFields:", formFields);

  // Initialize an empty object for fieldValues
  let fieldValues: Record<string, any> = {};

  // Extract values from formFields
  formFields.forEach((field) => {
    Object.entries(field).forEach(([key, value]) => {
      fieldValues[key.toLowerCase()] = value;
    });
  });

  console.log("ComponentPreview - fieldValues:", fieldValues);

  // Render the appropriate component preview based on component_name
  switch (component_name.toLowerCase()) {
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
