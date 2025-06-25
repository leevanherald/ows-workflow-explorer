
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkflowData } from '@/data/mockData';
import { ArrowRight } from 'lucide-react';

interface FlowchartViewProps {
  data: WorkflowData[];
}

interface FlowNode {
  id: string;
  label: string;
  type: 'project' | 'feed' | 'source' | 'match' | 'workflow' | 'state';
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

    // Group by Director Feed Name
    const feedGroups = filteredData.reduce((acc, item) => {
      const feedName = item.directorFeedname || 'Unknown Feed';
      if (!acc[feedName]) {
        acc[feedName] = [];
      }
      acc[feedName].push(item);
      return acc;
    }, {} as Record<string, WorkflowData[]>);

    // Build flow nodes for each feed
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
          // Group by workflow
          const workflowGroups = matchItems.reduce((acc, item) => {
            if (!acc[item.workflow]) {
              acc[item.workflow] = [];
            }
            acc[item.workflow].push(item);
            return acc;
          }, {} as Record<string, WorkflowData[]>);

          const workflowNodes: FlowNode[] = Object.entries(workflowGroups).map(([workflow, workflowItems]) => {
            // Group by final state
            const stateGroups = workflowItems.reduce((acc, item) => {
              if (!acc[item.state]) {
                acc[item.state] = [];
              }
              acc[item.state].push(item);
              return acc;
            }, {} as Record<string, WorkflowData[]>);

            const stateNodes: FlowNode[] = Object.entries(stateGroups).map(([state, stateItems]) => ({
              id: `${feedName}-${source}-${matchProcess}-${workflow}-${state}`,
              label: state,
              type: 'state' as const,
              count: stateItems.reduce((sum, item) => sum + (item.alertCount || 0), 0)
            }));

            return {
              id: `${feedName}-${source}-${matchProcess}-${workflow}`,
              label: workflow,
              type: 'workflow' as const,
              count: workflowItems.reduce((sum, item) => sum + (item.alertCount || 0), 0),
              children: stateNodes
            };
          });

          return {
            id: `${feedName}-${source}-${matchProcess}`,
            label: matchProcess,
            type: 'match' as const,
            count: matchItems.reduce((sum, item) => sum + (item.alertCount || 0), 0),
            children: workflowNodes
          };
        });

        return {
          id: `${feedName}-${source}`,
          label: source,
          type: 'source' as const,
          count: sourceItems.reduce((sum, item) => sum + (item.alertCount || 0), 0),
          children: matchNodes
        };
      });

      return {
        id: feedName,
        label: feedName,
        type: 'feed' as const,
        count: feedItems.reduce((sum, item) => sum + (item.alertCount || 0), 0),
        children: sourceNodes
      };
    });

    return feedNodes;
  }, [data, selectedProject]);

  const getNodeColor = (type: string) => {
    const colors = {
      feed: 'bg-blue-500',
      source: 'bg-green-500',
      match: 'bg-purple-500',
      workflow: 'bg-orange-500',
      state: 'bg-red-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const renderColumn = (nodes: FlowNode[], title: string, type: string) => {
    return (
      <div className="flex flex-col items-center min-w-[200px]">
        <h4 className="font-semibold text-slate-700 mb-4 text-center">{title}</h4>
        <div className="space-y-3">
          {nodes.map(node => (
            <div key={node.id} className={`${getNodeColor(type)} text-white px-4 py-3 rounded-lg shadow-md text-center min-w-[150px]`}>
              <div className="font-medium text-sm">{node.label}</div>
              <div className="text-xs opacity-90">{node.count.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHorizontalFlow = () => {
    if (!flowData || flowData.length === 0) return null;

    // Collect all unique nodes at each level
    const allSources = new Set<string>();
    const allMatches = new Set<string>();
    const allWorkflows = new Set<string>();
    const allStates = new Set<string>();

    flowData.forEach(feed => {
      feed.children?.forEach(source => {
        allSources.add(source.label);
        source.children?.forEach(match => {
          allMatches.add(match.label);
          match.children?.forEach(workflow => {
            allWorkflows.add(workflow.label);
            workflow.children?.forEach(state => {
              allStates.add(state.label);
            });
          });
        });
      });
    });

    return (
      <div className="flex items-center justify-center space-x-8 overflow-x-auto pb-4">
        {renderColumn(flowData, 'Feed Names', 'feed')}
        
        <ArrowRight className="w-8 h-8 text-gray-400 flex-shrink-0" />
        
        {renderColumn(
          Array.from(allSources).map(source => ({
            id: source,
            label: source,
            type: 'source' as const,
            count: data.filter(item => item.scmSource === source).reduce((sum, item) => sum + (item.alertCount || 0), 0)
          })),
          'Sources',
          'source'
        )}
        
        <ArrowRight className="w-8 h-8 text-gray-400 flex-shrink-0" />
        
        {renderColumn(
          Array.from(allMatches).map(match => ({
            id: match,
            label: match,
            type: 'match' as const,
            count: data.filter(item => item.matchProcess === match).reduce((sum, item) => sum + (item.alertCount || 0), 0)
          })),
          'Match Process',
          'match'
        )}
        
        <ArrowRight className="w-8 h-8 text-gray-400 flex-shrink-0" />
        
        {renderColumn(
          Array.from(allWorkflows).map(workflow => ({
            id: workflow,
            label: workflow,
            type: 'workflow' as const,
            count: data.filter(item => item.workflow === workflow).reduce((sum, item) => sum + (item.alertCount || 0), 0)
          })),
          'Workflows',
          'workflow'
        )}
        
        <ArrowRight className="w-8 h-8 text-gray-400 flex-shrink-0" />
        
        {renderColumn(
          Array.from(allStates).map(state => ({
            id: state,
            label: state,
            type: 'state' as const,
            count: data.filter(item => item.state === state).reduce((sum, item) => sum + (item.alertCount || 0), 0)
          })),
          'End States',
          'state'
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
        {selectedProject !== 'all' && (
          <div className="text-center mb-6">
            <div className="bg-slate-800 text-white px-6 py-3 rounded-lg inline-block font-semibold text-lg">
              {selectedProject}
            </div>
          </div>
        )}
        
        {flowData && flowData.length > 0 ? (
          renderHorizontalFlow()
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
            <span className="text-sm">Feed Names</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">Sources</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm">Match Process</span>
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
      </Card>
    </div>
  );
};

export default FlowchartView;
