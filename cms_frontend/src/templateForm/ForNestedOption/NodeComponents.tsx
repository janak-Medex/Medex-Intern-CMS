// import React, { memo } from "react";
// import { NodeProps } from "reactflow";
// import { Image, Input, Typography } from "antd";
// import { FaBox, FaFolder, FaFile } from "react-icons/fa";
// import BaseNode from "./BaseNode";

// const { Text } = Typography;

// const renderFilePreview = (key: string, value: string) => {
//   const isImage = key.toLowerCase().includes("image");
//   const isVideo = key.toLowerCase().includes("video");
//   const filePath = value.split("uploads\\")[1] || value;
//   const fileUrl = `${import.meta.env.VITE_APP_BASE_IMAGE_URL || ""}${filePath}`;

//   if (isImage) {
//     return (
//       <Image
//         src={fileUrl}
//         alt="Preview"
//         className="max-w-[100px] max-h-[100px] object-cover rounded"
//       />
//     );
//   } else if (isVideo) {
//     return (
//       <video controls className="max-w-[200px] max-h-[200px] rounded">
//         <source src={fileUrl} type="video/mp4" />
//         Your browser does not support the video tag.
//       </video>
//     );
//   } else {
//     return (
//       <Text className="text-gray-600">File: {value.split("\\").pop()}</Text>
//     );
//   }
// };

// const PackageNode: React.FC<NodeProps> = memo((props) => (
//   <BaseNode
//     {...props}
//     data={{
//       ...props.data,
//       icon: <FaBox className="text-yellow-500" />,
//       nodeClass: "border-t-4 border-yellow-500",
//       content: (
//         <>
//           {Object.entries(props.data.keyValuePairs || {}).map(
//             ([key, value]: [string, any]) => (
//               <div key={key} className="mb-2">
//                 <Text className="text-xs font-semibold">{key}</Text>
//                 {["image", "video", "file"].some((type) =>
//                   key.toLowerCase().includes(type)
//                 ) ? (
//                   renderFilePreview(key, value)
//                 ) : (
//                   <Input
//                     value={value}
//                     disabled
//                     size="small"
//                     className="w-full text-sm"
//                   />
//                 )}
//               </div>
//             )
//           )}
//         </>
//       ),
//     }}
//   />
// ));

// const FolderNode: React.FC<NodeProps> = memo((props) => (
//   <BaseNode
//     {...props}
//     data={{
//       ...props.data,
//       icon: <FaFolder className="text-blue-500" />,
//       nodeClass: "bg-blue-100",
//       content: null,
//     }}
//   />
// ));

// const FileNode: React.FC<NodeProps> = memo((props) => (
//   <BaseNode
//     {...props}
//     data={{
//       ...props.data,
//       icon: <FaFile className="text-gray-500" />,
//       nodeClass: "bg-gray-100",
//       content: null,
//     }}
//   />
// ));

// export { PackageNode, FolderNode, FileNode };
