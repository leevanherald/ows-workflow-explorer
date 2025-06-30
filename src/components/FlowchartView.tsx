
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkflowData } from '@/data/mockData';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface FlowchartViewProps {
  data: WorkflowData[];
}

interface FlowNode {
  id: string;
  label: string;
  type: 'project' | 'feed' | 'source' | 'match' | 'workflow' | 'state';
  count: number;
  level: number;
  parentId?: string;
  expanded: boolean;
  x: number;
  y: number;
}

const FlowchartView: React.FC<FlowchartViewProps> = ({ data }) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Get unique projects for selection
  const projects = useMemo(() => {
    return [...new Set(data.map(item => item.directorProject))].filter(Boolean);
  }, [data]);

  // Build flowchart data
  const flowchartData = useMemo(() => {
    console.log('🔄 Building flowchart data...', { selectedProject, dataLength: data.length });
    
    let filteredData = selectedProject === 'all' 
      ? data 
      : data.filter(item => item.directorProject === selectedProject);

    if (filteredData.length === 0) {
      return { nodes: [], connections: [] };
    }

    const nodes: FlowNode[] = [];
    const connections: { from: string; to: string }[] = [];
    const nodeMap = new Map<string, FlowNode>();

    // Track positions
    const levelCounts = new Map<number, number>();
    const levelWidth = 300;
    const nodeHeight = 100;
    const verticalSpacing = 120;

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
            ...nodeData,
            count: 0,
            expanded: false,
            x: nodeData.level * levelWidth,
            y: currentLevelCount * verticalSpacing
          };

          nodeMap.set(nodeData.id, node);
          nodes.push(node);

          // Add connection to parent
          if (nodeData.parentId && index > 0) {
            connections.push({
              from: nodeData.parentId,
              to: nodeData.id
            });
          }
        }

        // Update count
        const node = nodeMap.get(nodeData.id)!;
        node.count += item.alertCount || 1;
      });
    });

    return { nodes, connections };
  }, [data, selectedProject]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getNodeColor = (type: string): string => {
    const colors = {
      project: 'bg-gradient-to-r from-purple-500 to-blue-600',
      feed: 'bg-gradient-to-r from-pink-500 to-red-500',
      source: 'bg-gradient-to-r from-blue-400 to-cyan-400',
      match: 'bg-gradient-to-r from-green-400 to-emerald-500',
      workflow: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      state: 'bg-gradient-to-r from-teal-400 to-blue-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const isNodeVisible = (node: FlowNode): boolean => {
    if (node.level === 0) return true;
    if (!node.parentId) return true;
    
    return expandedNodes.has(node.parentId) && isNodeVisible(flowchartData.nodes.find(n => n.id === node.parentId)!);
  };

  const visibleNodes = flowchartData.nodes.filter(isNodeVisible);
  const visibleConnections = flowchartData.connections.filter(conn => 
    visibleNodes.some(n => n.id === conn.from) && visibleNodes.some(n => n.id === conn.to)
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="p-6 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Interactive Network Workflow
        </h3>
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-64 bg-slate-700/50 border-slate-600 text-white backdrop-blur-sm z-50">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 z-50">
              <SelectItem value="all" className="text-white hover:bg-slate-600">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project} value={project} className="text-white hover:bg-slate-600">
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-slate-300">
            Click on nodes to expand the workflow
          </div>
        </div>
      </div>

      {/* Flowchart Content */}
      <div className="flex-1 overflow-auto p-6">
        {visibleNodes.length > 0 ? (
          <div className="relative" style={{ width: '2000px', height: '1000px' }}>
            {/* Connections */}
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              {visibleConnections.map((conn, index) => {
                const fromNode = visibleNodes.find(n => n.id === conn.from);
                const toNode = visibleNodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                const fromX = fromNode.x + 200; // Node width
                const fromY = fromNode.y + 50; // Half node height
                const toX = toNode.x;
                const toY = toNode.y + 50;

                return (
                  <line
                    key={`${conn.from}-${conn.to}-${index}`}
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke="#64748b"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#64748b"
                  />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {visibleNodes.map(node => {
              const hasChildren = flowchartData.connections.some(conn => conn.from === node.id);
              const isExpanded = expandedNodes.has(node.id);

              return (
                <div
                  key={node.id}
                  className={`absolute cursor-pointer transition-all duration-200 hover:shadow-lg ${getNodeColor(node.type)} text-white rounded-lg p-4 w-48 h-24`}
                  style={{ 
                    left: node.x, 
                    top: node.y,
                    zIndex: 2
                  }}
                  onClick={() => hasChildren && toggleNode(node.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {hasChildren && (
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    )}
                    <div className="font-semibold text-sm truncate flex-1">
                      {node.label}
                    </div>
                  </div>
                  <div className="text-xs opacity-90">
                    {node.count} alerts
                  </div>
                  <div className="text-xs opacity-75 capitalize mt-1">
                    {node.type}
                  </div>
                </div>
              );
            })}
          </div>
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
            { type: 'project', label: 'Director Projects' },
            { type: 'feed', label: 'Feed Names' },
            { type: 'source', label: 'Sources' },
            { type: 'match', label: 'Match Process' },
            { type: 'workflow', label: 'Workflows' },
            { type: 'state', label: 'End States' },
          ].map(({ type, label }) => (
            <div key={type} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 backdrop-blur-sm">
              <div className={`w-4 h-4 rounded ${getNodeColor(type)}`}></div>
              <span className="text-sm text-slate-300 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlowchartView;
