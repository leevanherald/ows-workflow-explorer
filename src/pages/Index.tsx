
import React, { useState } from 'react';
import { Search, Filter, Download, TreePine, GitBranch, Table } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TreeView from '@/components/TreeView';
import FlowchartView from '@/components/FlowchartView';
import TabularView from '@/components/TabularView';
import { mockWorkflowData } from '@/data/mockData';

type ViewType = 'tree' | 'flowchart' | 'table';

const Index = () => {
  const [activeView, setActiveView] = useState<ViewType>('flowchart');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterState, setFilterState] = useState('all');

  const filteredData = mockWorkflowData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      Object.values(item).some(value => 
        value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesProject = filterProject === 'all' || item.directorProject === filterProject;
    const matchesState = filterState === 'all' || item.state === filterState;
    
    return matchesSearch && matchesProject && matchesState;
  });

  const uniqueProjects = [...new Set(mockWorkflowData.map(item => item.directorProject))];
  const uniqueStates = [...new Set(mockWorkflowData.map(item => item.state))];

  const renderView = () => {
    switch (activeView) {
      case 'tree':
        return <TreeView data={filteredData} />;
      case 'flowchart':
        return <FlowchartView data={filteredData} />;
      case 'table':
        return <TabularView data={filteredData} />;
      default:
        return <FlowchartView data={filteredData} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="container mx-auto p-6 max-w-7xl flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src="/lovable-uploads/07918255-54de-4fea-b309-b3562bb915c4.png" 
              alt="Barclays Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">OWS Workflow Explorer</h1>
              <p className="text-slate-600 text-lg">
                Visualize and analyze end-to-end alert workflows from Director Projects to Final States
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={activeView === 'tree' ? 'default' : 'outline'}
                  onClick={() => setActiveView('tree')}
                  className="flex items-center gap-2"
                >
                  <TreePine className="w-4 h-4" />
                  Tree View
                </Button>
                <Button
                  variant={activeView === 'flowchart' ? 'default' : 'outline'}
                  onClick={() => setActiveView('flowchart')}
                  className="flex items-center gap-2"
                >
                  <GitBranch className="w-4 h-4" />
                  Flowchart
                </Button>
                <Button
                  variant={activeView === 'table' ? 'default' : 'outline'}
                  onClick={() => setActiveView('table')}
                  className="flex items-center gap-2"
                >
                  <Table className="w-4 h-4" />
                  Table View
                </Button>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Data
              </Button>
            </div>
          </CardHeader>
          {(activeView === 'tree' || activeView === 'table') && (
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search workflows, feeds, or states..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterProject} onValueChange={setFilterProject}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by Project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {uniqueProjects.map(project => (
                        <SelectItem key={project} value={project}>{project}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterState} onValueChange={setFilterState}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {uniqueStates.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {activeView === 'flowchart' ? (
            <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
              {renderView()}
            </div>
          ) : (
            <Card className="flex-1 flex flex-col">
              <CardContent className="p-6 flex-1">
                {renderView()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
              <div className="text-sm text-slate-600">Total Workflows</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{uniqueProjects.length}</div>
              <div className="text-sm text-slate-600">Director Projects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{uniqueStates.length}</div>
              <div className="text-sm text-slate-600">Unique States</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {[...new Set(mockWorkflowData.map(item => item.workflow))].length}
              </div>
              <div className="text-sm text-slate-600">Workflow Types</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
