
import React, { useState, useMemo, useCallback } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './FlowchartView.css';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkflowData } from '@/data/mockData';

interface FlowchartViewProps {
  data: WorkflowData[];
}

interface NetworkNode extends Node {
  data: {
    label: string;
    count: number;
    type: 'project' | 'feed' | 'source' | 'match' | 'workflow' | 'state';
    details: string;
  };
}

const FlowchartView: React.FC<FlowchartViewProps> = ({ data }) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Get unique projects for selection
  const projects = useMemo(() => {
    return [...new Set(data.map(item => item.directorProject))];
  }, [data]);

  // Build network data with React Flow format
  const { initialNodes, initialEdges } = useMemo(() => {
    let filteredData = selectedProject === 'all' 
      ? data 
      : data.filter(item => item.directorProject === selectedProject);

    if (filteredData.length === 0) return { initialNodes: [], initialEdges: [] };

    const nodeMap = new Map<string, NetworkNode>();
    const edgeSet = new Set<string>();
    
    // Define column positions and spacing
    const columnWidth = 280;
    const columnSpacing = 120;
    const nodeHeight = 80;
    const nodeSpacing = 120;

    // Track node counts for positioning
    const levelCounts = new Map<number, number>();
    
    // First pass: create nodes and count by level
    filteredData.forEach(item => {
      const nodes = [
        { id: `project-${item.directorProject}`, label: item.directorProject, type: 'project' as const, level: 0 },
        { id: `feed-${item.directorFeedname}`, label: item.directorFeedname || 'Unknown Feed', type: 'feed' as const, level: 1 },
        { id: `source-${item.scmSource}`, label: item.scmSource || 'Unknown Source', type: 'source' as const, level: 2 },
        { id: `match-${item.matchProcess}`, label: item.matchProcess || 'Unknown Match', type: 'match' as const, level: 3 },
        { id: `workflow-${item.workflow}`, label: item.workflow, type: 'workflow' as const, level: 4 },
        { id: `state-${item.state}`, label: item.state, type: 'state' as const, level: 5 },
      ];

      nodes.forEach(node => {
        if (!nodeMap.has(node.id)) {
          nodeMap.set(node.id, {
            id: node.id,
            type: 'default',
            position: { x: 0, y: 0 },
            data: {
              label: node.label,
              count: 0,
              type: node.type,
              details: `${node.type}: ${node.label}`,
            },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            style: {
              background: getNodeColor(node.type),
              color: 'white',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              minWidth: '200px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              fontSize: '14px',
              fontWeight: '500',
            },
          });
          
          levelCounts.set(node.level, (levelCounts.get(node.level) || 0) + 1);
        }
        
        nodeMap.get(node.id)!.data.count += item.alertCount || 0;
      });

      // Create edges
      const connections = [
        [`project-${item.directorProject}`, `feed-${item.directorFeedname}`],
        [`feed-${item.directorFeedname}`, `source-${item.scmSource}`],
        [`source-${item.scmSource}`, `match-${item.matchProcess}`],
        [`match-${item.matchProcess}`, `workflow-${item.workflow}`],
        [`workflow-${item.workflow}`, `state-${item.state}`],
      ];

      connections.forEach(([source, target]) => {
        edgeSet.add(`${source}->${target}`);
      });
    });

    // Position nodes in columns with proper spacing
    const nodesByLevel = new Map<number, NetworkNode[]>();
    Array.from(nodeMap.values()).forEach(node => {
      const level = getNodeLevel(node.data.type);
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(node);
    });

    // Calculate positions
    nodesByLevel.forEach((levelNodes, level) => {
      const x = level * (columnWidth + columnSpacing) + 100;
      const totalHeight = levelNodes.length * nodeSpacing;
      const startY = Math.max(100, (800 - totalHeight) / 2);

      levelNodes.forEach((node, index) => {
        node.position = {
          x,
          y: startY + index * nodeSpacing,
        };
      });
    });

    // Create edges with beautiful styling
    const edges: Edge[] = Array.from(edgeSet).map((edgeId, index) => {
      const [sourceId, targetId] = edgeId.split('->');
      return {
        id: `edge-${index}`,
        source: sourceId,
        target: targetId,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: '#64748b',
          strokeWidth: 3,
          strokeDasharray: '0',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#64748b',
        },
        labelStyle: {
          fill: '#64748b',
          fontWeight: 500,
        },
      };
    });

    return {
      initialNodes: Array.from(nodeMap.values()),
      initialEdges: edges,
    };
  }, [data, selectedProject]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => {
    // Prevent manual connections in this read-only flowchart
  }, []);

  function getNodeLevel(type: string): number {
    const levels = {
      project: 0,
      feed: 1,
      source: 2,
      match: 3,
      workflow: 4,
      state: 5,
    };
    return levels[type as keyof typeof levels] || 0;
  }

  function getNodeColor(type: string): string {
    const colors = {
      project: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      feed: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      source: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      match: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      workflow: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      state: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  }

  // Custom node component
  const CustomNode = ({ data }: { data: any }) => (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="font-semibold text-sm mb-1 text-center">
        {data.label.length > 20 ? `${data.label.substring(0, 20)}...` : data.label}
      </div>
      <div className="text-xs opacity-80">
        {data.count} alerts
      </div>
    </div>
  );

  const nodeTypes = {
    default: CustomNode,
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="p-6 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Network Workflow Flowchart
        </h3>
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-64 bg-slate-700/50 border-slate-600 text-white backdrop-blur-sm">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all" className="text-white hover:bg-slate-600">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project} value={project} className="text-white hover:bg-slate-600">
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false,
          }}
          className="react-flow-dark-theme"
          style={{
            background: 'transparent',
          }}
          panOnScroll
          selectionOnDrag
          panOnDrag={[1, 2]}
        >
          <Background 
            color="#475569" 
            gap={20} 
            size={1}
            style={{ opacity: 0.3 }}
          />
          <Controls 
            className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-lg"
          />
          <MiniMap 
            className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-lg"
            style={{
              backgroundColor: 'rgba(51, 65, 85, 0.8)',
            }}
            nodeColor={(node) => {
              const nodeData = node.data as { type?: string };
              const type = nodeData?.type || 'default';
              return getNodeColor(type).includes('gradient') ? '#64748b' : getNodeColor(type);
            }}
            maskColor="rgba(0, 0, 0, 0.2)"
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="p-6 bg-slate-800/50 backdrop-blur-sm border-t border-slate-700/50">
        <h4 className="font-semibold text-white mb-4">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { type: 'project', label: 'Director Projects' },
            { type: 'feed', label: 'Feed Names' },
            { type: 'source', label: 'Sources' },
            { type: 'match', label: 'Match Process' },
            { type: 'workflow', label: 'Workflows' },
            { type: 'state', label: 'End States' },
          ].map(({ type, label }) => (
            <div key={type} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 backdrop-blur-sm">
              <div 
                className="w-4 h-4 rounded"
                style={{ background: getNodeColor(type) }}
              ></div>
              <span className="text-sm text-slate-300 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlowchartView;
