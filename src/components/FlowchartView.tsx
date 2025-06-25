
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkflowData } from '@/data/mockData';
import { ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';

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

type ViewStage = 'feeds' | 'sources' | 'matches' | 'workflows' | 'states';

const FlowchartView: React.FC<FlowchartViewProps> = ({ data }) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [currentStage, setCurrentStage] = useState<ViewStage>('feeds');
  const [selectedFeed, setSelectedFeed] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');

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
      feed: 'bg-blue-500 hover:bg-blue-600',
      source: 'bg-green-500 hover:bg-green-600',
      match: 'bg-purple-500 hover:bg-purple-600',
      workflow: 'bg-orange-500 hover:bg-orange-600',
      state: 'bg-red-500 hover:bg-red-600'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500 hover:bg-gray-600';
  };

  const getCurrentStageData = () => {
    if (!flowData) return [];

    switch (currentStage) {
      case 'feeds':
        return flowData;
      case 'sources':
        if (!selectedFeed) return [];
        const feedNode = flowData.find(f => f.label === selectedFeed);
        return feedNode?.children || [];
      case 'matches':
        if (!selectedFeed || !selectedSource) return [];
        const feedForMatch = flowData.find(f => f.label === selectedFeed);
        const sourceNode = feedForMatch?.children?.find(s => s.label === selectedSource);
        return sourceNode?.children || [];
      case 'workflows':
        if (!selectedFeed || !selectedSource || !selectedMatch) return [];
        const feedForWorkflow = flowData.find(f => f.label === selectedFeed);
        const sourceForWorkflow = feedForWorkflow?.children?.find(s => s.label === selectedSource);
        const matchNode = sourceForWorkflow?.children?.find(m => m.label === selectedMatch);
        return matchNode?.children || [];
      case 'states':
        if (!selectedFeed || !selectedSource || !selectedMatch || !selectedWorkflow) return [];
        const feedForState = flowData.find(f => f.label === selectedFeed);
        const sourceForState = feedForState?.children?.find(s => s.label === selectedSource);
        const matchForState = sourceForState?.children?.find(m => m.label === selectedMatch);
        const workflowNode = matchForState?.children?.find(w => w.label === selectedWorkflow);
        return workflowNode?.children || [];
      default:
        return [];
    }
  };

  const handleNodeClick = (node: FlowNode) => {
    switch (currentStage) {
      case 'feeds':
        setSelectedFeed(node.label);
        setCurrentStage('sources');
        break;
      case 'sources':
        setSelectedSource(node.label);
        setCurrentStage('matches');
        break;
      case 'matches':
        setSelectedMatch(node.label);
        setCurrentStage('workflows');
        break;
      case 'workflows':
        setSelectedWorkflow(node.label);
        setCurrentStage('states');
        break;
    }
  };

  const getBreadcrumb = () => {
    const crumbs = [];
    if (selectedProject !== 'all') crumbs.push(selectedProject);
    if (selectedFeed) crumbs.push(selectedFeed);
    if (selectedSource) crumbs.push(selectedSource);
    if (selectedMatch) crumbs.push(selectedMatch);
    if (selectedWorkflow) crumbs.push(selectedWorkflow);
    return crumbs;
  };

  const resetToStage = (stage: ViewStage) => {
    setCurrentStage(stage);
    if (stage === 'feeds') {
      setSelectedFeed('');
      setSelectedSource('');
      setSelectedMatch('');
      setSelectedWorkflow('');
    } else if (stage === 'sources') {
      setSelectedSource('');
      setSelectedMatch('');
      setSelectedWorkflow('');
    } else if (stage === 'matches') {
      setSelectedMatch('');
      setSelectedWorkflow('');
    } else if (stage === 'workflows') {
      setSelectedWorkflow('');
    }
  };

  const getStageTitle = () => {
    const titles = {
      feeds: 'Feed Names',
      sources: 'Sources',
      matches: 'Match Processes',
      workflows: 'Workflows',
      states: 'End States'
    };
    return titles[currentStage];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Workflow Flowchart</h3>
        <p className="text-sm text-slate-600 mb-4">
          Navigate through the workflow stages to explore the complete data flow.
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

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 mb-6 p-4 bg-slate-100 rounded-lg">
        <Button
          variant={currentStage === 'feeds' ? 'default' : 'outline'}
          size="sm"
          onClick={() => resetToStage('feeds')}
        >
          Feeds
        </Button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <Button
          variant={currentStage === 'sources' ? 'default' : 'outline'}
          size="sm"
          onClick={() => resetToStage('sources')}
          disabled={!selectedFeed}
        >
          Sources
        </Button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <Button
          variant={currentStage === 'matches' ? 'default' : 'outline'}
          size="sm"
          onClick={() => resetToStage('matches')}
          disabled={!selectedSource}
        >
          Matches
        </Button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <Button
          variant={currentStage === 'workflows' ? 'default' : 'outline'}
          size="sm"
          onClick={() => resetToStage('workflows')}
          disabled={!selectedMatch}
        >
          Workflows
        </Button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <Button
          variant={currentStage === 'states' ? 'default' : 'outline'}
          size="sm"
          onClick={() => resetToStage('states')}
          disabled={!selectedWorkflow}
        >
          States
        </Button>
      </div>

      {/* Breadcrumb */}
      {getBreadcrumb().length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
          <span>Path:</span>
          {getBreadcrumb().map((crumb, index) => (
            <React.Fragment key={index}>
              <span className="font-medium">{crumb}</span>
              {index < getBreadcrumb().length - 1 && <ChevronRight className="w-3 h-3" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <h4 className="text-xl font-semibold text-slate-900 mb-4 text-center">
          {getStageTitle()}
        </h4>
        
        <div className="flex-1 flex items-center justify-center">
          {getCurrentStageData().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-6xl">
              {getCurrentStageData().map(node => (
                <div
                  key={node.id}
                  className={`${getNodeColor(node.type)} text-white p-6 rounded-lg shadow-lg cursor-pointer transition-all duration-200 transform hover:scale-105`}
                  onClick={() => handleNodeClick(node)}
                >
                  <div className="text-center">
                    <div className="font-semibold text-lg mb-2">{node.label}</div>
                    <div className="text-sm opacity-90">{node.count.toLocaleString()} alerts</div>
                    {currentStage !== 'states' && (
                      <div className="mt-2 text-xs opacity-75">Click to expand</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">No data available</p>
              <p className="text-sm">
                {currentStage === 'feeds' 
                  ? 'Select a project to view workflow data'
                  : 'Navigate back to select items from previous stages'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-white rounded-lg border">
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
      </div>
    </div>
  );
};

export default FlowchartView;
