
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkflowData } from '@/data/mockData';

interface SankeyViewProps {
  data: WorkflowData[];
}

const SankeyView: React.FC<SankeyViewProps> = ({ data }) => {
  const [selectedFilter, setSelectedFilter] = useState<{
    type: string;
    value: string;
  } | null>(null);

  const handleNodeClick = (nodeValue: string, nodeType: string) => {
    if (selectedFilter?.type === nodeType && selectedFilter?.value === nodeValue) {
      // If clicking the same node, clear the filter
      setSelectedFilter(null);
    } else {
      // Set new filter
      setSelectedFilter({ type: nodeType, value: nodeValue });
    }
  };

  const clearFilter = () => {
    setSelectedFilter(null);
  };

  const getFilteredData = () => {
    if (!selectedFilter) return data;

    return data.filter(item => {
      switch (selectedFilter.type) {
        case 'project':
          return item.directorProject === selectedFilter.value;
        case 'scmFeed':
          return item.scmFeedname === selectedFilter.value;
        case 'matchProcess':
          return item.matchProcess === selectedFilter.value;
        case 'scmSource':
          return item.scmSource === selectedFilter.value;
        case 'workflow':
          return item.workflow === selectedFilter.value;
        case 'state':
          return item.state === selectedFilter.value;
        default:
          return true;
      }
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

  const isNodeSelected = (nodeValue: string, nodeType: string) => {
    return selectedFilter?.type === nodeType && selectedFilter?.value === nodeValue;
  };

  const { projects, scmFeeds, matchProcesses, scmSources, workflows, states } = getNodesByLevel();

  const renderColumn = (title: string, items: string[], nodeType: string) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-center text-slate-700 mb-4">{title}</h4>
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
                isSelected ? 'ring-4 ring-white ring-opacity-80 scale-105' : 'hover:scale-102'
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
              Click on any node to filter the flow and see only paths passing through that node.
            </p>
          </div>
          {selectedFilter && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">
                Filtered by: <span className="font-medium">{selectedFilter.value}</span>
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilter}
                className="text-xs"
              >
                Clear Filter
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

      {selectedFilter && (
        <Card className="p-4">
          <h4 className="font-semibold text-slate-900 mb-3">
            Filtered Flow: {selectedFilter.value}
          </h4>
          <div className="text-sm text-slate-600 mb-2">
            Showing {filteredData.length} workflow(s) that pass through this node.
          </div>
          <div className="text-xs text-slate-500">
            Total alerts in filtered flows: {filteredData.reduce((sum, item) => sum + (item.alertCount || 0), 0).toLocaleString()}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SankeyView;
