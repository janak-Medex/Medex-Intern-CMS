import React from "react";
import { FormField } from "./types";
import Hero from "../designs/Hero";

interface ComponentPreviewProps {
  componentName: string;
  formFields: FormField[];
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  componentName,
  formFields,
}) => {
  const fieldValues = formFields.reduce((acc, field) => {
    acc[field.key] = field.value;
    return acc;
  }, {} as Record<string, string>);

  if (componentName.toLowerCase() === "hero") {
    return (
      <Hero
        title={fieldValues.title || ""}
        subtitle={fieldValues.subtitle || ""}
        buttonText={fieldValues.buttonText || ""}
        buttonUrl={fieldValues.buttonUrl || ""}
      />
    );
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <p className="text-gray-500">No preview available for this component.</p>
    </div>
  );
};

export default ComponentPreview;
