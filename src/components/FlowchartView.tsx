
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkflowData } from '@/data/mockData';
import { ArrowRight, ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react';

interface FlowchartViewProps {
  data: WorkflowData[];
}

interface FlowNode {
  id: string;
  label: string;
  type: 'project' | 'feed' | 'source' | 'match' | 'workflow' | 'state';
  count: number;
  children?: FlowNode[];
  expanded?: boolean;
}

const FlowchartView: React.FC<FlowchartViewProps> = ({ data }) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Get unique projects for selection
  const projects = useMemo(() => {
    return [...new Set(data.map(item => item.directorProject))];
  }, [data]);

  // Build hierarchical flow data
  const flowData = useMemo(() => {
    let filteredData = selectedProject === 'all' 
      ? data 
      : data.filter(item => item.directorProject === selectedProject);

    if (filteredData.length === 0) return [];

    // Group by Director Project
    const projectGroups = filteredData.reduce((acc, item) => {
      if (!acc[item.directorProject]) {
        acc[item.directorProject] = [];
      }
      acc[item.directorProject].push(item);
      return acc;
    }, {} as Record<string, WorkflowData[]>);

    return Object.entries(projectGroups).map(([projectName, projectItems]) => {
      // Group by Director Feed Name
      const feedGroups = projectItems.reduce((acc, item) => {
        const feedName = item.directorFeedname || 'Unknown Feed';
        if (!acc[feedName]) {
          acc[feedName] = [];
        }
        acc[feedName].push(item);
        return acc;
      }, {} as Record<string, WorkflowData[]>);

      const feedNodes: FlowNode[] = Object.entries(feedGroups).map(([feedName, feedItems]) => {
        // Group by source
        const sourceGroups = feedItems.reduce((acc, item) => {
          const source = item.scmSource || 'Unknown Source';
          if (!acc[source]) {
            acc[source] = [];
          }
          acc[source].push(item);
          return acc;
        }, {} as Record<string, WorkflowData[]>);

        const sourceNodes: FlowNode[] = Object.entries(sourceGroups).map(([source, sourceItems]) => {
          // Group by match process (1:1 with source)
          const matchProcess = sourceItems[0]?.matchProcess || 'Unknown Process';
          
          // Group by workflow (1:1 with source/match)
          const workflowGroups = sourceItems.reduce((acc, item) => {
            if (!acc[item.workflow]) {
              acc[item.workflow] = [];
            }
            acc[item.workflow].push(item);
            return acc;
          }, {} as Record<string, WorkflowData[]>);

          const workflowNodes: FlowNode[] = Object.entries(workflowGroups).map(([workflow, workflowItems]) => {
            // Group by final state (1:many with workflow)
            const stateGroups = workflowItems.reduce((acc, item) => {
              if (!acc[item.state]) {
                acc[item.state] = [];
              }
              acc[item.state].push(item);
              return acc;
            }, {} as Record<string, WorkflowData[]>);

            const stateNodes: FlowNode[] = Object.entries(stateGroups).map(([state, stateItems]) => ({
              id: `${projectName}-${feedName}-${source}-${matchProcess}-${workflow}-${state}`,
              label: state,
              type: 'state' as const,
              count: stateItems.reduce((sum, item) => sum + (item.alertCount || 0), 0)
            }));

            return {
              id: `${projectName}-${feedName}-${source}-${matchProcess}-${workflow}`,
              label: workflow,
              type: 'workflow' as const,
              count: workflowItems.reduce((sum, item) => sum + (item.alertCount || 0), 0),
              children: stateNodes
            };
          });

          return {
            id: `${projectName}-${feedName}-${source}`,
            label: `${source} → ${matchProcess}`,
            type: 'source' as const,
            count: sourceItems.reduce((sum, item) => sum + (item.alertCount || 0), 0),
            children: workflowNodes
          };
        });

        return {
          id: `${projectName}-${feedName}`,
          label: feedName,
          type: 'feed' as const,
          count: feedItems.reduce((sum, item) => sum + (item.alertCount || 0), 0),
          children: sourceNodes
        };
      });

      return {
        id: projectName,
        label: projectName,
        type: 'project' as const,
        count: projectItems.reduce((sum, item) => sum + (item.alertCount || 0), 0),
        children: feedNodes
      };
    });
  }, [data, selectedProject]);

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allNodeIds = new Set<string>();
    const collectIds = (nodes: FlowNode[]) => {
      nodes.forEach(node => {
        allNodeIds.add(node.id);
        if (node.children) {
          collectIds(node.children);
        }
      });
    };
    collectIds(flowData);
    setExpandedNodes(allNodeIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const getNodeColor = (type: string) => {
    const colors = {
      project: 'bg-slate-600 hover:bg-slate-700 border-slate-200',
      feed: 'bg-blue-500 hover:bg-blue-600 border-blue-200',
      source: 'bg-green-500 hover:bg-green-600 border-green-200',
      workflow: 'bg-orange-500 hover:bg-orange-600 border-orange-200',
      state: 'bg-red-500 hover:bg-red-600 border-red-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500 hover:bg-gray-600 border-gray-200';
  };

  const renderNode = (node: FlowNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const marginLeft = level * 40;

    return (
      <div key={node.id} className="mb-2">
        <div 
          className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${getNodeColor(node.type)} text-white shadow-sm`}
          style={{ marginLeft: `${marginLeft}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(node.id)}
              className="p-0 h-6 w-6 text-white hover:bg-white/20"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          )}
          
          <div className="flex-1">
            <div className="font-semibold text-sm">{node.label}</div>
            <div className="text-xs opacity-90">{node.count.toLocaleString()} alerts</div>
          </div>

          {level < 4 && hasChildren && (
            <ArrowRight className="w-4 h-4 opacity-60" />
          )}
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-2">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Interactive Workflow Flowchart</h3>
        <p className="text-sm text-slate-600 mb-4">
          Explore the complete workflow hierarchy with expandable sections.
        </p>
        
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project} value={project}>{project}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="flex items-center gap-2"
            >
              <Minus className="w-4 h-4" />
              Collapse All
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {flowData.length > 0 ? (
          <div className="space-y-2">
            {flowData.map(node => renderNode(node))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg mb-2">No workflow data available</p>
            <p className="text-sm">Select a project to view workflow data</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-white rounded-lg border">
        <h4 className="font-semibold text-slate-900 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-600 rounded"></div>
            <span className="text-sm">Director Project</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">Feed Names</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">Source → Match Process</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm">Workflows</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm">End States</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowchartView;
