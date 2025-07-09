import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Shield, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkflowData } from '@/data/mockData';
import html2canvas from 'html2canvas';

interface TreeViewProps {
  data: WorkflowData[];
}

interface TreeNode {
  id: string;
  label: string;
  children: TreeNode[];
  data?: WorkflowData;
  level: number;
  type: 'project' | 'feed' | 'scm' | 'process' | 'workflow' | 'state';
  count?: number;
}

const TreeView: React.FC<TreeViewProps> = ({ data }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const treeRef = useRef<HTMLDivElement>(null);

  const downloadImage = async () => {
    if (treeRef.current) {
      try {
        const canvas = await html2canvas(treeRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
        });
        
        const link = document.createElement('a');
        link.download = `tree-view-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }
  };

  const buildTree = (data: WorkflowData[]): TreeNode[] => {
    const tree: TreeNode[] = [];
    const nodeMap = new Map<string, TreeNode>();

    data.forEach(item => {
      const projectId = `project-${item.directorProject}`;
      const feedId = `${projectId}-feed-${item.directorFeedname}`;
      const scmId = `${feedId}-scm-${item.scmFeedname}`;
      const processId = `${scmId}-process-${item.matchProcess}`;
      const workflowId = `${processId}-workflow-${item.workflow}`;
      const stateId = `${workflowId}-state-${item.state}`;

      // Create or get project node
      if (!nodeMap.has(projectId)) {
        const projectNode: TreeNode = {
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
        const feedNode: TreeNode = {
          id: feedId,
          label: item.directorFeedname,
          children: [],
          level: 1,
          type: 'feed',
          count: 0
        };
        nodeMap.set(feedId, feedNode);
        nodeMap.get(projectId)!.children.push(feedNode);
      }

      // Create or get SCM node
      if (!nodeMap.has(scmId)) {
        const scmNode: TreeNode = {
          id: scmId,
          label: item.scmFeedname,
          children: [],
          level: 2,
          type: 'scm',
          count: 0
        };
        nodeMap.set(scmId, scmNode);
        nodeMap.get(feedId)!.children.push(scmNode);
      }

      // Create or get process node
      if (!nodeMap.has(processId)) {
        const processNode: TreeNode = {
          id: processId,
          label: item.matchProcess,
          children: [],
          level: 3,
          type: 'process',
          count: 0
        };
        nodeMap.set(processId, processNode);
        nodeMap.get(scmId)!.children.push(processNode);
      }

      // Create or get workflow node
      if (!nodeMap.has(workflowId)) {
        const workflowNode: TreeNode = {
          id: workflowId,
          label: item.workflow,
          children: [],
          level: 4,
          type: 'workflow',
          count: 0
        };
        nodeMap.set(workflowId, workflowNode);
        nodeMap.get(processId)!.children.push(workflowNode);
      }

      // Create state node (leaf)
      const stateNode: TreeNode = {
        id: stateId,
        label: item.state,
        children: [],
        level: 5,
        type: 'state',
        data: item,
        count: item.alertCount || 0
      };
      nodeMap.get(workflowId)!.children.push(stateNode);

      // Update counts
      nodeMap.get(projectId)!.count = (nodeMap.get(projectId)!.count || 0) + (item.alertCount || 0);
      nodeMap.get(feedId)!.count = (nodeMap.get(feedId)!.count || 0) + (item.alertCount || 0);
      nodeMap.get(scmId)!.count = (nodeMap.get(scmId)!.count || 0) + (item.alertCount || 0);
      nodeMap.get(processId)!.count = (nodeMap.get(processId)!.count || 0) + (item.alertCount || 0);
      nodeMap.get(workflowId)!.count = (nodeMap.get(workflowId)!.count || 0) + (item.alertCount || 0);
    });

    return tree;
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getNodeIcon = (node: TreeNode) => {
    if (node.type === 'state' && node.data) {
      if (node.data.validated) {
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      } else {
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      }
    }
    if (node.type === 'project') {
      return <Shield className="w-4 h-4 text-blue-600" />;
    }
    return null;
  };

  const getNodeBadge = (node: TreeNode) => {
    if (node.type === 'state' && node.data) {
      const priorityColors = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-green-100 text-green-800'
      };
      return (
        <Badge className={priorityColors[node.data.priority]}>
          {node.data.priority}
        </Badge>
      );
    }
    return null;
  };

  const renderNode = (node: TreeNode): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const indentLevel = node.level * 24;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors ${
            node.type === 'state' ? 'border-l-4 border-blue-200' : ''
          }`}
          style={{ marginLeft: `${indentLevel}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          <div className="flex items-center flex-1 gap-2">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
            
            {getNodeIcon(node)}
            
            <span className={`font-medium ${node.type === 'project' ? 'text-lg' : 'text-sm'}`}>
              {node.label}
            </span>
            
            {node.count !== undefined && (
              <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                {node.count.toLocaleString()}
              </span>
            )}
            
            {getNodeBadge(node)}
            
            {node.data && (
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs text-slate-500">
                  {node.data.owner.toUpperCase()}
                </span>
                {node.data.validated ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-yellow-600" />
                )}
              </div>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(data);

  return (
    <div className="space-y-2">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Workflow Hierarchy</h3>
          <p className="text-sm text-slate-600">
            Click to expand/collapse levels. Navigate from Director Projects to Final States.
          </p>
        </div>
        <Button onClick={downloadImage} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Image
        </Button>
      </div>
      
      <div ref={treeRef}>
        <Card className="p-4 max-h-[500px] overflow-y-auto">
          {tree.length > 0 ? (
            <div className="space-y-1">
              {tree.map(node => renderNode(node))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No workflow data matches your current filters.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TreeView;
