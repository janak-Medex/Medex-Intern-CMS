import React, { useCallback, useMemo, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  NodeTypes,
  EdgeTypes,
  MarkerType,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { PackageNode, FolderNode, FileNode } from "./NodeComponents";
import CustomEdge from "./CustomEdge";

interface NestedOptionType {
  label: string;
  isPackage: boolean;
  keyValuePairs?: Record<string, string>;
  options?: NestedOptionType[];
}

interface NestedOptionPreviewProps {
  options: NestedOptionType[] | any;
}

const nodeTypes: NodeTypes = {
  package: PackageNode,
  folder: FolderNode,
  file: FileNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const NestedOptionPreview: React.FC<NestedOptionPreviewProps> = ({
  options,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    console.log("NestedOptionPreview rendered with options:", options);
  }, [options]);

  const onToggleExpand = useCallback(
    (id: string, isExpanded: boolean) => {
      console.log(`Toggling expand for node ${id}:`, isExpanded);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            node.data = { ...node.data, isExpanded };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const onToggleLock = useCallback(
    (id: string, isLocked: boolean) => {
      console.log(`Toggling lock for node ${id}:`, isLocked);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            node.data = { ...node.data, isLocked };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const createNodesAndEdges = useCallback(
    (
      data: NestedOptionType[],
      parentId: string | null = null,
      level: number = 0
    ): [Node[], Edge[]] => {
      console.log("Creating nodes and edges for data:", data);
      let nodes: Node[] = [];
      let edges: Edge[] = [];

      data.forEach((item, index) => {
        console.log("Processing item:", item);

        const id = parentId ? `${parentId}-${index}` : `${level}-${index}`;

        const nodeType = item.isPackage
          ? "package"
          : item.options && item.options.length > 0
          ? "folder"
          : "file";

        const node: Node = {
          id,
          type: nodeType,
          data: {
            label: item.label,
            keyValuePairs: item.keyValuePairs,
            hasChildren: !!(item.options && item.options.length > 0),
            onToggleExpand,
            onToggleLock,
            isLocked: false,
          },
          position: { x: 0, y: 0 },
        };

        console.log("Created node:", node);
        nodes.push(node);

        if (parentId) {
          edges.push({
            id: `e${parentId}-${id}`,
            source: parentId,
            target: id,
            type: "custom",
            animated: true,
            label: item.isPackage ? "contains" : "has",
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          });
        }

        if (item.options && item.options.length > 0) {
          const [childNodes, childEdges] = createNodesAndEdges(
            item.options,
            id,
            level + 1
          );
          nodes = [...nodes, ...childNodes];
          edges = [...edges, ...childEdges];
        }
      });

      console.log("Created nodes:", nodes);
      console.log("Created edges:", edges);
      return [nodes, edges];
    },
    [onToggleExpand, onToggleLock]
  );

  const getLayoutedElements = (
    nodes: Node[],
    edges: Edge[],
    direction = "TB"
  ) => {
    console.log("Laying out elements");
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 280;
    const nodeHeight = 200;

    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
      return node;
    });

    console.log("Layouted nodes:", layoutedNodes);
    console.log("Layouted edges:", edges);
    return { nodes: layoutedNodes, edges };
  };

  useMemo(() => {
    console.log("Recalculating nodes and edges");
    const [newNodes, newEdges] = createNodesAndEdges(options);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      newNodes,
      newEdges
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [options, createNodesAndEdges, setNodes, setEdges]);

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default NestedOptionPreview;
