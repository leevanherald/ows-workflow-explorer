
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
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(new Set());

  // Get unique projects for selection
  const projects = useMemo(() => {
    return [...new Set(data.map(item => item.directorProject))].filter(Boolean);
  }, [data]);

  // Toggle project expansion
  const toggleProject = useCallback((projectName: string) => {
    console.log('🔄 Toggling project:', projectName);
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectName)) {
        newSet.delete(projectName);
        console.log('📉 Collapsed project:', projectName);
      } else {
        newSet.add(projectName);
        console.log('📈 Expanded project:', projectName);
      }
      return newSet;
    });
  }, []);

  // Toggle workflow expansion
  const toggleWorkflow = useCallback((workflowName: string) => {
    console.log('🔄 Toggling workflow:', workflowName);
    setExpandedWorkflows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workflowName)) {
        newSet.delete(workflowName);
        console.log('📉 Collapsed workflow:', workflowName);
      } else {
        newSet.add(workflowName);
        console.log('📈 Expanded workflow:', workflowName);
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

    console.log('📊 Filtered data:', { filteredLength: filteredData.length });

    if (filteredData.length === 0) {
      console.log('❌ No data to display');
      return { initialNodes: [], initialEdges: [] };
    }

    const nodeMap = new Map<string, NetworkNode>();
    const edgeArray: Edge[] = [];
    
    // Group data by project and workflow
    const projectGroups = new Map<string, WorkflowData[]>();
    const workflowGroups = new Map<string, WorkflowData[]>();
    
    filteredData.forEach(item => {
      const projectKey = item.directorProject;
      const workflowKey = `${item.directorProject}_${item.workflow}`;
      
      if (!projectGroups.has(projectKey)) {
        projectGroups.set(projectKey, []);
      }
      projectGroups.get(projectKey)!.push(item);
      
      if (!workflowGroups.has(workflowKey)) {
        workflowGroups.set(workflowKey, []);
      }
      workflowGroups.get(workflowKey)!.push(item);
    });

    let currentY = 100;
    const verticalSpacing = 200;
    const horizontalSpacing = 400;

    // Create project nodes
    Array.from(projectGroups.entries()).forEach(([projectName, projectData], projectIndex) => {
      const projectId = `project_${projectName}`;
      const isProjectExpanded = expandedProjects.has(projectName);
      const totalAlerts = projectData.reduce((sum, item) => sum + (item.alertCount || 1), 0);

      // Project node
      nodeMap.set(projectId, {
        id: projectId,
        type: 'default',
        position: { x: 100, y: currentY },
        data: {
          label: projectName,
          count: totalAlerts,
          type: 'project',
          details: `Project: ${projectName}`,
          workflowId: projectName,
          isExpanded: isProjectExpanded,
          isClickable: true,
          onClick: () => toggleProject(projectName),
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          background: getNodeColor('project'),
          color: 'white',
          border: '3px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
          padding: '24px 32px',
          minWidth: '280px',
          minHeight: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          fontSize: '18px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        },
      });

      if (isProjectExpanded) {
        let feedY = currentY;
        const uniqueFeeds = [...new Set(projectData.map(item => item.directorFeedname))];
        
        // Create feed nodes
        uniqueFeeds.forEach((feedName, feedIndex) => {
          const feedId = `feed_${feedName}_${projectName}`;
          const feedData = projectData.filter(item => item.directorFeedname === feedName);
          const feedAlerts = feedData.reduce((sum, item) => sum + (item.alertCount || 1), 0);

          nodeMap.set(feedId, {
            id: feedId,
            type: 'default',
            position: { x: 600, y: feedY },
            data: {
              label: feedName,
              count: feedAlerts,
              type: 'feed',
              details: `Feed: ${feedName}`,
              workflowId: `${projectName}_${feedName}`,
              isClickable: false,
            },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            style: {
              background: getNodeColor('feed'),
              color: 'white',
              border: '3px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              padding: '20px 28px',
              minWidth: '240px',
              minHeight: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
              fontSize: '16px',
              fontWeight: '600',
            },
          });

          // Create edge from project to feed
          edgeArray.push({
            id: `${projectId}-${feedId}`,
            source: projectId,
            target: feedId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#64748b', strokeWidth: 4 },
            markerEnd: { type: MarkerType.ArrowClosed, width: 24, height: 24, color: '#64748b' },
          });

          let sourceY = feedY;
          const uniqueSources = [...new Set(feedData.map(item => item.scmSource))];

          // Create source nodes
          uniqueSources.forEach((sourceName, sourceIndex) => {
            const sourceId = `source_${sourceName}_${projectName}_${feedName}`;
            const sourceData = feedData.filter(item => item.scmSource === sourceName);
            const sourceAlerts = sourceData.reduce((sum, item) => sum + (item.alertCount || 1), 0);

            nodeMap.set(sourceId, {
              id: sourceId,
              type: 'default',
              position: { x: 1100, y: sourceY },
              data: {
                label: sourceName,
                count: sourceAlerts,
                type: 'source',
                details: `Source: ${sourceName}`,
                workflowId: `${projectName}_${feedName}_${sourceName}`,
                isClickable: true,
                onClick: () => console.log('Source clicked:', sourceName),
              },
              sourcePosition: Position.Right,
              targetPosition: Position.Left,
              style: {
                background: getNodeColor('source'),
                color: 'white',
                border: '3px solid rgba(255,255,255,0.2)',
                borderRadius: '20px',
                padding: '20px 28px',
                minWidth: '240px',
                minHeight: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              },
            });

            // Create edge from feed to source
            edgeArray.push({
              id: `${feedId}-${sourceId}`,
              source: feedId,
              target: sourceId,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#64748b', strokeWidth: 4 },
              markerEnd: { type: MarkerType.ArrowClosed, width: 24, height: 24, color: '#64748b' },
            });

            let matchY = sourceY;
            const uniqueMatches = [...new Set(sourceData.map(item => item.matchProcess))];

            // Create match process nodes
            uniqueMatches.forEach((matchName, matchIndex) => {
              const matchId = `match_${matchName}_${projectName}_${feedName}_${sourceName}`;
              const matchData = sourceData.filter(item => item.matchProcess === matchName);
              const matchAlerts = matchData.reduce((sum, item) => sum + (item.alertCount || 1), 0);

              nodeMap.set(matchId, {
                id: matchId,
                type: 'default',
                position: { x: 1600, y: matchY },
                data: {
                  label: matchName,
                  count: matchAlerts,
                  type: 'match',
                  details: `Match: ${matchName}`,
                  workflowId: `${projectName}_${feedName}_${sourceName}_${matchName}`,
                  isClickable: false,
                },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
                style: {
                  background: getNodeColor('match'),
                  color: 'white',
                  border: '3px solid rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                  padding: '20px 28px',
                  minWidth: '240px',
                  minHeight: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
                  fontSize: '16px',
                  fontWeight: '600',
                },
              });

              // Create edge from source to match
              edgeArray.push({
                id: `${sourceId}-${matchId}`,
                source: sourceId,
                target: matchId,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#64748b', strokeWidth: 4 },
                markerEnd: { type: MarkerType.ArrowClosed, width: 24, height: 24, color: '#64748b' },
              });

              let workflowY = matchY;
              const uniqueWorkflows = [...new Set(matchData.map(item => item.workflow))];

              // Create workflow nodes
              uniqueWorkflows.forEach((workflowName, workflowIndex) => {
                const workflowId = `workflow_${workflowName}_${projectName}_${feedName}_${sourceName}_${matchName}`;
                const workflowData = matchData.filter(item => item.workflow === workflowName);
                const workflowAlerts = workflowData.reduce((sum, item) => sum + (item.alertCount || 1), 0);
                const isWorkflowExpanded = expandedWorkflows.has(workflowName);

                nodeMap.set(workflowId, {
                  id: workflowId,
                  type: 'default',
                  position: { x: 2100, y: workflowY },
                  data: {
                    label: workflowName,
                    count: workflowAlerts,
                    type: 'workflow',
                    details: `Workflow: ${workflowName}`,
                    workflowId: workflowName,
                    isExpanded: isWorkflowExpanded,
                    isClickable: true,
                    onClick: () => toggleWorkflow(workflowName),
                  },
                  sourcePosition: Position.Right,
                  targetPosition: Position.Left,
                  style: {
                    background: getNodeColor('workflow'),
                    color: 'white',
                    border: '3px solid rgba(255,255,255,0.2)',
                    borderRadius: '20px',
                    padding: '20px 28px',
                    minWidth: '240px',
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  },
                });

                // Create edge from match to workflow
                edgeArray.push({
                  id: `${matchId}-${workflowId}`,
                  source: matchId,
                  target: workflowId,
                  type: 'smoothstep',
                  animated: true,
                  style: { stroke: '#64748b', strokeWidth: 4 },
                  markerEnd: { type: MarkerType.ArrowClosed, width: 24, height: 24, color: '#64748b' },
                });

                if (isWorkflowExpanded) {
                  let stateY = workflowY;
                  const uniqueStates = [...new Set(workflowData.map(item => item.state))];

                  // Create state nodes
                  uniqueStates.forEach((stateName, stateIndex) => {
                    const stateId = `state_${stateName}_${workflowName}_${projectName}`;
                    const stateData = workflowData.filter(item => item.state === stateName);
                    const stateAlerts = stateData.reduce((sum, item) => sum + (item.alertCount || 1), 0);

                    nodeMap.set(stateId, {
                      id: stateId,
                      type: 'default',
                      position: { x: 2600, y: stateY },
                      data: {
                        label: stateName,
                        count: stateAlerts,
                        type: 'state',
                        details: `State: ${stateName}`,
                        workflowId: `${workflowName}_${stateName}`,
                        isClickable: false,
                      },
                      sourcePosition: Position.Right,
                      targetPosition: Position.Left,
                      style: {
                        background: getNodeColor('state'),
                        color: 'white',
                        border: '3px solid rgba(255,255,255,0.2)',
                        borderRadius: '20px',
                        padding: '20px 28px',
                        minWidth: '240px',
                        minHeight: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
                        fontSize: '16px',
                        fontWeight: '600',
                      },
                    });

                    // Create edge from workflow to state
                    edgeArray.push({
                      id: `${workflowId}-${stateId}`,
                      source: workflowId,
                      target: stateId,
                      type: 'smoothstep',
                      animated: true,
                      style: { stroke: '#64748b', strokeWidth: 4 },
                      markerEnd: { type: MarkerType.ArrowClosed, width: 24, height: 24, color: '#64748b' },
                    });

                    stateY += verticalSpacing / 2;
                  });
                }

                workflowY += verticalSpacing;
              });

              matchY += verticalSpacing;
            });

            sourceY += verticalSpacing;
          });

          feedY += verticalSpacing;
        });
      }

      currentY += verticalSpacing * 3;
    });

    const finalNodes = Array.from(nodeMap.values());
    console.log('🎯 Final result:', { nodes: finalNodes.length, edges: edgeArray.length });

    return {
      initialNodes: finalNodes,
      initialEdges: edgeArray,
    };
  }, [data, selectedProject, expandedProjects, expandedWorkflows, toggleProject, toggleWorkflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when initialNodes change
  React.useEffect(() => {
    console.log('🔄 Updating nodes due to expansion change');
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

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

  // Custom node component with better click handling
  const CustomNode = ({ data }: { data: any }) => {
    const handleClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      console.log('🖱️ CustomNode clicked:', data.label, 'Clickable:', data.isClickable);
      if (data.isClickable && data.onClick) {
        data.onClick();
      }
    }, [data]);

    return (
      <div 
        className={`flex flex-col items-center justify-center h-full w-full ${
          data.isClickable ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-default'
        }`}
        onClick={handleClick}
        style={{ transition: 'transform 0.2s ease' }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="font-bold text-xl text-center leading-tight">
            {data.label && data.label.length > 25 ? `${data.label.substring(0, 25)}...` : data.label}
          </div>
          {data.isClickable && (
            <div className="flex-shrink-0">
              {data.isExpanded ? (
                <ChevronDown className="w-6 h-6 opacity-90" />
              ) : (
                <ChevronRight className="w-6 h-6 opacity-90" />
              )}
            </div>
          )}
        </div>
        <div className="text-base opacity-90 font-medium">
          {data.count} alert{data.count !== 1 ? 's' : ''}
        </div>
        {data.isClickable && (
          <div className="text-sm opacity-70 mt-2">
            Click to {data.isExpanded ? 'collapse' : 'expand'}
          </div>
        )}
      </div>
    );
  };

  const nodeTypes = {
    default: CustomNode,
  };

  console.log('🖼️ FlowchartView render:', { 
    nodesCount: nodes.length, 
    edgesCount: edges.length,
    selectedProject,
    dataLength: data.length,
    expandedProjects: Array.from(expandedProjects),
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

      {/* React Flow Canvas with fixed dimensions */}
      <div className="relative" style={{ width: '100%', height: '800px' }}>
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
            style={{ width: '100%', height: '100%' }}
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
