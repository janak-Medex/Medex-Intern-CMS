// import React from "react";
// import { BaseEdge, EdgeProps, getSmoothStepPath } from "reactflow";

// const CustomEdge: React.FC<EdgeProps> = (props) => {
//   const {
//     id,
//     sourceX,
//     sourceY,
//     targetX,
//     targetY,
//     sourcePosition,
//     targetPosition,
//     style = {},
//     markerEnd,
//   } = props;

//   const [edgePath] = getSmoothStepPath({
//     sourceX,
//     sourceY,
//     sourcePosition,
//     targetX,
//     targetY,
//     targetPosition,
//   });

//   return (
//     <BaseEdge
//       id={id}
//       path={edgePath}
//       markerEnd={markerEnd}
//       style={{ stroke: "#b1b1b7", strokeWidth: 2, ...style }}
//     />
//   );
// };

// export default CustomEdge;
