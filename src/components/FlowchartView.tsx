
import React, { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { WorkflowData } from '@/data/mockData';
import { 
  ReactFlow, 
  Node, 
  Edge, 
  Controls, 
  MiniMap, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './FlowchartView.css';

interface FlowchartViewProps {
  data: WorkflowData[];
}

interface FlowNode extends Node {
  data: {
    label: string;
    type: 'project' | 'feed' | 'source' | 'match' | 'workflow' | 'state';
    count: number;
    level: number;
    originalId: string;
  };
}

const FlowchartView: React.FC<FlowchartViewProps> = ({ data }) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Get unique projects for selection
  const projects = useMemo(() => {
    return [...new Set(data.map(item => item.directorProject))].filter(Boolean);
  }, [data]);

  // Define getNodeColor function before useMemo
  const getNodeColor = useCallback((type: string): string => {
    const colors = {
      project: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      feed: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      source: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      match: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      workflow: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      state: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    };
    return colors[type as keyof typeof colors] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }, []);

  // Build flowchart data using React Flow format
  const { initialNodes, initialEdges } = useMemo(() => {
    console.log('🔄 Building React Flow data...', { selectedProject, dataLength: data.length });
    
    let filteredData = selectedProject === 'all' 
      ? data 
      : data.filter(item => item.directorProject === selectedProject);

    if (filteredData.length === 0) {
      return { initialNodes: [], initialEdges: [] };
    }

    const nodes: FlowNode[] = [];
    const edges: Edge[] = [];
    const nodeMap = new Map<string, FlowNode>();

    // Positioning configuration
    const levelWidth = 350;
    const nodeHeight = 120;
    const levelCounts = new Map<number, number>();

    filteredData.forEach(item => {
      const hierarchy = [
        { id: `project_${item.directorProject}`, label: item.directorProject, type: 'project' as const, level: 0 },
        { id: `feed_${item.directorProject}_${item.directorFeedname}`, label: item.directorFeedname, type: 'feed' as const, level: 1, parentId: `project_${item.directorProject}` },
        { id: `source_${item.directorProject}_${item.directorFeedname}_${item.scmSource}`, label: item.scmSource, type: 'source' as const, level: 2, parentId: `feed_${item.directorProject}_${item.directorFeedname}` },
        { id: `match_${item.directorProject}_${item.directorFeedname}_${item.scmSource}_${item.matchProcess}`, label: item.matchProcess, type: 'match' as const, level: 3, parentId: `source_${item.directorProject}_${item.directorFeedname}_${item.scmSource}` },
        { id: `workflow_${item.directorProject}_${item.directorFeedname}_${item.scmSource}_${item.matchProcess}_${item.workflow}`, label: item.workflow, type: 'workflow' as const, level: 4, parentId: `match_${item.directorProject}_${item.directorFeedname}_${item.scmSource}_${item.matchProcess}` },
        { id: `state_${item.directorProject}_${item.directorFeedname}_${item.scmSource}_${item.matchProcess}_${item.workflow}_${item.state}`, label: item.state, type: 'state' as const, level: 5, parentId: `workflow_${item.directorProject}_${item.directorFeedname}_${item.scmSource}_${item.matchProcess}_${item.workflow}` }
      ];

      hierarchy.forEach((nodeData, index) => {
        if (!nodeMap.has(nodeData.id)) {
          const currentLevelCount = levelCounts.get(nodeData.level) || 0;
          levelCounts.set(nodeData.level, currentLevelCount + 1);

          const node: FlowNode = {
            id: nodeData.id,
            type: 'default',
            position: { 
              x: nodeData.level * levelWidth, 
              y: currentLevelCount * nodeHeight 
            },
            data: {
              label: nodeData.label,
              type: nodeData.type,
              count: 0,
              level: nodeData.level,
              originalId: nodeData.id
            },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            style: {
              background: getNodeColor(nodeData.type),
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              fontWeight: 'bold',
              width: 200,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              fontSize: '12px',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }
          };

          nodeMap.set(nodeData.id, node);
          nodes.push(node);

          // Add edge to parent
          if (nodeData.parentId && index > 0) {
            edges.push({
              id: `edge-${nodeData.parentId}-${nodeData.id}`,
              source: nodeData.parentId,
              target: nodeData.id,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#64748b', strokeWidth: 3 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#64748b',
              },
            });
          }
        }

        // Update count
        const node = nodeMap.get(nodeData.id)!;
        node.data.count += item.alertCount || 1;
        // Update node label to include count
        node.data.label = `${nodeData.label}\n(${node.data.count} alerts)`;
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [data, selectedProject, getNodeColor]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when data changes
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onLayoutNodes = useCallback(() => {
    // Auto-layout functionality
    const layoutedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (node.data.level || 0) * 350,
        y: index * 120
      }
    }));
    setNodes(layoutedNodes);
  }, [nodes, setNodes]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="p-6 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Interactive Workflow Flowchart
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
          <Button 
            onClick={onLayoutNodes}
            variant="outline"
            className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600"
          >
            Auto Layout
          </Button>
          <div className="text-sm text-slate-300">
            Drag nodes to rearrange • Zoom and pan to explore • Use controls on bottom-right
          </div>
        </div>
      </div>

      {/* React Flow Content */}
      <div className="flex-1">
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            className="react-flow-dark-theme"
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            minZoom={0.2}
            maxZoom={2}
            attributionPosition="bottom-left"
          >
            <Background 
              gap={20} 
              size={1} 
              color="rgba(255, 255, 255, 0.1)" 
            />
            <Controls 
              position="bottom-right"
              className="react-flow__controls"
            />
            <MiniMap 
              position="top-right"
              className="react-flow__minimap"
              nodeColor={(node) => {
                const colors = {
                  project: '#667eea',
                  feed: '#f093fb',
                  source: '#4facfe',
                  match: '#43e97b',
                  workflow: '#fa709a',
                  state: '#a8edea',
                };
                return colors[node.data.type as keyof typeof colors] || '#667eea';
              }}
            />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-lg">
              {data.length === 0 ? 'No workflow data available' : 'No data available for the selected project'}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-6 bg-slate-800/50 backdrop-blur-sm border-t border-slate-700/50">
        <h4 className="font-semibold text-white mb-4">Node Types</h4>
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
