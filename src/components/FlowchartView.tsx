
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkflowData } from '@/data/mockData';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface FlowchartViewProps {
  data: WorkflowData[];
}

interface TreeNode {
  id: string;
  label: string;
  type: 'project' | 'feed' | 'source' | 'match' | 'workflow' | 'state';
  count: number;
  children: TreeNode[];
  expanded: boolean;
}

const FlowchartView: React.FC<FlowchartViewProps> = ({ data }) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Get unique projects for selection
  const projects = useMemo(() => {
    return [...new Set(data.map(item => item.directorProject))].filter(Boolean);
  }, [data]);

  // Build tree structure
  const treeData = useMemo(() => {
    console.log('🔄 Building tree data...', { selectedProject, dataLength: data.length });
    
    let filteredData = selectedProject === 'all' 
      ? data 
      : data.filter(item => item.directorProject === selectedProject);

    if (filteredData.length === 0) {
      return [];
    }

    // Group data by hierarchy levels
    const projectMap = new Map<string, TreeNode>();
    
    filteredData.forEach(item => {
      const projectId = `project_${item.directorProject}`;
      const feedId = `feed_${item.directorProject}_${item.directorFeedname}`;
      const sourceId = `source_${item.directorProject}_${item.directorFeedname}_${item.scmSource}`;
      const matchId = `match_${item.directorProject}_${item.directorFeedname}_${item.scmSource}_${item.matchProcess}`;
      const workflowId = `workflow_${item.directorProject}_${item.directorFeedname}_${item.scmSource}_${item.matchProcess}_${item.workflow}`;
      const stateId = `state_${item.directorProject}_${item.directorFeedname}_${item.scmSource}_${item.matchProcess}_${item.workflow}_${item.state}`;

      // Create or get project node
      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          id: projectId,
          label: item.directorProject,
          type: 'project',
          count: 0,
          children: [],
          expanded: false
        });
      }
      const projectNode = projectMap.get(projectId)!;
      projectNode.count += item.alertCount || 1;

      // Create or get feed node
      let feedNode = projectNode.children.find(n => n.id === feedId);
      if (!feedNode) {
        feedNode = {
          id: feedId,
          label: item.directorFeedname,
          type: 'feed',
          count: 0,
          children: [],
          expanded: false
        };
        projectNode.children.push(feedNode);
      }
      feedNode.count += item.alertCount || 1;

      // Create or get source node
      let sourceNode = feedNode.children.find(n => n.id === sourceId);
      if (!sourceNode) {
        sourceNode = {
          id: sourceId,
          label: item.scmSource,
          type: 'source',
          count: 0,
          children: [],
          expanded: false
        };
        feedNode.children.push(sourceNode);
      }
      sourceNode.count += item.alertCount || 1;

      // Create or get match node
      let matchNode = sourceNode.children.find(n => n.id === matchId);
      if (!matchNode) {
        matchNode = {
          id: matchId,
          label: item.matchProcess,
          type: 'match',
          count: 0,
          children: [],
          expanded: false
        };
        sourceNode.children.push(matchNode);
      }
      matchNode.count += item.alertCount || 1;

      // Create or get workflow node
      let workflowNode = matchNode.children.find(n => n.id === workflowId);
      if (!workflowNode) {
        workflowNode = {
          id: workflowId,
          label: item.workflow,
          type: 'workflow',
          count: 0,
          children: [],
          expanded: false
        };
        matchNode.children.push(workflowNode);
      }
      workflowNode.count += item.alertCount || 1;

      // Create or get state node
      let stateNode = workflowNode.children.find(n => n.id === stateId);
      if (!stateNode) {
        stateNode = {
          id: stateId,
          label: item.state,
          type: 'state',
          count: 0,
          children: [],
          expanded: false
        };
        workflowNode.children.push(stateNode);
      }
      stateNode.count += item.alertCount || 1;
    });

    return Array.from(projectMap.values());
  }, [data, selectedProject]);

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
      project: 'bg-gradient-to-r from-purple-500 to-blue-600',
      feed: 'bg-gradient-to-r from-pink-500 to-red-500',
      source: 'bg-gradient-to-r from-blue-400 to-cyan-400',
      match: 'bg-gradient-to-r from-green-400 to-emerald-500',
      workflow: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      state: 'bg-gradient-to-r from-teal-400 to-blue-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    
    return (
      <div key={node.id} className="relative">
        {/* Connection lines */}
        {level > 0 && (
          <div className="absolute left-0 top-0 w-8 h-6 border-l-2 border-b-2 border-slate-300 rounded-bl-lg"></div>
        )}
        
        {/* Node */}
        <div 
          className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${getNodeColor(node.type)} text-white mb-4`}
          style={{ marginLeft: level * 40 }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren && (
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">
              {node.label}
            </div>
            <div className="text-xs opacity-90">
              {node.count} alerts
            </div>
          </div>
          
          <div className="text-xs opacity-75 capitalize">
            {node.type}
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-4 top-0 w-0.5 h-full bg-slate-300"></div>
            
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="p-6 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Interactive Network Workflow
        </h3>
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-64 bg-slate-700/50 border-slate-600 text-white backdrop-blur-sm z-50">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 z-50">
              <SelectItem value="all" className="text-white hover:bg-slate-600">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project} value={project} className="text-white hover:bg-slate-600">
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-slate-300">
            Click on nodes to expand the workflow
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-auto p-6">
        {treeData.length > 0 ? (
          <div className="space-y-2">
            {treeData.map(node => renderNode(node))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-lg">
              {data.length === 0 ? 'No workflow data available' : 'No data available for the selected project'}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-6 bg-slate-800/50 backdrop-blur-sm border-t border-slate-700/50">
        <h4 className="font-semibold text-white mb-4">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { type: 'project', label: 'Director Projects' },
            { type: 'feed', label: 'Feed Names' },
            { type: 'source', label: 'Sources' },
            { type: 'match', label: 'Match Process' },
            { type: 'workflow', label: 'Workflows' },
            { type: 'state', label: 'End States' },
          ].map(({ type, label }) => (
            <div key={type} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 backdrop-blur-sm">
              <div className={`w-4 h-4 rounded ${getNodeColor(type)}`}></div>
              <span className="text-sm text-slate-300 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlowchartView;
