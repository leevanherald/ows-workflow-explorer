
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkflowData } from '@/data/mockData';
import { Plus, Minus } from 'lucide-react';

interface FlowchartViewProps {
  data: WorkflowData[];
}

interface NetworkNode {
  id: string;
  label: string;
  type: 'project' | 'feed' | 'source' | 'match' | 'workflow' | 'state';
  count: number;
  x: number;
  y: number;
  connections: string[];
}

interface Connection {
  from: string;
  to: string;
  path: string;
}

const FlowchartView: React.FC<FlowchartViewProps> = ({ data }) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // Get unique projects for selection
  const projects = useMemo(() => {
    return [...new Set(data.map(item => item.directorProject))];
  }, [data]);

  // Build network data
  const { nodes, connections } = useMemo(() => {
    let filteredData = selectedProject === 'all' 
      ? data 
      : data.filter(item => item.directorProject === selectedProject);

    if (filteredData.length === 0) return { nodes: [], connections: [] };

    const nodeMap = new Map<string, NetworkNode>();
    const connectionSet = new Set<string>();

    // Create nodes for each level
    filteredData.forEach(item => {
      // Project node
      const projectId = `project-${item.directorProject}`;
      if (!nodeMap.has(projectId)) {
        nodeMap.set(projectId, {
          id: projectId,
          label: item.directorProject,
          type: 'project',
          count: 0,
          x: 0,
          y: 0,
          connections: []
        });
      }

      // Feed node
      const feedId = `feed-${item.directorProject}-${item.directorFeedname}`;
      if (!nodeMap.has(feedId)) {
        nodeMap.set(feedId, {
          id: feedId,
          label: item.directorFeedname || 'Unknown Feed',
          type: 'feed',
          count: 0,
          x: 0,
          y: 0,
          connections: []
        });
      }

      // Source node
      const sourceId = `source-${item.directorProject}-${item.directorFeedname}-${item.scmSource}`;
      if (!nodeMap.has(sourceId)) {
        nodeMap.set(sourceId, {
          id: sourceId,
          label: item.scmSource || 'Unknown Source',
          type: 'source',
          count: 0,
          x: 0,
          y: 0,
          connections: []
        });
      }

      // Match node
      const matchId = `match-${item.directorProject}-${item.directorFeedname}-${item.scmSource}-${item.matchProcess}`;
      if (!nodeMap.has(matchId)) {
        nodeMap.set(matchId, {
          id: matchId,
          label: item.matchProcess || 'Unknown Match',
          type: 'match',
          count: 0,
          x: 0,
          y: 0,
          connections: []
        });
      }

      // Workflow node
      const workflowId = `workflow-${item.directorProject}-${item.directorFeedname}-${item.scmSource}-${item.matchProcess}-${item.workflow}`;
      if (!nodeMap.has(workflowId)) {
        nodeMap.set(workflowId, {
          id: workflowId,
          label: item.workflow,
          type: 'workflow',
          count: 0,
          x: 0,
          y: 0,
          connections: []
        });
      }

      // State node
      const stateId = `state-${item.directorProject}-${item.directorFeedname}-${item.scmSource}-${item.matchProcess}-${item.workflow}-${item.state}`;
      if (!nodeMap.has(stateId)) {
        nodeMap.set(stateId, {
          id: stateId,
          label: item.state,
          type: 'state',
          count: 0,
          x: 0,
          y: 0,
          connections: []
        });
      }

      // Add alert counts
      nodeMap.get(projectId)!.count += item.alertCount || 0;
      nodeMap.get(feedId)!.count += item.alertCount || 0;
      nodeMap.get(sourceId)!.count += item.alertCount || 0;
      nodeMap.get(matchId)!.count += item.alertCount || 0;
      nodeMap.get(workflowId)!.count += item.alertCount || 0;
      nodeMap.get(stateId)!.count += item.alertCount || 0;

      // Create connections
      connectionSet.add(`${projectId}-${feedId}`);
      connectionSet.add(`${feedId}-${sourceId}`);
      connectionSet.add(`${sourceId}-${matchId}`);
      connectionSet.add(`${matchId}-${workflowId}`);
      connectionSet.add(`${workflowId}-${stateId}`);
    });

    const nodes = Array.from(nodeMap.values());
    
    // Position nodes
    const nodesByType = {
      project: nodes.filter(n => n.type === 'project'),
      feed: nodes.filter(n => n.type === 'feed'),
      source: nodes.filter(n => n.type === 'source'),
      match: nodes.filter(n => n.type === 'match'),
      workflow: nodes.filter(n => n.type === 'workflow'),
      state: nodes.filter(n => n.type === 'state')
    };

    // Position nodes in columns
    const columnWidth = dimensions.width / 6;
    const padding = 50;

    Object.entries(nodesByType).forEach(([type, typeNodes], colIndex) => {
      const x = padding + colIndex * columnWidth;
      const availableHeight = dimensions.height - 2 * padding;
      const nodeSpacing = typeNodes.length > 1 ? availableHeight / (typeNodes.length - 1) : 0;

      typeNodes.forEach((node, index) => {
        node.x = x;
        node.y = typeNodes.length === 1 
          ? dimensions.height / 2 
          : padding + index * nodeSpacing;
      });
    });

    // Create connection paths
    const connections: Connection[] = Array.from(connectionSet).map(connStr => {
      const [fromId, toId] = connStr.split('-').reduce((acc, part, index, arr) => {
        if (index < arr.length / 2) {
          acc[0] += (acc[0] ? '-' : '') + part;
        } else {
          acc[1] += (acc[1] ? '-' : '') + part;
        }
        return acc;
      }, ['', '']);

      const fromNode = nodeMap.get(fromId);
      const toNode = nodeMap.get(toId);

      if (!fromNode || !toNode) return null;

      // Create curved path
      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const controlPointOffset = Math.abs(dx) * 0.5;

      const path = `M ${fromNode.x + 60} ${fromNode.y} C ${fromNode.x + 60 + controlPointOffset} ${fromNode.y}, ${toNode.x - controlPointOffset} ${toNode.y}, ${toNode.x} ${toNode.y}`;

      return {
        from: fromId,
        to: toId,
        path
      };
    }).filter(Boolean) as Connection[];

    return { nodes, connections };
  }, [data, selectedProject, dimensions]);

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(1200, rect.width),
          height: Math.max(800, rect.height)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getNodeColor = (type: string) => {
    const colors = {
      project: '#475569', // slate-600
      feed: '#3b82f6',    // blue-500
      source: '#10b981',  // green-500
      match: '#f59e0b',   // orange-500
      workflow: '#ef4444', // red-500
      state: '#8b5cf6'    // purple-500
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-2">Network Workflow Flowchart</h3>
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-64 bg-slate-700 border-slate-600 text-white">
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

      {/* Main Flowchart */}
      <div className="flex-1 overflow-hidden relative">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="absolute inset-0"
        >
          {/* Connections */}
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
          
          {connections.map((conn, index) => (
            <path
              key={index}
              d={conn.path}
              stroke="#64748b"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
              opacity="0.7"
            />
          ))}

          {/* Nodes */}
          {nodes.map(node => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <rect
                x="-60"
                y="-20"
                width="120"
                height="40"
                rx="4"
                fill={getNodeColor(node.type)}
                stroke="#374151"
                strokeWidth="2"
              />
              <text
                x="0"
                y="-2"
                textAnchor="middle"
                className="fill-white text-sm font-medium"
                style={{ fontSize: '12px' }}
              >
                {node.label.length > 12 ? `${node.label.substring(0, 12)}...` : node.label}
              </text>
              <text
                x="0"
                y="12"
                textAnchor="middle"
                className="fill-white text-xs opacity-80"
                style={{ fontSize: '10px' }}
              >
                {node.count} alerts
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <h4 className="font-semibold text-white mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-600 rounded"></div>
            <span className="text-sm text-slate-300">Director Project</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-slate-300">Feed Names</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-slate-300">Sources</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm text-slate-300">Match Process</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-slate-300">Workflows</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-slate-300">End States</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowchartView;
