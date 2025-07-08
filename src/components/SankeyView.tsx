
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkflowData } from '@/data/mockData';

interface SankeyViewProps {
  data: WorkflowData[];
}

interface SelectedFilters {
  project: string[];
  scmFeed: string[];
  matchProcess: string[];
  scmSource: string[];
  workflow: string[];
  state: string[];
}

const SankeyView: React.FC<SankeyViewProps> = ({ data }) => {
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    project: [],
    scmFeed: [],
    matchProcess: [],
    scmSource: [],
    workflow: [],
    state: []
  });

  const handleNodeClick = (nodeValue: string, nodeType: keyof SelectedFilters) => {
    setSelectedFilters(prev => {
      const currentSelections = prev[nodeType];
      const isSelected = currentSelections.includes(nodeValue);
      
      return {
        ...prev,
        [nodeType]: isSelected 
          ? currentSelections.filter(item => item !== nodeValue)
          : [...currentSelections, nodeValue]
      };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      project: [],
      scmFeed: [],
      matchProcess: [],
      scmSource: [],
      workflow: [],
      state: []
    });
  };

  const hasActiveFilters = () => {
    return Object.values(selectedFilters).some(filters => filters.length > 0);
  };

  const getFilteredData = () => {
    if (!hasActiveFilters()) return data;

    return data.filter(item => {
      const matchesProject = selectedFilters.project.length === 0 || 
        selectedFilters.project.includes(item.directorProject);
      const matchesScmFeed = selectedFilters.scmFeed.length === 0 || 
        selectedFilters.scmFeed.includes(item.scmFeedname);
      const matchesMatchProcess = selectedFilters.matchProcess.length === 0 || 
        selectedFilters.matchProcess.includes(item.matchProcess);
      const matchesScmSource = selectedFilters.scmSource.length === 0 || 
        selectedFilters.scmSource.includes(item.scmSource);
      const matchesWorkflow = selectedFilters.workflow.length === 0 || 
        selectedFilters.workflow.includes(item.workflow);
      const matchesState = selectedFilters.state.length === 0 || 
        selectedFilters.state.includes(item.state);

      return matchesProject && matchesScmFeed && matchesMatchProcess && 
             matchesScmSource && matchesWorkflow && matchesState;
    });
  };

  const filteredData = getFilteredData();

  const getNodesByLevel = () => {
    const projects = [...new Set(filteredData.map(item => item.directorProject))];
    const scmFeeds = [...new Set(filteredData.map(item => item.scmFeedname))];
    const matchProcesses = [...new Set(filteredData.map(item => item.matchProcess))];
    const scmSources = [...new Set(filteredData.map(item => item.scmSource))];
    const workflows = [...new Set(filteredData.map(item => item.workflow))];
    const states = [...new Set(filteredData.map(item => item.state))];
    
    return { projects, scmFeeds, matchProcesses, scmSources, workflows, states };
  };

  const getNodeColor = (node: string, type: string) => {
    const colors = {
      project: ['bg-blue-500', 'bg-blue-600', 'bg-blue-700'],
      scmFeed: ['bg-green-500', 'bg-green-600', 'bg-green-700'],
      matchProcess: ['bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700'],
      scmSource: ['bg-orange-500', 'bg-orange-600', 'bg-orange-700'],
      workflow: ['bg-purple-500', 'bg-purple-600', 'bg-purple-700'],
      state: ['bg-red-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-cyan-500']
    };
    
    const hash = node.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[type as keyof typeof colors][Math.abs(hash) % colors[type as keyof typeof colors].length];
  };

  const isNodeSelected = (nodeValue: string, nodeType: keyof SelectedFilters) => {
    return selectedFilters[nodeType].includes(nodeValue);
  };

  const getSelectedFiltersCount = () => {
    return Object.values(selectedFilters).reduce((total, filters) => total + filters.length, 0);
  };

  const { projects, scmFeeds, matchProcesses, scmSources, workflows, states } = getNodesByLevel();

  const renderColumn = (title: string, items: string[], nodeType: keyof SelectedFilters) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-center text-slate-700 mb-4">
        {title}
        {selectedFilters[nodeType].length > 0 && (
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {selectedFilters[nodeType].length}
          </span>
        )}
      </h4>
      <div className="space-y-2">
        {items.map((item) => {
          const isSelected = isNodeSelected(item, nodeType);
          const itemCount = filteredData
            .filter(dataItem => {
              switch (nodeType) {
                case 'project': return dataItem.directorProject === item;
                case 'scmFeed': return dataItem.scmFeedname === item;
                case 'matchProcess': return dataItem.matchProcess === item;
                case 'scmSource': return dataItem.scmSource === item;
                case 'workflow': return dataItem.workflow === item;
                case 'state': return dataItem.state === item;
                default: return false;
              }
            })
            .reduce((sum, dataItem) => sum + (dataItem.alertCount || 0), 0);
          
          return (
            <div
              key={item}
              className={`${getNodeColor(item, nodeType)} text-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
                isSelected ? 'ring-4 ring-white ring-opacity-80 scale-105 shadow-lg' : 'hover:scale-102'
              }`}
              style={{ 
                height: `${Math.max(40, Math.min(80, itemCount / 50))}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => handleNodeClick(item, nodeType)}
            >
              <div className="text-center">
                <div className="font-medium text-sm">{item}</div>
                <div className="text-xs opacity-90">{itemCount.toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Interactive Sankey Flow Diagram</h3>
            <p className="text-sm text-slate-600">
              Click on nodes to select multiple filters across columns. Selected flows must pass through all selected nodes.
            </p>
          </div>
          {hasActiveFilters() && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">
                Active filters: <span className="font-medium">{getSelectedFiltersCount()}</span>
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear All ({getSelectedFiltersCount()})
              </Button>
            </div>
          )}
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-6 gap-4 h-[500px] overflow-y-auto">
          {renderColumn('Director Projects', projects, 'project')}
          {renderColumn('SCM Feed Names', scmFeeds, 'scmFeed')}
          {renderColumn('Match Processes', matchProcesses, 'matchProcess')}
          {renderColumn('SCM Sources', scmSources, 'scmSource')}
          {renderColumn('Workflows', workflows, 'workflow')}
          {renderColumn('Final States', states, 'state')}
        </div>
      </Card>

      {hasActiveFilters() && (
        <Card className="p-4">
          <h4 className="font-semibold text-slate-900 mb-3">
            Filtered Flow Results
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {Object.entries(selectedFilters).map(([type, filters]) => 
              filters.length > 0 && (
                <div key={type} className="space-y-1">
                  <div className="font-medium text-slate-700 capitalize">
                    {type.replace(/([A-Z])/g, ' $1').trim()}:
                  </div>
                  <div className="text-slate-600">
                    {filters.map((filter, index) => (
                      <span key={filter} className="inline-block bg-slate-100 px-2 py-1 rounded text-xs mr-1 mb-1">
                        {filter}
                      </span>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
          <div className="mt-4 pt-3 border-t">
            <div className="text-sm text-slate-600 mb-2">
              Showing {filteredData.length} workflow(s) that match all selected filters.
            </div>
            <div className="text-xs text-slate-500">
              Total alerts in filtered flows: {filteredData.reduce((sum, item) => sum + (item.alertCount || 0), 0).toLocaleString()}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SankeyView;
