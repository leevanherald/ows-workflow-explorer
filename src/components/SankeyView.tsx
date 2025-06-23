
import React from 'react';
import { Card } from '@/components/ui/card';
import { WorkflowData } from '@/data/mockData';

interface SankeyViewProps {
  data: WorkflowData[];
}

const SankeyView: React.FC<SankeyViewProps> = ({ data }) => {
  // Group data for flow visualization
  const getFlowData = () => {
    const flows: { [key: string]: number } = {};
    
    data.forEach(item => {
      const flowKey = `${item.directorProject} → ${item.workflow} → ${item.state}`;
      flows[flowKey] = (flows[flowKey] || 0) + (item.alertCount || 1);
    });
    
    return Object.entries(flows).sort((a, b) => b[1] - a[1]);
  };

  const getNodesByLevel = () => {
    const projects = [...new Set(data.map(item => item.directorProject))];
    const workflows = [...new Set(data.map(item => item.workflow))];
    const states = [...new Set(data.map(item => item.state))];
    
    return { projects, workflows, states };
  };

  const getNodeColor = (node: string, type: 'project' | 'workflow' | 'state') => {
    const colors = {
      project: ['bg-blue-500', 'bg-blue-600', 'bg-blue-700'],
      workflow: ['bg-green-500', 'bg-green-600', 'bg-green-700'],
      state: ['bg-purple-500', 'bg-purple-600', 'bg-purple-700', 'bg-red-500', 'bg-yellow-500']
    };
    
    const hash = node.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[type][Math.abs(hash) % colors[type].length];
  };

  const { projects, workflows, states } = getNodesByLevel();
  const flows = getFlowData();

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Workflow Flow Diagram</h3>
        <p className="text-sm text-slate-600">
          Visual representation of how alerts flow from Director Projects through Workflows to Final States.
        </p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-3 gap-8 h-[400px]">
          {/* Director Projects Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-center text-slate-700 mb-4">Director Projects</h4>
            <div className="space-y-2">
              {projects.map((project, index) => {
                const projectCount = data
                  .filter(item => item.directorProject === project)
                  .reduce((sum, item) => sum + (item.alertCount || 0), 0);
                
                return (
                  <div
                    key={project}
                    className={`${getNodeColor(project, 'project')} text-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow`}
                    style={{ 
                      height: `${Math.max(40, Math.min(80, projectCount / 100))}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div className="text-center">
                      <div className="font-medium text-sm">{project}</div>
                      <div className="text-xs opacity-90">{projectCount.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workflows Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-center text-slate-700 mb-4">Workflows</h4>
            <div className="space-y-2">
              {workflows.map((workflow, index) => {
                const workflowCount = data
                  .filter(item => item.workflow === workflow)
                  .reduce((sum, item) => sum + (item.alertCount || 0), 0);
                
                return (
                  <div
                    key={workflow}
                    className={`${getNodeColor(workflow, 'workflow')} text-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow`}
                    style={{ 
                      height: `${Math.max(40, Math.min(80, workflowCount / 100))}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div className="text-center">
                      <div className="font-medium text-sm">{workflow}</div>
                      <div className="text-xs opacity-90">{workflowCount.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* States Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-center text-slate-700 mb-4">Final States</h4>
            <div className="space-y-2">
              {states.map((state, index) => {
                const stateCount = data
                  .filter(item => item.state === state)
                  .reduce((sum, item) => sum + (item.alertCount || 0), 0);
                
                return (
                  <div
                    key={state}
                    className={`${getNodeColor(state, 'state')} text-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow`}
                    style={{ 
                      height: `${Math.max(40, Math.min(80, stateCount / 100))}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div className="text-center">
                      <div className="font-medium text-sm">{state}</div>
                      <div className="text-xs opacity-90">{stateCount.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Flow Summary */}
      <Card className="p-4">
        <h4 className="font-semibold text-slate-900 mb-3">Top Flow Paths</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {flows.slice(0, 10).map(([flow, count], index) => (
            <div key={flow} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
              <span className="text-sm text-slate-700">{flow}</span>
              <span className="text-sm font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded">
                {count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SankeyView;
