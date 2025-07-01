import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SearchableSelect from '@/components/SearchableSelect';
import { WorkflowData } from '@/data/mockData';
import { ChevronRight, ChevronDown, AlertCircle, Upload, File } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

interface FlowchartViewProps {
  data: WorkflowData[];
}

interface FlowNode {
  id: string;
  label: string;
  type: 'project' | 'feed' | 'source' | 'match' | 'workflow' | 'state';
  count: number;
  level: number;
  parentId?: string;
  expanded: boolean;
  x: number;
  y: number;
}

const FlowchartView: React.FC<FlowchartViewProps> = ({ data }) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [uploadedData, setUploadedData] = useState<WorkflowData[]>([]);
  const [isUsingUploadedData, setIsUsingUploadedData] = useState(false);
  const { toast } = useToast();

  // Use uploaded data if available, otherwise use prop data
  const currentData = isUsingUploadedData ? uploadedData : data;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel data to WorkflowData format with all required properties
        const mappedData: WorkflowData[] = jsonData.map((row: any, index: number) => ({
          directorProject: row['Director Project'] || row['directorProject'] || 'Unknown Project',
          directorFeedname: row['Director Feed'] || row['directorFeedname'] || 'Unknown Feed',
          scmFeedname: row['SCM Feed'] || row['scmFeedname'] || 'Unknown SCM Feed',
          matchProcess: row['Match Process'] || row['matchProcess'] || 'Unknown Process',
          scmSource: row['SCM Source'] || row['scmSource'] || 'Unknown Source',
          workflow: row['Workflow'] || row['workflow'] || 'Unknown Workflow',
          state: row['State'] || row['state'] || 'Unknown State',
          priority: (row['Priority'] || row['priority'] || 'medium').toLowerCase() as 'high' | 'medium' | 'low',
          validated: Boolean(row['Validated'] || row['validated'] || false),
          owner: (row['Owner'] || row['owner'] || 'ops').toLowerCase() as 'ops' | 'tech' | 'dm',
          alertCount: parseInt(row['Alert Count'] || row['alertCount'] || '1')
        }));

        setUploadedData(mappedData);
        setIsUsingUploadedData(true);
        setSelectedProject('all');
        
        toast({
          title: "Excel File Uploaded Successfully",
          description: `Loaded ${mappedData.length} workflow records from Excel file`,
        });
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast({
          title: "Upload Failed",
          description: "Could not parse Excel file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const clearUploadedData = () => {
    setUploadedData([]);
    setIsUsingUploadedData(false);
    setSelectedProject('all');
    toast({
      title: "Data Cleared",
      description: "Switched back to default workflow data",
    });
  };

  // Get unique projects for selection
  const projects = useMemo(() => {
    return [...new Set(currentData.map(item => item.directorProject))].filter(Boolean);
  }, [currentData]);

  const projectOptions = useMemo(() => [
    { value: 'all', label: 'All Projects' },
    ...projects.map(project => ({ value: project, label: project }))
  ], [projects]);

  // Build flowchart data with improved positioning
  const flowchartData = useMemo(() => {
    console.log('🔄 Building flowchart data...', { selectedProject, dataLength: currentData.length });
    
    let filteredData = selectedProject === 'all' 
      ? currentData 
      : currentData.filter(item => item.directorProject === selectedProject);

    if (filteredData.length === 0) {
      return { nodes: [], connections: [] };
    }

    const nodes: FlowNode[] = [];
    const connections: { from: string; to: string }[] = [];
    const nodeMap = new Map<string, FlowNode>();

    // Professional positioning with consistent spacing
    const levelCounts = new Map<number, number>();
    const levelWidth = 280;
    const nodeHeight = 100;
    const verticalSpacing = 140;

    filteredData.forEach(item => {
      const hierarchy = [
        { id: `project_${item.directorProject}`, label: item.directorProject, type: 'project' as const, level: 0 },
        { id: `feed_${item.directorProject}_${item.directorFeedname}`, label: item.directorFeedname, type: 'feed' as const, level: 1, parentId: `project_${item.directorProject}` },
        { id: `source_${item.directorProject}_${item.directorFeedname}_${item.scmSource}`, label: item.scmSource, type: 'source' as const, level: 2, parentId: `feed_${item.directorProject}_${item.directorFeedname}` },
        { id: `match_${item.directorProject}_${item.directorFeedname}_${item.scmSource}_${item.matchProcess}`, label: item.matchProcess, type: 'match' as const, level: 3, parentId: `source_${item.directorProject}_${item.directorFeedname}_${item.scmSource}` },
        { id: `workflow_${item.directorProject}_${item.directorFeedname}_${item.scmSource}_${item.matchProcess}_${item.workflow}`, label: item.workflow, type: 'workflow' as const, level: 4, parentId: `match_${item.directorProject}_${item.directorFeedname}_${item.scmSource}_${item.matchProcess}` },
        { id: `state_${item.directorProject}_${item.directorFeedname}_${item.scmSource}_${item.matchProcess}_${item.workflow}_${item.state}`, label: item.state, type: 'state' as const, level: 5, parentId: `workflow_${item.directorProject}_${item.directorFeedname}_${item.scmSource}_${item.matchProcess}_${item.workflow}` }
      ];

      hierarchy.forEach((nodeData, index) => {
        if (!nodeMap.has(nodeData.id)) {
          const currentLevelCount = levelCounts.get(nodeData.level) || 0;
          levelCounts.set(nodeData.level, currentLevelCount + 1);

          const node: FlowNode = {
            ...nodeData,
            count: 0,
            expanded: false,
            x: nodeData.level * levelWidth + 50,
            y: currentLevelCount * verticalSpacing + 80
          };

          nodeMap.set(nodeData.id, node);
          nodes.push(node);

          // Add connection to parent
          if (nodeData.parentId && index > 0) {
            connections.push({
              from: nodeData.parentId,
              to: nodeData.id
            });
          }
        }

        // Update count
        const node = nodeMap.get(nodeData.id)!;
        node.count += item.alertCount || 1;
      });
    });

    return { nodes, connections };
  }, [currentData, selectedProject]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getNodeColor = (type: string): string => {
    const colors = {
      project: 'bg-slate-700',
      feed: 'bg-blue-600',
      source: 'bg-indigo-600',
      match: 'bg-green-600',
      workflow: 'bg-orange-600',
      state: 'bg-purple-600',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-600';
  };

  const getNodeBorder = (type: string): string => {
    const borders = {
      project: 'border-slate-300',
      feed: 'border-blue-300',
      source: 'border-indigo-300',
      match: 'border-green-300',
      workflow: 'border-orange-300',
      state: 'border-purple-300',
    };
    return borders[type as keyof typeof borders] || 'border-gray-300';
  };

  const isNodeVisible = (node: FlowNode): boolean => {
    if (node.level === 0) return true;
    if (!node.parentId) return true;
    
    return expandedNodes.has(node.parentId) && isNodeVisible(flowchartData.nodes.find(n => n.id === node.parentId)!);
  };

  const visibleNodes = flowchartData.nodes.filter(isNodeVisible);
  const visibleConnections = flowchartData.connections.filter(conn => 
    visibleNodes.some(n => n.id === conn.from) && visibleNodes.some(n => n.id === conn.to)
  );

  // Calculate container dimensions
  const maxX = visibleNodes.reduce((max, node) => Math.max(max, node.x + 240), 0);
  const maxY = visibleNodes.reduce((max, node) => Math.max(max, node.y + 120), 0);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Professional Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">
              Workflow Management System
            </h3>
            <p className="text-gray-600 text-sm">
              Customer journey workflow visualization and monitoring
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Excel Upload Section */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-upload"
              />
              <label
                htmlFor="excel-upload"
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                Upload Excel
              </label>
              {isUsingUploadedData && (
                <Button
                  onClick={clearUploadedData}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <File className="w-4 h-4" />
                  Clear Upload
                </Button>
              )}
            </div>
            
            <SearchableSelect
              value={selectedProject}
              onValueChange={setSelectedProject}
              options={projectOptions}
              placeholder="Select Project"
              className="w-64"
            />
            <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded border">
              {isUsingUploadedData ? 'Using uploaded data' : 'Click nodes to expand workflow'}
            </div>
          </div>
        </div>
      </div>

      {/* Flowchart Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {visibleNodes.length > 0 ? (
          <div 
            className="relative p-6"
            style={{ 
              width: Math.max(maxX + 60, 1200), 
              height: Math.max(maxY + 60, 600) 
            }}
          >
            {/* Professional SVG Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="8"
                  refX="9"
                  refY="4"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon
                    points="0 0, 10 4, 0 8"
                    fill="#6b7280"
                    stroke="none"
                  />
                </marker>
              </defs>
              {visibleConnections.map((conn, index) => {
                const fromNode = visibleNodes.find(n => n.id === conn.from);
                const toNode = visibleNodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                const fromX = fromNode.x + 240;
                const fromY = fromNode.y + 60;
                const toX = toNode.x;
                const toY = toNode.y + 60;

                return (
                  <line
                    key={`${conn.from}-${conn.to}-${index}`}
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke="#6b7280"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
            </svg>

            {/* Professional Nodes */}
            {visibleNodes.map(node => {
              const hasChildren = flowchartData.connections.some(conn => conn.from === node.id);
              const isExpanded = expandedNodes.has(node.id);

              return (
                <div
                  key={node.id}
                  className={`absolute cursor-pointer transition-all duration-200 ${hasChildren ? 'hover:shadow-lg' : 'hover:shadow-md'}`}
                  style={{ 
                    left: node.x, 
                    top: node.y,
                    zIndex: 10
                  }}
                  onClick={() => hasChildren && toggleNode(node.id)}
                >
                  <div className={`${getNodeColor(node.type)} text-white rounded-lg p-4 w-60 h-28 border-2 ${getNodeBorder(node.type)} shadow-sm`}>
                    <div className="h-full flex flex-col justify-between">
                      <div className="flex items-start gap-2">
                        {hasChildren && (
                          <div className="flex-shrink-0 mt-0.5 p-1 rounded bg-white/20">
                            {isExpanded ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronRight className="w-3 h-3" />
                            )}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate mb-1">
                            {node.label}
                          </div>
                          <div className="text-xs opacity-80 capitalize">
                            {node.type}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-white/20 rounded px-2 py-1">
                          <AlertCircle className="w-3 h-3" />
                          <span className="text-xs font-medium">{node.count}</span>
                        </div>
                        {hasChildren && (
                          <div className="text-xs opacity-70">
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-4xl mb-3 text-gray-400">📊</div>
              <div className="text-lg font-medium text-gray-700 mb-2">
                {currentData.length === 0 ? 'No workflow data available' : 'No data for selected project'}
              </div>
              <div className="text-gray-500 text-sm">
                {currentData.length === 0 ? 'Upload an Excel file or import your workflow data to get started' : 'Try selecting "All Projects" or a different project'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Professional Legend */}
      <div className="px-6 py-4 bg-white border-t border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3">Workflow Hierarchy</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { type: 'project', label: 'Director Projects' },
            { type: 'feed', label: 'Data Feeds' },
            { type: 'source', label: 'Sources' },
            { type: 'match', label: 'Match Process' },
            { type: 'workflow', label: 'Workflows' },
            { type: 'state', label: 'End States' },
          ].map(({ type, label }) => (
            <div key={type} className="flex items-center gap-2 p-2 rounded border border-gray-200 bg-gray-50">
              <div className={`w-4 h-4 rounded ${getNodeColor(type)}`}></div>
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          ))}
        </div>
        {isUsingUploadedData && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center gap-2 text-green-800">
              <File className="w-4 h-4" />
              <span className="text-sm font-medium">
                Currently displaying data from uploaded Excel file ({uploadedData.length} records)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowchartView;
