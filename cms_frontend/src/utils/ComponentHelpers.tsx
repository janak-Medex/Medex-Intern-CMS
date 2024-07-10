import { FormField } from "../components/types";

export const validateForm = (
  component_name: string,
  componentImage: File | null,
  imagePreview: string | null,
  formFields: FormField[],
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
) => {
  const newErrors: { [key: string]: string } = {};

  if (!component_name.trim()) {
    newErrors.component_name = "Component name is required";
  }

  if (!componentImage && !imagePreview) {
    newErrors.component_image = "Component image is required";
  }

  if (formFields.length === 0) {
    newErrors.formFields = "At least one data field is required";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

export const handleImageChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setComponentImage: React.Dispatch<React.SetStateAction<File | null>>,
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const file = event.target.files?.[0];
  if (file) {
    setComponentImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};

export const toggleFullscreen = (
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setIsFullscreen((prev) => !prev);
};
