
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkflowData } from '@/data/mockData';
import { ArrowRight, ArrowDown } from 'lucide-react';

interface FlowchartViewProps {
  data: WorkflowData[];
}

interface FlowNode {
  id: string;
  label: string;
  type: 'project' | 'workflow' | 'feed' | 'source' | 'match' | 'state';
  count: number;
  children?: FlowNode[];
}

const FlowchartView: React.FC<FlowchartViewProps> = ({ data }) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Get unique projects for selection
  const projects = useMemo(() => {
    return [...new Set(data.map(item => item.directorProject))];
  }, [data]);

  // Build hierarchical flow data for selected project
  const flowData = useMemo(() => {
    const filteredData = selectedProject === 'all' 
      ? data 
      : data.filter(item => item.directorProject === selectedProject);

    if (filteredData.length === 0) return null;

    // Group by workflow
    const workflowGroups = filteredData.reduce((acc, item) => {
      if (!acc[item.workflow]) {
        acc[item.workflow] = [];
      }
      acc[item.workflow].push(item);
      return acc;
    }, {} as Record<string, WorkflowData[]>);

    // Build flow nodes for each workflow
    const workflowNodes: FlowNode[] = Object.entries(workflowGroups).map(([workflow, items]) => {
      // Group by feed
      const feedGroups = items.reduce((acc, item) => {
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
          // Group by match process
          const matchGroups = sourceItems.reduce((acc, item) => {
            const matchProcess = item.matchProcess || 'Unknown Process';
            if (!acc[matchProcess]) {
              acc[matchProcess] = [];
            }
            acc[matchProcess].push(item);
            return acc;
          }, {} as Record<string, WorkflowData[]>);

          const matchNodes: FlowNode[] = Object.entries(matchGroups).map(([matchProcess, matchItems]) => {
            // Group by final state
            const stateGroups = matchItems.reduce((acc, item) => {
              if (!acc[item.state]) {
                acc[item.state] = [];
              }
              acc[item.state].push(item);
              return acc;
            }, {} as Record<string, WorkflowData[]>);

            const stateNodes: FlowNode[] = Object.entries(stateGroups).map(([state, stateItems]) => ({
              id: `${workflow}-${feedName}-${source}-${matchProcess}-${state}`,
              label: state,
              type: 'state' as const,
              count: stateItems.reduce((sum, item) => sum + (item.alertCount || 0), 0)
            }));

            return {
              id: `${workflow}-${feedName}-${source}-${matchProcess}`,
              label: matchProcess,
              type: 'match' as const,
              count: matchItems.reduce((sum, item) => sum + (item.alertCount || 0), 0),
              children: stateNodes
            };
          });

          return {
            id: `${workflow}-${feedName}-${source}`,
            label: source,
            type: 'source' as const,
            count: sourceItems.reduce((sum, item) => sum + (item.alertCount || 0), 0),
            children: matchNodes
          };
        });

        return {
          id: `${workflow}-${feedName}`,
          label: feedName,
          type: 'feed' as const,
          count: feedItems.reduce((sum, item) => sum + (item.alertCount || 0), 0),
          children: sourceNodes
        };
      });

      return {
        id: workflow,
        label: workflow,
        type: 'workflow' as const,
        count: items.reduce((sum, item) => sum + (item.alertCount || 0), 0),
        children: feedNodes
      };
    });

    return workflowNodes;
  }, [data, selectedProject]);

  const getNodeColor = (type: string) => {
    const colors = {
      workflow: 'bg-blue-500',
      feed: 'bg-green-500',
      source: 'bg-purple-500',
      match: 'bg-orange-500',
      state: 'bg-red-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const renderFlowNode = (node: FlowNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.id} className="flex flex-col items-center">
        <div className={`${getNodeColor(node.type)} text-white px-4 py-2 rounded-lg shadow-md min-w-[120px] text-center`}>
          <div className="font-medium text-sm">{node.label}</div>
          <div className="text-xs opacity-90">{node.count.toLocaleString()}</div>
        </div>
        
        {hasChildren && (
          <>
            <ArrowDown className="w-4 h-4 text-gray-600 my-2" />
            <div className="flex flex-wrap gap-8 justify-center">
              {node.children!.map(child => renderFlowNode(child, level + 1))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Workflow Flowchart</h3>
        <p className="text-sm text-slate-600 mb-4">
          Select a project to view its complete workflow from feeds to final states.
        </p>
        
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
      </div>

      <Card className="p-6 min-h-[400px]">
        {flowData && flowData.length > 0 ? (
          <div className="space-y-8">
            {selectedProject !== 'all' && (
              <div className="text-center">
                <div className="bg-slate-800 text-white px-6 py-3 rounded-lg inline-block font-semibold text-lg">
                  {selectedProject}
                </div>
                <ArrowDown className="w-6 h-6 text-gray-600 mx-auto my-4" />
              </div>
            )}
            
            <div className="space-y-12">
              {flowData.map(workflowNode => (
                <div key={workflowNode.id} className="border-l-4 border-blue-500 pl-6">
                  {renderFlowNode(workflowNode)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">No workflow data available</p>
              <p className="text-sm">Select a project to view its workflow</p>
            </div>
          </div>
        )}
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-semibold text-slate-900 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">Workflow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">Feed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm">Source</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm">Match Process</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm">End State</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FlowchartView;
