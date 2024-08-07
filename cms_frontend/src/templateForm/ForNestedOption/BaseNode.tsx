// import React, { useState, memo } from "react";
// import { NodeProps, Handle, Position } from "reactflow";
// import { Card, Typography, Button, Tooltip } from "antd";
// import {
//   FaLock,
//   FaUnlock,
//   FaChevronDown,
//   FaChevronRight,
// } from "react-icons/fa";

// const { Text } = Typography;

// const BaseNode: React.FC<NodeProps> = ({ data, id }) => {
//   const [isExpanded, setIsExpanded] = useState(true);
//   const [isLocked, setIsLocked] = useState(data.isLocked || false);

//   const toggleExpand = () => {
//     setIsExpanded(!isExpanded);
//     data.onToggleExpand(id, !isExpanded);
//   };

//   const toggleLock = () => {
//     setIsLocked(!isLocked);
//     data.onToggleLock(id, !isLocked);
//   };

//   return (
//     <div>
//       <Handle type="target" position={Position.Top} id={`${id}-top`} />
//       <Card
//         title={
//           <div className="flex items-center justify-between">
//             <span className="flex items-center space-x-2">
//               {data.icon}
//               <Text strong>{data.label}</Text>
//             </span>
//             <div className="flex items-center space-x-2">
//               <Tooltip title={isLocked ? "Unlock" : "Lock"}>
//                 <Button
//                   icon={isLocked ? <FaLock /> : <FaUnlock />}
//                   size="small"
//                   onClick={toggleLock}
//                 />
//               </Tooltip>
//               {data.hasChildren && (
//                 <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
//                   <Button
//                     icon={isExpanded ? <FaChevronDown /> : <FaChevronRight />}
//                     size="small"
//                     onClick={toggleExpand}
//                   />
//                 </Tooltip>
//               )}
//             </div>
//           </div>
//         }
//         size="small"
//         className={`w-64 shadow-lg ${data.nodeClass}`}
//         bodyStyle={{ padding: "8px", display: isExpanded ? "block" : "none" }}
//       >
//         {data.content}
//       </Card>
//       <Handle type="source" position={Position.Bottom} id={`${id}-bottom`} />
//     </div>
//   );
// };

// export default memo(BaseNode);
