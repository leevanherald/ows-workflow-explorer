
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkflowData } from '@/data/mockData';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface MatrixViewProps {
  data: WorkflowData[];
}

const MatrixView: React.FC<MatrixViewProps> = ({ data }) => {
  const matrixData = useMemo(() => {
    // Get unique feeds and match processes
    const feeds = [...new Set(data.map(item => item.directorFeedname))];
    const matchProcesses = [...new Set(data.map(item => item.matchProcess))];
    
    // Create matrix mapping
    const matrix = feeds.map(feed => {
      const feedData = data.filter(item => item.directorFeedname === feed);
      const mappings = matchProcesses.map(matchProcess => {
        const mapping = feedData.find(item => item.matchProcess === matchProcess);
        return {
          matchProcess,
          exists: !!mapping,
          workflows: mapping ? [...new Set(feedData.filter(item => item.matchProcess === matchProcess).map(item => item.workflow))] : [],
          states: mapping ? [...new Set(feedData.filter(item => item.matchProcess === matchProcess).map(item => item.state))] : [],
          alertCount: mapping ? feedData.filter(item => item.matchProcess === matchProcess).reduce((sum, item) => sum + (item.alertCount || 0), 0) : 0
        };
      });
      
      return {
        feed,
        mappings,
        totalMappings: mappings.filter(m => m.exists).length,
        totalAlerts: mappings.reduce((sum, m) => sum + m.alertCount, 0)
      };
    });

    return { matrix, matchProcesses };
  }, [data]);

  const getCellColor = (mapping: any) => {
    if (!mapping.exists) return 'bg-red-50 border-red-200';
    if (mapping.alertCount > 50) return 'bg-red-100 border-red-300';
    if (mapping.alertCount > 20) return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  };

  const getCellIcon = (mapping: any) => {
    if (!mapping.exists) return <XCircle className="w-4 h-4 text-red-500" />;
    if (mapping.alertCount > 50) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    return <CheckCircle2 className="w-4 h-4 text-green-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Interactive Matrix View</h3>
          <p className="text-gray-600">Coverage matrix showing feed mappings across match processes</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Mapped (Low alerts)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>Mapped (Medium alerts)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>High alerts / Missing</span>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left font-medium text-gray-900 sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                    Feed Name
                  </th>
                  <th className="px-3 py-3 text-center font-medium text-gray-900 min-w-[80px]">
                    Total Mappings
                  </th>
                  <th className="px-3 py-3 text-center font-medium text-gray-900 min-w-[80px]">
                    Total Alerts
                  </th>
                  {matrixData.matchProcesses.map(matchProcess => (
                    <th key={matchProcess} className="px-3 py-3 text-center font-medium text-gray-900 min-w-[120px] transform -rotate-45 origin-bottom">
                      <div className="truncate" title={matchProcess}>
                        {matchProcess}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData.matrix.map((row, index) => (
                  <tr key={row.feed} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-inherit z-10 border-r">
                      <div className="truncate" title={row.feed}>
                        {row.feed}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {row.totalMappings}/{matrixData.matchProcesses.length}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {row.totalAlerts}
                      </Badge>
                    </td>
                    {row.mappings.map((mapping) => (
                      <td key={mapping.matchProcess} className="px-3 py-3">
                        <div className={`${getCellColor(mapping)} border rounded-lg p-2 flex flex-col items-center gap-1 min-h-[60px] justify-center`}>
                          {getCellIcon(mapping)}
                          {mapping.exists && (
                            <div className="text-xs font-medium text-center">
                              <div>{mapping.workflows.length}W</div>
                              <div>{mapping.states.length}S</div>
                              {mapping.alertCount > 0 && (
                                <div className="text-red-600">{mapping.alertCount}A</div>
                              )}
                            </div>
                          )}
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
        <p><strong>Legend:</strong> W = Workflows, S = States, A = Alerts</p>
        <p>This matrix shows which feeds are mapped to which match processes, helping identify coverage gaps and high-alert areas.</p>
      </div>
    </div>
  );
};

export default MatrixView;
