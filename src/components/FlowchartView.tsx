
import React, { useState, useMemo, useCallback } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./FlowchartView.css";
import { Handle } from "@xyflow/react";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkflowData } from "@/data/mockData";

interface FlowchartViewProps {
  data: WorkflowData[];
}

interface NetworkNode extends Node {
  data: {
    label: string;
    count: number;
    type: "project" | "feed" | "source" | "match" | "workflow" | "state";
    details: string;
  };
}

// Move CustomNode and nodeTypes outside component to prevent recreation
const CustomNode = ({ data }: { data: any }) => (
  <div className="flex flex-col items-center justify-center h-full relative px-2 py-1">
    {/* Target Handle (left) */}
    <Handle
      type="target"
      position={Position.Left}
      style={{ background: "#555" }}
    />

    <div className="font-semibold text-sm mb-1 text-center">
      {data.label && data.label.length > 20
        ? `${data.label.substring(0, 20)}...`
        : data.label}
    </div>
    <div className="text-xs opacity-80">{data.count} alerts</div>

    {/* Source Handle (right) */}
    <Handle
      type="source"
      position={Position.Right}
      style={{ background: "#555" }}
    />
  </div>
);

const nodeTypes = {
  default: CustomNode,
};

function getNodeColor(type: string): string {
  const colors = {
    project: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    feed: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    source: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    match: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    workflow: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    state: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  };
  return colors[type as keyof typeof colors] || "#6b7280";
}

const FlowchartView: React.FC<FlowchartViewProps> = ({ data }) => {
  const [selectedProject, setSelectedProject] = useState<string>("all");

  const projects = useMemo(() => {
    return [...new Set(data.map((item) => item.directorProject))].filter(
      Boolean
    ) as string[];
  }, [data]);

  const { initialNodes, initialEdges } = useMemo(() => {
    console.log(`Generating flow for project: ${selectedProject}`);
    
    const filteredData =
      selectedProject === "all"
        ? data
        : data.filter((item) => item.directorProject === selectedProject);

    console.log(`Filtered data length: ${filteredData.length}`);

    if (filteredData.length === 0)
      return { initialNodes: [], initialEdges: [] };

    const nodeMap = new Map<string, NetworkNode>();
    const edgeSet = new Set<string>();

    const columnWidth = 300;
    const verticalSpacing = 100;
    const startX = 50;
    const startY = 50;

    filteredData.forEach((item) => {
      const rawNodes = [
        {
          id: `project_${item.directorProject}`,
          label: item.directorProject,
          type: "project",
          level: 0,
          value: item.directorProject,
        },
        {
          id: `feed_${item.directorFeedname}`,
          label: item.directorFeedname,
          type: "feed",
          level: 1,
          value: item.directorFeedname,
        },
        {
          id: `source_${item.scmSource}`,
          label: item.scmSource,
          type: "source",
          level: 2,
          value: item.scmSource,
        },
        {
          id: `match_${item.matchProcess}`,
          label: item.matchProcess,
          type: "match",
          level: 3,
          value: item.matchProcess,
        },
        {
          id: `workflow_${item.workflow}`,
          label: item.workflow,
          type: "workflow",
          level: 4,
          value: item.workflow,
        },
        {
          id: `state_${item.state}`,
          label: item.state,
          type: "state",
          level: 5,
          value: item.state,
        },
      ];

      const nodeDefinitions = rawNodes.filter((node) => !!node.value);

      nodeDefinitions.forEach((nodeDef) => {
        if (!nodeMap.has(nodeDef.id)) {
          const x = startX + nodeDef.level * columnWidth;
          const existingNodesAtLevel = Array.from(nodeMap.values()).filter(
            (n) => n.position.x === x
          ).length;
          const y = startY + existingNodesAtLevel * verticalSpacing;

          nodeMap.set(nodeDef.id, {
            id: nodeDef.id,
            type: "default",
            position: { x, y },
            data: {
              label: nodeDef.label!,
              count: 0,
              type: nodeDef.type,
              details: `${nodeDef.type}: ${nodeDef.label}`,
            },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            style: {
              background: getNodeColor(nodeDef.type),
              color: "white",
              border: "2px solid rgba(255,255,255,0.2)",
              borderRadius: "12px",
              padding: "12px 16px",
              minWidth: "180px",
              minHeight: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              fontSize: "14px",
              fontWeight: "500",
            },
          });
        }
        const existingNode = nodeMap.get(nodeDef.id);
        if (existingNode) {
          existingNode.data.count += item.alertCount || 1;
        }
      });

      for (let i = 0; i < nodeDefinitions.length - 1; i++) {
        const sourceId = nodeDefinitions[i].id;
        const targetId = nodeDefinitions[i + 1].id;

        if (!nodeMap.has(sourceId) || !nodeMap.has(targetId)) {
          console.warn(
            `⚠️ Skipping edge from ${sourceId} to ${targetId} - missing node`
          );
          continue;
        }

        const edgeId = `${sourceId}->${targetId}`;
        if (!edgeSet.has(edgeId)) {
          edgeSet.add(edgeId);
        }
      }
    });

    const edges: Edge[] = Array.from(edgeSet).map((edgeId, index) => {
      const [sourceId, targetId] = edgeId.split("->");
      return {
        id: `edge-${index}`,
        source: sourceId,
        target: targetId,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: "#64748b",
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: "#64748b",
        },
      };
    });

    console.log(`Generated ${Array.from(nodeMap.values()).length} nodes and ${edges.length} edges`);

    return {
      initialNodes: Array.from(nodeMap.values()),
      initialEdges: edges,
    };
  }, [data, selectedProject]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when initialNodes/initialEdges change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(() => {}, []);

  const handleProjectChange = useCallback((value: string) => {
    console.log(`Project changed to: ${value}`);
    setSelectedProject(value);
  }, []);

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="p-6 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Network Workflow Flowchart
        </h3>
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={handleProjectChange}>
            <SelectTrigger className="w-64 bg-slate-700/50 border-slate-600 text-white backdrop-blur-sm">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 z-50">
              <SelectItem value="all" className="text-white hover:bg-slate-600">
                All Projects
              </SelectItem>
              {projects.map((project) => (
                <SelectItem
                  key={project}
                  value={project}
                  className="text-white hover:bg-slate-600"
                >
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 w-full h-full" style={{ minHeight: '500px' }}>
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.1, includeHiddenNodes: false }}
            className="react-flow-dark-theme w-full h-full"
            panOnScroll
            panOnDrag={[1, 2]}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            key={selectedProject} // Force re-render when project changes
          >
            <Background
              color="#475569"
              gap={20}
              size={1}
              style={{ opacity: 0.3 }}
            />
            <Controls className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-lg" />
            <MiniMap
              className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-lg"
              nodeColor={() => "#64748b"}
              maskColor="rgba(0, 0, 0, 0.2)"
            />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-lg">
              {data.length === 0
                ? "No workflow data available"
                : "No data available for the selected project"}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-800/50 backdrop-blur-sm border-t border-slate-700/50">
        <h4 className="font-semibold text-white mb-4">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { type: "project", label: "Director Projects" },
            { type: "feed", label: "Feed Names" },
            { type: "source", label: "Sources" },
            { type: "match", label: "Match Process" },
            { type: "workflow", label: "Workflows" },
            { type: "state", label: "End States" },
          ].map(({ type, label }) => (
            <div
              key={type}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 backdrop-blur-sm"
            >
              <div
                className="w-4 h-4 rounded"
                style={{ background: getNodeColor(type) }}
              ></div>
              <span className="text-sm text-slate-300 font-medium">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlowchartView;
