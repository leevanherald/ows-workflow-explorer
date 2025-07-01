
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkflowData } from '@/data/mockData';
import { TrendingUp, AlertTriangle, Activity } from 'lucide-react';

interface HeatmapViewProps {
  data: WorkflowData[];
}

const HeatmapView: React.FC<HeatmapViewProps> = ({ data }) => {
  const heatmapData = useMemo(() => {
    // Create heatmap based on alert density
    const projects = [...new Set(data.map(item => item.directorProject))];
    const states = [...new Set(data.map(item => item.state))];
    
    const maxAlerts = Math.max(...data.map(item => item.alertCount || 0));
    
    const heatmap = projects.map(project => {
      const projectData = data.filter(item => item.directorProject === project);
      const stateData = states.map(state => {
        const stateItems = projectData.filter(item => item.state === state);
        const totalAlerts = stateItems.reduce((sum, item) => sum + (item.alertCount || 0), 0);
        const intensity = maxAlerts > 0 ? (totalAlerts / maxAlerts) : 0;
        
        return {
          state,
          alertCount: totalAlerts,
          workflowCount: stateItems.length,
          intensity,
          items: stateItems
        };
      });
      
      return {
        project,
        states: stateData,
        totalAlerts: projectData.reduce((sum, item) => sum + (item.alertCount || 0), 0),
        totalWorkflows: projectData.length
      };
    });
    
    return { heatmap, states, maxAlerts };
  }, [data]);

  const getHeatColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100 border-gray-200 text-gray-400';
    if (intensity < 0.2) return 'bg-green-100 border-green-200 text-green-700';
    if (intensity < 0.4) return 'bg-yellow-100 border-yellow-200 text-yellow-700';
    if (intensity < 0.6) return 'bg-orange-100 border-orange-200 text-orange-700';
    if (intensity < 0.8) return 'bg-red-100 border-red-200 text-red-700';
    return 'bg-red-200 border-red-300 text-red-800';
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity === 0) return 'No Activity';
    if (intensity < 0.2) return 'Very Low';
    if (intensity < 0.4) return 'Low';
    if (intensity < 0.6) return 'Medium';
    if (intensity < 0.8) return 'High';
    return 'Critical';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Alert Density Heatmap</h3>
          <p className="text-gray-600">Visual representation of alert concentrations across projects and states</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Alert Intensity:</span>
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
            <div key={index} className="flex items-center gap-1">
              <div className={`w-4 h-4 border rounded ${getHeatColor(intensity).split(' ').slice(0, 2).join(' ')}`}></div>
              {index === 0 && <span>Low</span>}
              {index === 5 && <span>High</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-blue-600" />
              Total Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {data.reduce((sum, item) => sum + (item.alertCount || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Alerts</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Active Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {data.length.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Workflows</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Peak Intensity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {heatmapData.maxAlerts.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Max Alerts per Workflow</div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left font-medium text-gray-900 sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                    Project
                  </th>
                  <th className="px-3 py-3 text-center font-medium text-gray-900 min-w-[100px]">
                    Total Alerts
                  </th>
                  <th className="px-3 py-3 text-center font-medium text-gray-900 min-w-[100px]">
                    Workflows
                  </th>
                  {heatmapData.states.map(state => (
                    <th key={state} className="px-3 py-3 text-center font-medium text-gray-900 min-w-[120px]">
                      <div className="truncate" title={state}>
                        {state}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.heatmap.map((row, index) => (
                  <tr key={row.project} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-inherit z-10 border-r">
                      <div className="truncate" title={row.project}>
                        {row.project}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-gray-900">
                      {row.totalAlerts.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {row.totalWorkflows}
                    </td>
                    {row.states.map((stateData) => (
                      <td key={stateData.state} className="px-2 py-2">
                        <div 
                          className={`${getHeatColor(stateData.intensity)} border rounded-lg p-3 flex flex-col items-center gap-1 min-h-[80px] justify-center transition-all duration-200 hover:shadow-md cursor-pointer`}
                          title={`${stateData.state}: ${stateData.alertCount} alerts, ${stateData.workflowCount} workflows - ${getIntensityLabel(stateData.intensity)}`}
                        >
                          <div className="text-lg font-bold">
                            {stateData.alertCount > 0 ? stateData.alertCount : '–'}
                          </div>
                          <div className="text-xs">
                            {stateData.workflowCount}W
                          </div>
                          <div className="text-xs font-medium opacity-75">
                            {getIntensityLabel(stateData.intensity)}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
        <p><strong>How to read:</strong> Darker colors indicate higher alert densities. Hover over cells for detailed information.</p>
        <p><strong>W</strong> = Number of workflows in that project-state combination</p>
      </div>
    </div>
  );
};

export default HeatmapView;
