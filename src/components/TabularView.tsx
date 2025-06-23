
import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkflowData } from '@/data/mockData';

interface TabularViewProps {
  data: WorkflowData[];
}

type SortField = keyof WorkflowData;
type SortDirection = 'asc' | 'desc';

const TabularView: React.FC<TabularViewProps> = ({ data }) => {
  const [sortField, setSortField] = useState<SortField>('directorProject');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle numeric fields
    if (sortField === 'alertCount') {
      aValue = aValue || 0;
      bValue = bValue || 0;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[priority as keyof typeof colors]}>{priority}</Badge>;
  };

  const getOwnerBadge = (owner: string) => {
    const colors = {
      ops: 'bg-blue-100 text-blue-800',
      tech: 'bg-purple-100 text-purple-800',
      dm: 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[owner as keyof typeof colors]}>{owner.toUpperCase()}</Badge>;
  };

  const exportToCSV = () => {
    const headers = [
      'Director Project',
      'Director Feedname',
      'SCM Feedname',
      'Match Process',
      'SCM Source',
      'Workflow',
      'State',
      'Priority',
      'Validated',
      'Owner',
      'Alert Count'
    ];
    
    const csvContent = [
      headers.join(','),
      ...sortedData.map(row => [
        row.directorProject,
        row.directorFeedname,
        row.scmFeedname,
        row.matchProcess,
        row.scmSource,
        row.workflow,
        row.state,
        row.priority,
        row.validated,
        row.owner,
        row.alertCount || 0
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ows-workflow-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Workflow Data Table</h3>
          <p className="text-sm text-slate-600">
            Complete dataset with filtering and sorting capabilities. Click column headers to sort.
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {[
                  { field: 'directorProject' as SortField, label: 'Director Project' },
                  { field: 'directorFeedname' as SortField, label: 'Director Feedname' },
                  { field: 'scmFeedname' as SortField, label: 'SCM Feedname' },
                  { field: 'matchProcess' as SortField, label: 'Match Process' },
                  { field: 'scmSource' as SortField, label: 'SCM Source' },
                  { field: 'workflow' as SortField, label: 'Workflow' },
                  { field: 'state' as SortField, label: 'State' },
                  { field: 'priority' as SortField, label: 'Priority' },
                  { field: 'validated' as SortField, label: 'Validated' },
                  { field: 'owner' as SortField, label: 'Owner' },
                  { field: 'alertCount' as SortField, label: 'Alert Count' }
                ].map(({ field, label }) => (
                  <th
                    key={field}
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort(field)}
                  >
                    <div className="flex items-center gap-2">
                      {label}
                      {getSortIcon(field)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {sortedData.map((row, index) => (
                <tr key={`${row.directorProject}-${row.workflow}-${row.state}-${index}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                    {row.directorProject}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {row.directorFeedname}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {row.scmFeedname}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {row.matchProcess}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {row.scmSource}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {row.workflow}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {row.state}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getPriorityBadge(row.priority)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      row.validated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {row.validated ? '✓ Yes' : '✗ No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getOwnerBadge(row.owner)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 font-medium">
                    {(row.alertCount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {sortedData.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No workflow data matches your current filters.
          </div>
        )}
      </Card>
      
      <div className="text-sm text-slate-600">
        Showing {sortedData.length} workflow{sortedData.length !== 1 ? 's' : ''} 
        {data.length !== sortedData.length && ` (filtered from ${data.length} total)`}
      </div>
    </div>
  );
};

export default TabularView;
