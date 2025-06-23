
import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const TabularView = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aString < bString ? -1 : aString > bString ? 1 : 0;
      } else {
        return aString > bString ? -1 : aString < bString ? 1 : 0;
      }
    });
  }, [data, sortConfig]);

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };

  const getStateBadgeVariant = (state) => {
    switch (state.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'failed':
      case 'exception':
        return 'destructive';
      case 'in progress':
      case 'pending review':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const columns = [
    { key: 'directorProject', label: 'Director Project', width: 'w-48' },
    { key: 'directorFeedname', label: 'Director Feed', width: 'w-44' },
    { key: 'scmFeedname', label: 'SCM Feed', width: 'w-40' },
    { key: 'matchProcess', label: 'Match Process', width: 'w-44' },
    { key: 'workflow', label: 'Workflow', width: 'w-48' },
    { key: 'state', label: 'State', width: 'w-32' },
    { key: 'alertCount', label: 'Alert Count', width: 'w-28' }
  ];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Detailed Table View</h3>
        <p className="text-sm text-slate-600">
          Complete tabular view of all workflow data with sorting capabilities. Click column headers to sort.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {columns.map(column => (
                  <th key={column.key} className={`px-4 py-3 text-left ${column.width}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold text-slate-700 hover:text-slate-900"
                      onClick={() => handleSort(column.key)}
                    >
                      <span className="flex items-center gap-2">
                        {column.label}
                        {getSortIcon(column.key)}
                      </span>
                    </Button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedData.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.directorProject}</td>
                  <td className="px-4 py-3 text-slate-700">{item.directorFeedname}</td>
                  <td className="px-4 py-3 text-slate-700">{item.scmFeedname}</td>
                  <td className="px-4 py-3 text-slate-700">{item.matchProcess}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{item.workflow}</td>
                  <td className="px-4 py-3">
                    <Badge variant={getStateBadgeVariant(item.state)} className="text-xs">
                      {item.state}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {item.alertCount?.toLocaleString() || '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-sm text-slate-500 px-4">
        Showing {sortedData.length} workflow entries
      </div>
    </div>
  );
};

export default TabularView;
