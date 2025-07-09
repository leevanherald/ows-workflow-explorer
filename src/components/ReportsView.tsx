
import React, { useState } from 'react';
import { Mail, Download, Calendar, FileSpreadsheet, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { WorkflowData } from '@/data/mockData';
import * as XLSX from 'xlsx';

interface ReportsViewProps {
  data: WorkflowData[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ data }) => {
  const [emailList, setEmailList] = useState<string[]>(['']);
  const [reportFrequency, setReportFrequency] = useState('weekly');
  const [selectedViews, setSelectedViews] = useState({
    tree: true,
    flowchart: true,
    table: true,
    sankey: true,
    summary: true
  });
  const [reportName, setReportName] = useState('OWS Workflow Report');

  const addEmailField = () => {
    setEmailList([...emailList, '']);
  };

  const updateEmail = (index: number, email: string) => {
    const updated = [...emailList];
    updated[index] = email;
    setEmailList(updated);
  };

  const removeEmail = (index: number) => {
    if (emailList.length > 1) {
      setEmailList(emailList.filter((_, i) => i !== index));
    }
  };

  const generateExcelReport = () => {
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    if (selectedViews.summary) {
      const uniqueProjects = [...new Set(data.map(item => item.directorProject))];
      const uniqueStates = [...new Set(data.map(item => item.state))];
      const uniqueWorkflows = [...new Set(data.map(item => item.workflow))];
      
      const summaryData = [
        ['Report Name', reportName],
        ['Generated On', new Date().toLocaleDateString()],
        ['Total Workflows', data.length],
        ['Unique Projects', uniqueProjects.length],
        ['Unique States', uniqueStates.length],
        ['Unique Workflow Types', uniqueWorkflows.length],
        [''],
        ['Project Breakdown'],
        ...uniqueProjects.map(project => [
          project,
          data.filter(item => item.directorProject === project).length
        ])
      ];

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWs, 'Summary');
    }

    // Detailed Data Sheet
    if (selectedViews.table) {
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

      const tableData = [
        headers,
        ...data.map(row => [
          row.directorProject,
          row.directorFeedname,
          row.scmFeedname,
          row.matchProcess,
          row.scmSource,
          row.workflow,
          row.state,
          row.priority,
          row.validated ? 'Yes' : 'No',
          row.owner,
          row.alertCount || 0
        ])
      ];

      const dataWs = XLSX.utils.aoa_to_sheet(tableData);
      XLSX.utils.book_append_sheet(workbook, dataWs, 'Workflow Data');
    }

    // State Analysis Sheet
    if (selectedViews.tree) {
      const stateAnalysis = [...new Set(data.map(item => item.state))].map(state => {
        const stateData = data.filter(item => item.state === state);
        return [
          state,
          stateData.length,
          stateData.filter(item => item.validated).length,
          stateData.reduce((sum, item) => sum + (item.alertCount || 0), 0)
        ];
      });

      const stateWs = XLSX.utils.aoa_to_sheet([
        ['State', 'Count', 'Validated', 'Total Alerts'],
        ...stateAnalysis
      ]);
      XLSX.utils.book_append_sheet(workbook, stateWs, 'State Analysis');
    }

    // Save the file
    const fileName = `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const generateEmailContent = () => {
    const validEmails = emailList.filter(email => email.trim() && email.includes('@'));
    
    if (validEmails.length === 0) {
      alert('Please add at least one valid email address');
      return;
    }

    const emailBody = `Subject: ${reportName} - ${new Date().toLocaleDateString()}

Dear Team,

Please find attached the ${reportName} containing the latest workflow data analysis.

Report Details:
- Total Workflows: ${data.length}
- Generated On: ${new Date().toLocaleDateString()}
- Frequency: ${reportFrequency}

The report includes:
${selectedViews.summary ? '✓ Executive Summary\n' : ''}${selectedViews.table ? '✓ Detailed Workflow Data\n' : ''}${selectedViews.tree ? '✓ State Analysis\n' : ''}${selectedViews.flowchart ? '✓ Process Flow Analysis\n' : ''}${selectedViews.sankey ? '✓ Data Flow Visualization\n' : ''}

Best regards,
OWS Workflow Explorer`;

    // Create a mailto link with pre-filled content
    const mailtoLink = `mailto:${validEmails.join(',')}?subject=${encodeURIComponent(reportName + ' - ' + new Date().toLocaleDateString())}&body=${encodeURIComponent(emailBody)}`;
    
    // Generate the Excel file first
    generateExcelReport();
    
    // Open email client
    window.location.href = mailtoLink;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Reports & Email Distribution</h3>
        <p className="text-sm text-slate-600">
          Configure and send comprehensive workflow reports to stakeholders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Recipients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Report Name
              </label>
              <Input
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Email Addresses
              </label>
              <div className="space-y-2">
                {emailList.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeEmail(index)}
                      disabled={emailList.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addEmailField}
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Email
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Report Frequency
              </label>
              <Select value={reportFrequency} onValueChange={setReportFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="adhoc">Ad-hoc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Report Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block">
                Include in Report
              </label>
              <div className="space-y-3">
                {[
                  { key: 'summary', label: 'Executive Summary', desc: 'High-level statistics and KPIs' },
                  { key: 'table', label: 'Detailed Data Table', desc: 'Complete workflow dataset' },
                  { key: 'tree', label: 'State Analysis', desc: 'Workflow state breakdown' },
                  { key: 'flowchart', label: 'Process Flow Analysis', desc: 'Visual process mapping' },
                  { key: 'sankey', label: 'Data Flow Visualization', desc: 'End-to-end flow diagrams' }
                ].map((view) => (
                  <div key={view.key} className="flex items-start space-x-2">
                    <Checkbox
                      id={view.key}
                      checked={selectedViews[view.key as keyof typeof selectedViews]}
                      onCheckedChange={(checked) => 
                        setSelectedViews(prev => ({ ...prev, [view.key]: checked }))
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={view.key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {view.label}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {view.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview & Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview & Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {data.length} workflows
              </Badge>
              <Badge variant="outline">
                {emailList.filter(email => email.trim() && email.includes('@')).length} recipients
              </Badge>
              <Badge variant="outline">
                {reportFrequency} frequency
              </Badge>
              <Badge variant="outline">
                {Object.values(selectedViews).filter(Boolean).length} sections
              </Badge>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={generateExcelReport}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Excel Only
              </Button>
              
              <Button
                onClick={generateEmailContent}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Generate Email & Excel
              </Button>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
              <strong>Note:</strong> Clicking "Generate Email & Excel" will download the Excel file and open your default email client with pre-filled content. 
              You'll need to manually attach the downloaded Excel file to the email before sending.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsView;
