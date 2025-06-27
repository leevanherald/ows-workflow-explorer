
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkflowData } from '@/data/mockData';

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
  level: number;
}

interface Connection {
  from: string;
  to: string;
  path: string;
}

const FlowchartView: React.FC<FlowchartViewProps> = ({ data }) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1400, height: 900 });

  // Get unique projects for selection
  const projects = useMemo(() => {
    return [...new Set(data.map(item => item.directorProject))];
  }, [data]);

  // Build network data based on actual relationships
  const { nodes, connections } = useMemo(() => {
    let filteredData = selectedProject === 'all' 
      ? data 
      : data.filter(item => item.directorProject === selectedProject);

    if (filteredData.length === 0) return { nodes: [], connections: [] };

    const nodeMap = new Map<string, NetworkNode>();
    const connectionSet = new Set<string>();
    
    // Track relationships for proper positioning
    const relationships = {
      projectFeeds: new Map<string, Set<string>>(),
      feedSources: new Map<string, Set<string>>(),
      sourceMatches: new Map<string, Set<string>>(),
      matchWorkflows: new Map<string, Set<string>>(),
      workflowStates: new Map<string, Set<string>>()
    };

    // First pass: create nodes and track relationships
    filteredData.forEach(item => {
      const projectId = `project-${item.directorProject}`;
      const feedId = `feed-${item.directorFeedname}`;
      const sourceId = `source-${item.scmSource}`;
      const matchId = `match-${item.matchProcess}`;
      const workflowId = `workflow-${item.workflow}`;
      const stateId = `state-${item.state}`;

      // Create nodes if they don't exist
      if (!nodeMap.has(projectId)) {
        nodeMap.set(projectId, {
          id: projectId,
          label: item.directorProject,
          type: 'project',
          count: 0,
          x: 0,
          y: 0,
          level: 0
        });
      }

      if (!nodeMap.has(feedId)) {
        nodeMap.set(feedId, {
          id: feedId,
          label: item.directorFeedname || 'Unknown Feed',
          type: 'feed',
          count: 0,
          x: 0,
          y: 0,
          level: 1
        });
      }

      if (!nodeMap.has(sourceId)) {
        nodeMap.set(sourceId, {
          id: sourceId,
          label: item.scmSource || 'Unknown Source',
          type: 'source',
          count: 0,
          x: 0,
          y: 0,
          level: 2
        });
      }

      if (!nodeMap.has(matchId)) {
        nodeMap.set(matchId, {
          id: matchId,
          label: item.matchProcess || 'Unknown Match',
          type: 'match',
          count: 0,
          x: 0,
          y: 0,
          level: 3
        });
      }

      if (!nodeMap.has(workflowId)) {
        nodeMap.set(workflowId, {
          id: workflowId,
          label: item.workflow,
          type: 'workflow',
          count: 0,
          x: 0,
          y: 0,
          level: 4
        });
      }

      if (!nodeMap.has(stateId)) {
        nodeMap.set(stateId, {
          id: stateId,
          label: item.state,
          type: 'state',
          count: 0,
          x: 0,
          y: 0,
          level: 5
        });
      }

      // Track relationships
      if (!relationships.projectFeeds.has(projectId)) {
        relationships.projectFeeds.set(projectId, new Set());
      }
      relationships.projectFeeds.get(projectId)!.add(feedId);

      if (!relationships.feedSources.has(feedId)) {
        relationships.feedSources.set(feedId, new Set());
      }
      relationships.feedSources.get(feedId)!.add(sourceId);

      if (!relationships.sourceMatches.has(sourceId)) {
        relationships.sourceMatches.set(sourceId, new Set());
      }
      relationships.sourceMatches.get(sourceId)!.add(matchId);

      if (!relationships.matchWorkflows.has(matchId)) {
        relationships.matchWorkflows.set(matchId, new Set());
      }
      relationships.matchWorkflows.get(matchId)!.add(workflowId);

      if (!relationships.workflowStates.has(workflowId)) {
        relationships.workflowStates.set(workflowId, new Set());
      }
      relationships.workflowStates.get(workflowId)!.add(stateId);

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
    
    // Position nodes using a force-directed approach
    const levelWidth = dimensions.width / 6;
    const padding = 100;

    // Group nodes by level
    const nodesByLevel = new Map<number, NetworkNode[]>();
    for (let i = 0; i <= 5; i++) {
      nodesByLevel.set(i, nodes.filter(n => n.level === i));
    }

    // Position nodes level by level
    nodesByLevel.forEach((levelNodes, level) => {
      const x = padding + level * levelWidth;
      const availableHeight = dimensions.height - 2 * padding;
      
      if (levelNodes.length === 1) {
        levelNodes[0].x = x;
        levelNodes[0].y = dimensions.height / 2;
      } else {
        levelNodes.forEach((node, index) => {
          node.x = x;
          node.y = padding + (index * availableHeight) / (levelNodes.length - 1);
        });
      }
    });

    // Create connection paths
    const connections: Connection[] = Array.from(connectionSet).map(connStr => {
      const [fromId, toId] = connStr.split('-').reduce((acc, part, index, arr) => {
        const midPoint = Math.floor(arr.length / 2);
        if (index < midPoint) {
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
      const controlPointOffset = Math.abs(dx) * 0.4;

      const path = `M ${fromNode.x + 80} ${fromNode.y} C ${fromNode.x + 80 + controlPointOffset} ${fromNode.y}, ${toNode.x - controlPointOffset} ${toNode.y}, ${toNode.x - 80} ${toNode.y}`;

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
        const container = svgRef.current.parentElement;
        if (container) {
          setDimensions({
            width: Math.max(1400, container.clientWidth),
            height: Math.max(900, container.clientHeight)
          });
        }
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
      <div className="flex-1 overflow-auto relative">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="min-w-full min-h-full"
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
                x="-80"
                y="-25"
                width="160"
                height="50"
                rx="8"
                fill={getNodeColor(node.type)}
                stroke="#374151"
                strokeWidth="2"
                className="drop-shadow-lg"
              />
              <text
                x="0"
                y="-5"
                textAnchor="middle"
                className="fill-white text-sm font-medium"
                style={{ fontSize: '13px' }}
              >
                {node.label.length > 18 ? `${node.label.substring(0, 18)}...` : node.label}
              </text>
              <text
                x="0"
                y="12"
                textAnchor="middle"
                className="fill-white text-xs opacity-80"
                style={{ fontSize: '11px' }}
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
