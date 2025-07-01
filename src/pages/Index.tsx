
import React, { useState } from 'react';
import { Search, Filter, Download, TreePine, GitBranch, Table, Grid3X3, Flame, FileImage, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TreeView from '@/components/TreeView';
import FlowchartView from '@/components/FlowchartView';
import TabularView from '@/components/TabularView';
import MatrixView from '@/components/MatrixView';
import HeatmapView from '@/components/HeatmapView';
import SearchableSelect from '@/components/SearchableSelect';
import { mockWorkflowData } from '@/data/mockData';
import { exportDataAsCSV, exportFlowchartAsPDF, exportFlowchartAsImage } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

type ViewType = 'tree' | 'flowchart' | 'table' | 'matrix' | 'heatmap';

const Index = () => {
  const [activeView, setActiveView] = useState<ViewType>('flowchart');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const { toast } = useToast();

  const filteredData = mockWorkflowData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      Object.values(item).some(value => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesProject = filterProject === 'all' || item.directorProject === filterProject;
    const matchesState = filterState === 'all' || item.state === filterState;
    
    return matchesSearch && matchesProject && matchesState;
  });

  const uniqueProjects = [...new Set(mockWorkflowData.map(item => item.directorProject))];
  const uniqueStates = [...new Set(mockWorkflowData.map(item => item.state))];

  const projectOptions = [
    { value: 'all', label: 'All Projects' },
    ...uniqueProjects.map(project => ({ value: project, label: project }))
  ];

  const stateOptions = [
    { value: 'all', label: 'All States' },
    ...uniqueStates.map(state => ({ value: state, label: state }))
  ];

  const handleExportData = async () => {
    try {
      exportDataAsCSV(filteredData, 'ows-workflow-data');
      toast({
        title: "Export Successful",
        description: "Workflow data has been exported as CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportFlowchartPDF = async () => {
    try {
      await exportFlowchartAsPDF('flowchart-container', `ows-flowchart-${filterProject}`);
      toast({
        title: "Export Successful",
        description: "Flowchart has been exported as PDF",
      });
    } catch (error) {
      toast({
        title: "Export Failed", 
        description: "Failed to export flowchart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportFlowchartImage = async () => {
    try {
      await exportFlowchartAsImage('flowchart-container', `ows-flowchart-${filterProject}`);
      toast({
        title: "Export Successful",
        description: "Flowchart has been exported as PNG image",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export flowchart. Please try again.", 
        variant: "destructive",
      });
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'tree':
        return <TreeView data={filteredData} />;
      case 'flowchart':
        return <div id="flowchart-container"><FlowchartView data={filteredData} /></div>;
      case 'table':
        return <TabularView data={filteredData} />;
      case 'matrix':
        return <MatrixView data={filteredData} />;
      case 'heatmap':
        return <HeatmapView data={filteredData} />;
      default:
        return <div id="flowchart-container"><FlowchartView data={filteredData} /></div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <div className="container mx-auto p-6 max-w-7xl flex-1 flex flex-col">
        {/* Enhanced Header with Gradient */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-gradient-hero rounded-2xl p-8 text-white shadow-xl mb-6">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30">
                <img 
                  src="/lovable-uploads/07918255-54de-4fea-b309-b3562bb915c4.png" 
                  alt="Barclays Logo" 
                  className="h-12 w-auto"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-5xl font-bold mb-3 text-gradient bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  OWS Workflow Explorer
                </h1>
                <p className="text-white/90 text-xl leading-relaxed">
                  Visualize and analyze end-to-end alert workflows from Director Projects to Final States
                </p>
                <div className="mt-4 flex items-center gap-4 text-white/80">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Real-time monitoring
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    Interactive visualization
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls with Glass Effect */}
        <Card className="mb-8 glass animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant={activeView === 'tree' ? 'premium' : 'outline'}
                  onClick={() => setActiveView('tree')}
                  className="flex items-center gap-2 transition-all duration-300"
                >
                  <TreePine className="w-4 h-4" />
                  Tree View
                </Button>
                <Button
                  variant={activeView === 'flowchart' ? 'premium' : 'outline'}
                  onClick={() => setActiveView('flowchart')}
                  className="flex items-center gap-2 transition-all duration-300"
                >
                  <GitBranch className="w-4 h-4" />
                  Flowchart
                </Button>
                <Button
                  variant={activeView === 'table' ? 'premium' : 'outline'}
                  onClick={() => setActiveView('table')}
                  className="flex items-center gap-2 transition-all duration-300"
                >
                  <Table className="w-4 h-4" />
                  Table View
                </Button>
                <Button
                  variant={activeView === 'matrix' ? 'premium' : 'outline'}
                  onClick={() => setActiveView('matrix')}
                  className="flex items-center gap-2 transition-all duration-300"
                >
                  <Grid3X3 className="w-4 h-4" />
                  Matrix View
                </Button>
                <Button
                  variant={activeView === 'heatmap' ? 'premium' : 'outline'}
                  onClick={() => setActiveView('heatmap')}
                  className="flex items-center gap-2 transition-all duration-300"
                >
                  <Flame className="w-4 h-4" />
                  Heatmap
                </Button>
              </div>
              <div className="flex items-center gap-3">
                {activeView === 'flowchart' && (
                  <>
                    <Button onClick={handleExportFlowchartPDF} variant="secondary" size="sm" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Export PDF
                    </Button>
                    <Button onClick={handleExportFlowchartImage} variant="secondary" size="sm" className="flex items-center gap-2">
                      <FileImage className="w-4 h-4" />
                      Export PNG
                    </Button>
                  </>
                )}
                <Button onClick={handleExportData} variant="success" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
              </div>
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
                  <SearchableSelect
                    value={filterProject}
                    onValueChange={setFilterProject}
                    options={projectOptions}
                    placeholder="Filter by Project"
                    className="w-48"
                  />
                  <SearchableSelect
                    value={filterState}
                    onValueChange={setFilterState}
                    options={stateOptions}
                    placeholder="Filter by State"
                    className="w-48"
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Enhanced Main Content with Animations */}
        <div className="flex-1 flex flex-col animate-scale-in">
          {activeView === 'flowchart' ? (
            <div className="flex-1 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
              {renderView()}
            </div>
          ) : (
            <Card className="flex-1 flex flex-col card-elevated">
              <CardContent className="p-8 flex-1">
                {renderView()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enhanced Stats Footer with Gradients */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
          <Card className="card-interactive group">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                {filteredData.length}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Total Workflows</div>
            </CardContent>
          </Card>
          <Card className="card-interactive group">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                {uniqueProjects.length}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Director Projects</div>
            </CardContent>
          </Card>
          <Card className="card-interactive group">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                {uniqueStates.length}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Unique States</div>
            </CardContent>
          </Card>
          <Card className="card-interactive group">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                {[...new Set(mockWorkflowData.map(item => item.workflow))].length}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Workflow Types</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
