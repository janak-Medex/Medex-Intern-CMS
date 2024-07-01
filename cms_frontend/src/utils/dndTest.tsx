import React, { useState } from "react";
import "tailwindcss/tailwind.css";

const DnDComponent = () => {
  const [components, setComponents] = useState([
    { id: "1", name: "hero" },
    { id: "2", name: "about" },
    { id: "3", name: "services" },
    { id: "4", name: "banner_without_image" },
    { id: "5", name: "review" },
  ]);

  const [draggedItem, setDraggedItem] = useState(null);

  const onDragStart = (e, index) => {
    setDraggedItem(components[index]);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.parentNode);
    e.dataTransfer.setDragImage(e.target.parentNode, 20, 20);
  };

  const onDragOver = (index) => {
    const draggedOverItem = components[index];
    if (draggedItem === draggedOverItem) {
      return;
    }
    let newComponents = components.filter(
      (component) => component.id !== draggedItem.id
    );
    newComponents.splice(index, 0, draggedItem);
    setComponents(newComponents);
  };

  const onDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-10">
          Template Builder
        </h1>
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 space-y-4">
            {components.map((component, index) => (
              <ComponentCard
                key={component.id}
                name={component.name}
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={() => onDragOver(index)}
                onDragEnd={onDragEnd}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ComponentCard = ({ name, onDragStart, onDragOver, onDragEnd }) => {
  const getIcon = (name) => {
    switch (name) {
      case "hero":
        return "🦸";
      case "about":
        return "ℹ️";
      case "services":
        return "🛠️";
      case "banner_without_image":
        return "🚩";
      case "review":
        return "⭐";
      default:
        return "📦";
    }
  };

  return (
    <div
      className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg shadow-sm transition duration-300 hover:shadow-md cursor-move border border-indigo-100 hover:border-indigo-300"
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-center">
        <span className="text-3xl mr-4">{getIcon(name)}</span>
        <span className="text-lg font-medium capitalize text-indigo-700">
          {name.replace(/_/g, " ")}
        </span>
      </div>
    </div>
  );
};

export default DnDComponent;
