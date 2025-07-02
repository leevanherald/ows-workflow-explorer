
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
import { ChevronDown, ChevronRight } from 'lucide-react';

interface FlowchartViewProps {
  data: WorkflowData[];
}

interface NetworkNode extends Node {
  data: {
    label: string;
    count: number;
    type: 'project' | 'feed' | 'source' | 'match' | 'workflow' | 'state';
    details: string;
    workflowId: string;
    isExpanded?: boolean;
    isClickable?: boolean;
    onClick?: () => void;
  };
}

const FlowchartView: React.FC<FlowchartViewProps> = ({ data }) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(new Set());

  // Get unique projects for selection
  const projects = useMemo(() => {
    return [...new Set(data.map(item => item.directorProject))].filter(Boolean);
  }, [data]);

  // Toggle workflow expansion
  const toggleWorkflow = useCallback((workflowId: string) => {
    setExpandedWorkflows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workflowId)) {
        newSet.delete(workflowId);
      } else {
        newSet.add(workflowId);
      }
      return newSet;
    });
  }, []);

  // Build network data with React Flow format
  const { initialNodes, initialEdges } = useMemo(() => {
    console.log('🔄 Building flowchart data...', { selectedProject, dataLength: data.length });
    
    let filteredData = selectedProject === 'all' 
      ? data 
      : data.filter(item => item.directorProject === selectedProject);

    console.log('📊 Filtered data:', { filteredLength: filteredData.length, sampleItem: filteredData[0] });

    if (filteredData.length === 0) {
      console.log('❌ No data to display');
      return { initialNodes: [], initialEdges: [] };
    }

    const nodeMap = new Map<string, NetworkNode>();
    const edgeSet = new Set<string>();
    
    // Define positioning
    const columnWidth = 400;
    const verticalSpacing = 120;
    const startX = 100;
    const startY = 100;

    // Process each data item to create nodes
    filteredData.forEach((item, index) => {
      const workflowId = `${item.directorProject}_${item.directorFeedname}_${item.scmSource}_${item.matchProcess}_${item.workflow}`;
      const isExpanded = expandedWorkflows.has(workflowId);
      
      console.log(`🔍 Processing item ${index + 1}/${filteredData.length}:`, {
        project: item.directorProject,
        feed: item.directorFeedname,
        source: item.scmSource,
        match: item.matchProcess,
        workflow: item.workflow,
        state: item.state,
        workflowId,
        isExpanded
      });

      // Create safe node IDs by filtering out null/undefined values
      const nodeDefinitions = [
        { 
          id: `project_${item.directorProject || 'unknown'}`, 
          label: item.directorProject || 'Unknown Project', 
          type: 'project' as const, 
          level: 0,
          value: item.directorProject,
          isClickable: true
        },
        { 
          id: `feed_${item.directorFeedname || 'unknown'}_${workflowId}`, 
          label: item.directorFeedname || 'Unknown Feed', 
          type: 'feed' as const, 
          level: 1,
          value: item.directorFeedname,
          isClickable: false,
          shouldShow: isExpanded
        },
        { 
          id: `source_${item.scmSource || 'unknown'}_${workflowId}`, 
          label: item.scmSource || 'Unknown Source', 
          type: 'source' as const, 
          level: 2,
          value: item.scmSource,
          isClickable: true,
          shouldShow: isExpanded
        },
        { 
          id: `match_${item.matchProcess || 'unknown'}_${workflowId}`, 
          label: item.matchProcess || 'Unknown Match', 
          type: 'match' as const, 
          level: 3,
          value: item.matchProcess,
          isClickable: false,
          shouldShow: isExpanded
        },
        { 
          id: `workflow_${item.workflow || 'unknown'}_${workflowId}`, 
          label: item.workflow || 'Unknown Workflow', 
          type: 'workflow' as const, 
          level: 4,
          value: item.workflow,
          isClickable: true,
          shouldShow: isExpanded
        },
        { 
          id: `state_${item.state || 'unknown'}_${workflowId}`, 
          label: item.state || 'Unknown State', 
          type: 'state' as const, 
          level: 5,
          value: item.state,
          isClickable: false,
          shouldShow: isExpanded
        },
      ].filter(node => node.value && (node.level === 0 || node.shouldShow)); // Only include nodes with valid values and respect expansion state

      // Create or update nodes
      nodeDefinitions.forEach(nodeDef => {
        if (!nodeMap.has(nodeDef.id)) {
          const x = startX + (nodeDef.level * columnWidth);
          const existingNodesAtLevel = Array.from(nodeMap.values()).filter(n => 
            n.position.x === x
          ).length;
          const y = startY + (existingNodesAtLevel * verticalSpacing);

          nodeMap.set(nodeDef.id, {
            id: nodeDef.id,
            type: 'default',
            position: { x, y },
            data: {
              label: nodeDef.label,
              count: 0,
              type: nodeDef.type,
              details: `${nodeDef.type}: ${nodeDef.label}`,
              workflowId,
              isExpanded: nodeDef.type === 'project' ? expandedWorkflows.has(workflowId) : false,
              isClickable: nodeDef.isClickable,
              onClick: nodeDef.isClickable ? () => toggleWorkflow(workflowId) : undefined,
            },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            style: {
              background: getNodeColor(nodeDef.type),
              color: 'white',
              border: '3px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              padding: '20px 24px',
              minWidth: '220px',
              minHeight: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: nodeDef.isClickable ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
            },
          });
        }
        
        // Update count
        const existingNode = nodeMap.get(nodeDef.id);
        if (existingNode) {
          existingNode.data.count += item.alertCount || 1;
        }
      });

      // Create edge connections only between valid nodes that should be shown
      if (nodeDefinitions.length >= 2) {
        for (let i = 0; i < nodeDefinitions.length - 1; i++) {
          const sourceId = nodeDefinitions[i].id;
          const targetId = nodeDefinitions[i + 1].id;
          const edgeId = `${sourceId}->${targetId}`;
          
          if (nodeMap.has(sourceId) && nodeMap.has(targetId) && !edgeSet.has(edgeId)) {
            edgeSet.add(edgeId);
          }
        }
      }
    });

    console.log('✅ Created nodes:', nodeMap.size);
    console.log('✅ Created edge connections:', edgeSet.size);

    // Create edges array
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
          strokeWidth: 4,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 24,
          height: 24,
          color: '#64748b',
        },
      };
    });

    const finalNodes = Array.from(nodeMap.values());
    console.log('🎯 Final result:', { 
      nodes: finalNodes.length, 
      edges: edges.length,
      nodesSample: finalNodes.slice(0, 3).map(n => ({ id: n.id, label: n.data.label }))
    });

    return {
      initialNodes: finalNodes,
      initialEdges: edges,
    };
  }, [data, selectedProject, expandedWorkflows, toggleWorkflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(() => {
    // Prevent manual connections in this read-only flowchart
  }, []);

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
    <div 
      className={`flex flex-col items-center justify-center h-full w-full ${
        data.isClickable ? 'hover:scale-105 active:scale-95' : ''
      }`}
      onClick={data.onClick}
      style={{ transition: 'transform 0.2s ease' }}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="font-bold text-lg text-center leading-tight">
          {data.label && data.label.length > 25 ? `${data.label.substring(0, 25)}...` : data.label}
        </div>
        {data.isClickable && (
          <div className="flex-shrink-0">
            {data.isExpanded ? (
              <ChevronDown className="w-5 h-5 opacity-80" />
            ) : (
              <ChevronRight className="w-5 h-5 opacity-80" />
            )}
          </div>
        )}
      </div>
      <div className="text-sm opacity-90 font-medium">
        {data.count} alert{data.count !== 1 ? 's' : ''}
      </div>
      {data.isClickable && (
        <div className="text-xs opacity-70 mt-1">
          Click to {data.isExpanded ? 'collapse' : 'expand'}
        </div>
      )}
    </div>
  );

  const nodeTypes = {
    default: CustomNode,
  };

  console.log('🖼️ FlowchartView render:', { 
    nodesCount: nodes.length, 
    edgesCount: edges.length,
    selectedProject,
    dataLength: data.length,
    expandedWorkflows: Array.from(expandedWorkflows)
  });

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="p-6 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Interactive Network Workflow Flowchart
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
          <div className="text-sm text-slate-300">
            Click on Director Projects, Sources, or Workflows to expand/collapse
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 relative">
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.1,
              includeHiddenNodes: false,
            }}
            className="react-flow-dark-theme"
            panOnScroll
            panOnDrag={[1, 2]}
            defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
          >
            <Background 
              color="#475569" 
              gap={24} 
              size={2}
              style={{ opacity: 0.3 }}
            />
            <Controls 
              className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-lg"
            />
            <MiniMap 
              className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-lg"
              nodeColor={() => '#64748b'}
              maskColor="rgba(0, 0, 0, 0.2)"
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
        <h4 className="font-semibold text-white mb-4">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { type: 'project', label: 'Director Projects', clickable: true },
            { type: 'feed', label: 'Feed Names', clickable: false },
            { type: 'source', label: 'Sources', clickable: true },
            { type: 'match', label: 'Match Process', clickable: false },
            { type: 'workflow', label: 'Workflows', clickable: true },
            { type: 'state', label: 'End States', clickable: false },
          ].map(({ type, label, clickable }) => (
            <div key={type} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 backdrop-blur-sm">
              <div 
                className="w-4 h-4 rounded"
                style={{ background: getNodeColor(type) }}
              ></div>
              <span className="text-sm text-slate-300 font-medium">
                {label} {clickable && <span className="text-xs opacity-70">(clickable)</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlowchartView;
