
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkflowData } from '@/data/mockData';
import { ChevronRight, ChevronDown, AlertCircle } from 'lucide-react';

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

  // Build flowchart data with improved positioning
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

    // Enhanced positioning with better spacing
    const levelCounts = new Map<number, number>();
    const levelWidth = 280;
    const nodeHeight = 140;
    const verticalSpacing = 160;
    const levelOffsets = new Map<number, number>();

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
            x: nodeData.level * levelWidth + 40,
            y: currentLevelCount * verticalSpacing + 60
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
      project: 'from-indigo-600 via-purple-600 to-blue-700',
      feed: 'from-pink-500 via-rose-500 to-red-600',
      source: 'from-cyan-500 via-blue-500 to-indigo-500',
      match: 'from-emerald-500 via-green-500 to-teal-600',
      workflow: 'from-amber-500 via-orange-500 to-red-500',
      state: 'from-violet-500 via-purple-500 to-indigo-600',
    };
    return colors[type as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getNodeAccentColor = (type: string): string => {
    const colors = {
      project: 'border-indigo-300 shadow-indigo-500/25',
      feed: 'border-pink-300 shadow-pink-500/25',
      source: 'border-cyan-300 shadow-cyan-500/25',
      match: 'border-emerald-300 shadow-emerald-500/25',
      workflow: 'border-amber-300 shadow-amber-500/25',
      state: 'border-violet-300 shadow-violet-500/25',
    };
    return colors[type as keyof typeof colors] || 'border-gray-300 shadow-gray-500/25';
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

  // Calculate container dimensions
  const maxX = visibleNodes.reduce((max, node) => Math.max(max, node.x + 240), 0);
  const maxY = visibleNodes.reduce((max, node) => Math.max(max, node.y + 120), 0);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="px-8 py-6 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Workflow Intelligence Dashboard
            </h3>
            <p className="text-slate-600 text-base font-medium">
              Interactive customer journey visualization with real-time insights
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-72 h-12 bg-white/80 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                <SelectValue placeholder="Select Project Scope" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl rounded-xl">
                <SelectItem value="all" className="text-slate-700 hover:bg-indigo-50 rounded-lg m-1">
                  🌐 All Projects
                </SelectItem>
                {projects.map(project => (
                  <SelectItem key={project} value={project} className="text-slate-700 hover:bg-indigo-50 rounded-lg m-1">
                    📁 {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-slate-500 bg-white/60 px-4 py-2 rounded-full border border-white/30">
              💡 Click nodes to explore workflow paths
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Flowchart Content */}
      <div className="flex-1 overflow-auto">
        {visibleNodes.length > 0 ? (
          <div 
            className="relative p-8 min-h-full"
            style={{ 
              width: Math.max(maxX + 80, 1200), 
              height: Math.max(maxY + 80, 600) 
            }}
          >
            {/* Enhanced SVG Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              <defs>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#64748b" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#1e40af" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <marker
                  id="arrowhead"
                  markerWidth="14"
                  markerHeight="10"
                  refX="13"
                  refY="5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon
                    points="0 0, 14 5, 0 10"
                    fill="url(#connectionGradient)"
                    stroke="none"
                    filter="url(#glow)"
                  />
                </marker>
              </defs>
              {visibleConnections.map((conn, index) => {
                const fromNode = visibleNodes.find(n => n.id === conn.from);
                const toNode = visibleNodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                const fromX = fromNode.x + 240;
                const fromY = fromNode.y + 60;
                const toX = toNode.x;
                const toY = toNode.y + 60;

                return (
                  <g key={`${conn.from}-${conn.to}-${index}`}>
                    <line
                      x1={fromX}
                      y1={fromY}
                      x2={toX}
                      y2={toY}
                      stroke="url(#connectionGradient)"
                      strokeWidth="4"
                      markerEnd="url(#arrowhead)"
                      className="transition-all duration-300 hover:stroke-width-6"
                      filter="url(#glow)"
                      opacity="0.8"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Enhanced Nodes */}
            {visibleNodes.map(node => {
              const hasChildren = flowchartData.connections.some(conn => conn.from === node.id);
              const isExpanded = expandedNodes.has(node.id);

              return (
                <div
                  key={node.id}
                  className={`absolute cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2 group ${hasChildren ? 'hover:shadow-2xl' : 'hover:shadow-xl'}`}
                  style={{ 
                    left: node.x, 
                    top: node.y,
                    zIndex: 10
                  }}
                  onClick={() => hasChildren && toggleNode(node.id)}
                >
                  <div className={`bg-gradient-to-br ${getNodeColor(node.type)} text-white rounded-2xl p-6 w-60 h-28 relative overflow-hidden border-2 ${getNodeAccentColor(node.type)} shadow-xl backdrop-blur-sm`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="flex items-start gap-3">
                        {hasChildren && (
                          <div className="flex-shrink-0 mt-1 p-1 rounded-full bg-white/20 transition-transform duration-200 group-hover:scale-110">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-base truncate mb-1 leading-tight">
                            {node.label}
                          </div>
                          <div className="text-xs opacity-90 capitalize font-medium tracking-wide">
                            {node.type.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                          <AlertCircle className="w-3 h-3" />
                          <span className="text-xs font-bold">{node.count}</span>
                        </div>
                        {hasChildren && (
                          <div className="text-xs opacity-75 bg-white/10 rounded-full px-2 py-1">
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-12 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30">
              <div className="text-6xl mb-4">📊</div>
              <div className="text-xl font-bold text-slate-700 mb-2">
                {data.length === 0 ? 'No workflow data available' : 'No data for selected project'}
              </div>
              <div className="text-slate-500">
                {data.length === 0 ? 'Import your workflow data to get started' : 'Try selecting "All Projects" or a different project'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Legend */}
      <div className="px-8 py-6 bg-white/70 backdrop-blur-xl border-t border-white/20">
        <h4 className="font-bold text-slate-800 mb-4 text-lg">Workflow Hierarchy Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { type: 'project', label: 'Director Projects', icon: '🏢' },
            { type: 'feed', label: 'Data Feeds', icon: '📡' },
            { type: 'source', label: 'Sources', icon: '🔗' },
            { type: 'match', label: 'Match Process', icon: '🎯' },
            { type: 'workflow', label: 'Workflows', icon: '⚡' },
            { type: 'state', label: 'End States', icon: '🏁' },
          ].map(({ type, label, icon }) => (
            <div key={type} className="flex items-center gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80 transition-all duration-200 hover:scale-105">
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${getNodeColor(type)} flex items-center justify-center text-white font-bold shadow-lg`}>
                <span className="text-xs">{icon}</span>
              </div>
              <span className="text-sm text-slate-700 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlowchartView;
