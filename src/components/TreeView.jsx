
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TreeView = ({ data }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const buildTree = (data) => {
    const tree = [];
    const nodeMap = new Map();

    data.forEach(item => {
      const projectId = `project-${item.directorProject}`;
      const feedId = `${projectId}-feed-${item.directorFeedname}`;
      const scmId = `${feedId}-scm-${item.scmFeedname}`;
      const processId = `${scmId}-process-${item.matchProcess}`;
      const workflowId = `${processId}-workflow-${item.workflow}`;
      const stateId = `${workflowId}-state-${item.state}`;

      // Create or get project node
      if (!nodeMap.has(projectId)) {
        const projectNode = {
          id: projectId,
          label: item.directorProject,
          children: [],
          level: 0,
          type: 'project',
          count: 0
        };
        nodeMap.set(projectId, projectNode);
        tree.push(projectNode);
      }

      // Create or get feed node
      if (!nodeMap.has(feedId)) {
        const feedNode = {
          id: feedId,
          label: item.directorFeedname,
          children: [],
          level: 1,
          type: 'feed',
          count: 0
        };
        nodeMap.set(feedId, feedNode);
        nodeMap.get(projectId).children.push(feedNode);
      }

      // Create or get SCM node
      if (!nodeMap.has(scmId)) {
        const scmNode = {
          id: scmId,
          label: item.scmFeedname,
          children: [],
          level: 2,
          type: 'scm',
          count: 0
        };
        nodeMap.set(scmId, scmNode);
        nodeMap.get(feedId).children.push(scmNode);
      }

      // Create or get process node
      if (!nodeMap.has(processId)) {
        const processNode = {
          id: processId,
          label: item.matchProcess,
          children: [],
          level: 3,
          type: 'process',
          count: 0
        };
        nodeMap.set(processId, processNode);
        nodeMap.get(scmId).children.push(processNode);
      }

      // Create or get workflow node
      if (!nodeMap.has(workflowId)) {
        const workflowNode = {
          id: workflowId,
          label: item.workflow,
          children: [],
          level: 4,
          type: 'workflow',
          count: 0
        };
        nodeMap.set(workflowId, workflowNode);
        nodeMap.get(processId).children.push(workflowNode);
      }

      // Create state node (leaf)
      const stateNode = {
        id: stateId,
        label: item.state,
        children: [],
        level: 5,
        type: 'state',
        data: item,
        count: item.alertCount || 0
      };
      nodeMap.get(workflowId).children.push(stateNode);

      // Update counts
      nodeMap.get(projectId).count = (nodeMap.get(projectId).count || 0) + (item.alertCount || 0);
      nodeMap.get(feedId).count = (nodeMap.get(feedId).count || 0) + (item.alertCount || 0);
      nodeMap.get(scmId).count = (nodeMap.get(scmId).count || 0) + (item.alertCount || 0);
      nodeMap.get(processId).count = (nodeMap.get(processId).count || 0) + (item.alertCount || 0);
      nodeMap.get(workflowId).count = (nodeMap.get(workflowId).count || 0) + (item.alertCount || 0);
    });

    return tree;
  };

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getNodeIcon = (type, hasChildren, isExpanded) => {
    if (hasChildren) {
      return isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />;
    }
    
    switch (type) {
      case 'state':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'workflow':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Shield className="w-4 h-4 text-blue-500" />;
    }
  };

  const getNodeColor = (type, level) => {
    const colors = {
      project: 'bg-blue-50 border-blue-200 text-blue-800',
      feed: 'bg-green-50 border-green-200 text-green-800',
      scm: 'bg-purple-50 border-purple-200 text-purple-800',
      process: 'bg-orange-50 border-orange-200 text-orange-800',
      workflow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      state: 'bg-gray-50 border-gray-200 text-gray-800'
    };
    return colors[type] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const renderNode = (node) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const indent = node.level * 24;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${getNodeColor(node.type, node.level)}`}
          style={{ marginLeft: `${indent}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          <div className="flex items-center gap-2 flex-1">
            {getNodeIcon(node.type, hasChildren, isExpanded)}
            <span className="font-medium text-sm">{node.label}</span>
            {node.count !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {node.count.toLocaleString()}
              </Badge>
            )}
          </div>
          {node.data && (
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs">
                {node.data.workflow}
              </Badge>
            </div>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {node.children.map(renderNode)}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(data);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Hierarchical Tree View</h3>
        <p className="text-sm text-slate-600">
          Navigate through the workflow hierarchy from Director Projects down to individual alert states.
          Click on nodes to expand/collapse their children.
        </p>
      </div>

      <Card className="p-4 max-h-[600px] overflow-y-auto">
        <div className="space-y-2">
          {tree.map(renderNode)}
        </div>
      </Card>
    </div>
  );
};

export default TreeView;
