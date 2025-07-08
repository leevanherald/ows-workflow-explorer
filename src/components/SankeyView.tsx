
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { WorkflowData } from '@/data/mockData';

interface SankeyViewProps {
  data: WorkflowData[];
}

const SankeyView: React.FC<SankeyViewProps> = ({ data }) => {
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNodeExpansion = (nodeId: string, nodeType: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
      setSelectedFlow(null);
    } else {
      newExpanded.clear(); // Only one expansion at a time for clarity
      newExpanded.add(nodeId);
      setSelectedFlow(`${nodeType}:${nodeId}`);
    }
    setExpandedNodes(newExpanded);
  };

  const getNodesByLevel = () => {
    const projects = [...new Set(data.map(item => item.directorProject))];
    const scmFeeds = [...new Set(data.map(item => item.scmFeedname))];
    const matchProcesses = [...new Set(data.map(item => item.matchProcess))];
    const scmSources = [...new Set(data.map(item => item.scmSource))];
    const workflows = [...new Set(data.map(item => item.workflow))];
    const states = [...new Set(data.map(item => item.state))];
    
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

  const getConnectedItems = (selectedNode: string, nodeType: string) => {
    switch (nodeType) {
      case 'project':
        return data.filter(item => item.directorProject === selectedNode);
      case 'scmFeed':
        return data.filter(item => item.scmFeedname === selectedNode);
      case 'matchProcess':
        return data.filter(item => item.matchProcess === selectedNode);
      case 'scmSource':
        return data.filter(item => item.scmSource === selectedNode);
      case 'workflow':
        return data.filter(item => item.workflow === selectedNode);
      case 'state':
        return data.filter(item => item.state === selectedNode);
      default:
        return [];
    }
  };

  const { projects, scmFeeds, matchProcesses, scmSources, workflows, states } = getNodesByLevel();

  const renderColumn = (title: string, items: string[], nodeType: string) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-center text-slate-700 mb-4">{title}</h4>
      <div className="space-y-2">
        {items.map((item, index) => {
          const isExpanded = expandedNodes.has(item);
          const itemCount = data
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
            <div key={item} className="space-y-1">
              <div
                className={`${getNodeColor(item, nodeType)} text-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  isExpanded ? 'ring-2 ring-white ring-opacity-50' : ''
                }`}
                style={{ 
                  height: `${Math.max(40, Math.min(80, itemCount / 50))}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => toggleNodeExpansion(item, nodeType)}
              >
                <div className="text-center">
                  <div className="font-medium text-sm">{item}</div>
                  <div className="text-xs opacity-90">{itemCount.toLocaleString()}</div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="ml-4 space-y-1 bg-slate-50 p-2 rounded border-l-2 border-slate-300">
                  {getConnectedItems(item, nodeType).slice(0, 5).map((connectedItem, idx) => (
                    <div key={idx} className="text-xs text-slate-600 bg-white p-2 rounded">
                      <div className="grid grid-cols-2 gap-1">
                        <span className="font-medium">Feed:</span>
                        <span>{connectedItem.scmFeedname}</span>
                        <span className="font-medium">Match:</span>
                        <span>{connectedItem.matchProcess}</span>
                        <span className="font-medium">Source:</span>
                        <span>{connectedItem.scmSource}</span>
                        <span className="font-medium">Workflow:</span>
                        <span>{connectedItem.workflow}</span>
                        <span className="font-medium">State:</span>
                        <span>{connectedItem.state}</span>
                        <span className="font-medium">Alerts:</span>
                        <span>{connectedItem.alertCount || 0}</span>
                      </div>
                    </div>
                  ))}
                  {getConnectedItems(item, nodeType).length > 5 && (
                    <div className="text-xs text-slate-500 text-center">
                      +{getConnectedItems(item, nodeType).length - 5} more...
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Interactive Sankey Flow Diagram</h3>
        <p className="text-sm text-slate-600">
          Click on any node to see its connections and flow details. Each column represents a stage in the workflow pipeline.
        </p>
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

      {selectedFlow && (
        <Card className="p-4">
          <h4 className="font-semibold text-slate-900 mb-3">
            Selected Flow: {selectedFlow.split(':')[1]}
          </h4>
          <div className="text-sm text-slate-600">
            Click on nodes to explore their connections and see detailed flow information.
          </div>
        </Card>
      )}
    </div>
  );
};

export default SankeyView;
