
export interface WorkflowData {
  directorProject: string;
  directorFeedname: string;
  scmFeedname: string;
  matchProcess: string;
  scmSource: string;
  workflow: string;
  state: string;
  priority: 'high' | 'medium' | 'low';
  validated: boolean;
  owner: 'ops' | 'tech' | 'dm';
  alertCount?: number;
}

export const mockWorkflowData: WorkflowData[] = [
  {
    directorProject: 'Sanctions',
    directorFeedname: 'OFAC_Screening',
    scmFeedname: 'OFAC_SDN_Feed',
    matchProcess: 'Name_Match_Fuzzy',
    scmSource: 'Treasury_OFAC',
    workflow: 'Auto_Review',
    state: 'Reviewed',
    priority: 'high',
    validated: true,
    owner: 'tech',
    alertCount: 1250
  },
  {
    directorProject: 'Sanctions',
    directorFeedname: 'OFAC_Screening',
    scmFeedname: 'OFAC_SDN_Feed',
    matchProcess: 'Name_Match_Exact',
    scmSource: 'Treasury_OFAC',
    workflow: 'Manual_Review',
    state: 'Pending_Review',
    priority: 'high',
    validated: true,
    owner: 'ops',
    alertCount: 890
  },
  {
    directorProject: 'Fraud',
    directorFeedname: 'Transaction_Monitor',
    scmFeedname: 'High_Risk_Transactions',
    matchProcess: 'Amount_Threshold',
    scmSource: 'Core_Banking',
    workflow: 'Auto_Block',
    state: 'Blocked',
    priority: 'high',
    validated: false,
    owner: 'ops',
    alertCount: 2100
  },
  {
    directorProject: 'Fraud',
    directorFeedname: 'Transaction_Monitor',
    scmFeedname: 'Velocity_Check',
    matchProcess: 'Frequency_Analysis',
    scmSource: 'Payment_Gateway',
    workflow: 'Manual_Investigation',
    state: 'Under_Investigation',
    priority: 'medium',
    validated: true,
    owner: 'dm',
    alertCount: 750
  },
  {
    directorProject: 'AML',
    directorFeedname: 'Customer_Risk',
    scmFeedname: 'PEP_Screening',
    matchProcess: 'Profile_Match',
    scmSource: 'Third_Party_Data',
    workflow: 'Enhanced_Due_Diligence',
    state: 'EDD_Required',
    priority: 'high',
    validated: true,
    owner: 'ops',
    alertCount: 450
  },
  {
    directorProject: 'AML',
    directorFeedname: 'Customer_Risk',
    scmFeedname: 'SAR_Generation',
    matchProcess: 'Behavior_Analysis',
    scmSource: 'Transaction_History',
    workflow: 'SAR_Filing',
    state: 'Filed',
    priority: 'high',
    validated: true,
    owner: 'ops',
    alertCount: 320
  },
  {
    directorProject: 'KYC',
    directorFeedname: 'Identity_Verification',
    scmFeedname: 'Document_Check',
    matchProcess: 'OCR_Validation',
    scmSource: 'Document_Scanner',
    workflow: 'Auto_Approve',
    state: 'Approved',
    priority: 'low',
    validated: true,
    owner: 'tech',
    alertCount: 5500
  },
  {
    directorProject: 'KYC',
    directorFeedname: 'Identity_Verification',
    scmFeedname: 'Biometric_Check',
    matchProcess: 'Face_Match',
    scmSource: 'Biometric_System',
    workflow: 'Manual_Verification',
    state: 'Verification_Failed',
    priority: 'medium',
    validated: false,
    owner: 'ops',
    alertCount: 180
  },
  {
    directorProject: 'Credit',
    directorFeedname: 'Risk_Assessment',
    scmFeedname: 'Credit_Score_Feed',
    matchProcess: 'Score_Threshold',
    scmSource: 'Credit_Bureau',
    workflow: 'Auto_Decline',
    state: 'Declined',
    priority: 'medium',
    validated: true,
    owner: 'tech',
    alertCount: 3200
  },
  {
    directorProject: 'Credit',
    directorFeedname: 'Risk_Assessment',
    scmFeedname: 'Income_Verification',
    matchProcess: 'Document_Analysis',
    scmSource: 'Bank_Statements',
    workflow: 'Manual_Review',
    state: 'Pending_Documents',
    priority: 'low',
    validated: true,
    owner: 'dm',
    alertCount: 1100
  },
  {
    directorProject: 'Sanctions',
    directorFeedname: 'EU_Sanctions',
    scmFeedname: 'EU_Consolidated_List',
    matchProcess: 'Name_Match_Phonetic',
    scmSource: 'EU_Commission',
    workflow: 'Auto_Flag',
    state: 'Flagged',
    priority: 'high',
    validated: true,
    owner: 'ops',
    alertCount: 680
  },
  {
    directorProject: 'Fraud',
    directorFeedname: 'Device_Fingerprint',
    scmFeedname: 'Device_Risk_Score',
    matchProcess: 'Risk_Scoring',
    scmSource: 'Device_Intelligence',
    workflow: 'Challenge_Authentication',
    state: 'Challenge_Sent',
    priority: 'medium',
    validated: false,
    owner: 'tech',
    alertCount: 920
  }
];
