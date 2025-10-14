import React, { useMemo, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";

// Tooltip Component
const Tooltip = ({ content, position }) => {
  if (!content) return null;
  return (
    <div
      className="absolute bg-black text-white text-xs rounded py-1 px-2 shadow-lg z-10"
      style={{ top: position.y + 15, left: position.x + 15 }}
    >
      {content}
    </div>
  );
};

// Auto-layout function using dagre
const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const nodeWidth = 200;
const nodeHeight = 70;

const getLayoutedElements = (root) => {
  const nodes = [];
  const edges = [];

  const traverse = (node, parent = null) => {
    nodes.push({
      id: node.name,
      data: {
        label: `${node.icon} ${node.name}`,
        definition: node.definition,
      },
      position: { x: 0, y: 0 },
      style: {
        background: "linear-gradient(135deg, #e0f7fa, #ffffff)",
        border: "2px solid #81d4fa",
        borderRadius: 12,
        padding: 8,
        fontSize: 13,
        fontWeight: 600,
        color: "#0277bd",
        width: nodeWidth,
        textAlign: "center",
        boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
      },
    });

    if (parent) {
      edges.push({
        id: `e-${parent}-${node.name}`,
        source: parent,
        target: node.name,
        animated: true,
        style: { stroke: "#0288d1", strokeWidth: 2 },
      });
    }

    if (node.children) {
      node.children.forEach((child) => traverse(child, node.name));
    }
  };

  traverse(root);

  dagreGraph.setGraph({ rankdir: "TB", nodesep: 80, ranksep: 120 });

  nodes.forEach((n) => dagreGraph.setNode(n.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((e) => dagreGraph.setEdge(e.source, e.target));
  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((n) => {
    const pos = dagreGraph.node(n.id);
    return { ...n, position: { x: pos.x, y: pos.y } };
  });

  return { nodes: layoutedNodes, edges };
};

export default function MindMapDisplay({ data, onNodeClick }) {
  const [tooltip, setTooltip] = useState(null);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };
    return getLayoutedElements(data);
  }, [data]);

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutedEdges);

  const onNodeMouseEnter = useCallback((event, node) => {
    setTooltip({
      content: node.data.definition,
      position: { x: event.clientX, y: event.clientY },
    });
  }, []);

  const onNodeMouseLeave = useCallback(() => setTooltip(null), []);

  if (!data) return null;

  return (
    <div
      style={{ height: "75vh" }}
      className="relative bg-white rounded-xl shadow-2xl border border-gray-200"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(event, node) =>
          onNodeClick(node.data.label.split(" ").slice(1).join(" "))
        }
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        fitView
        attributionPosition="bottom-right"
      >
        <Background gap={16} color="#ddd" />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={() => "#81d4fa"}
          maskColor="rgba(240,240,240,0.7)"
        />
        <Controls />
      </ReactFlow>
      <Tooltip content={tooltip?.content} position={tooltip?.position} />
    </div>
  );
}
