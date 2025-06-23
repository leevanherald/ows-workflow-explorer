
export const mockWorkflowData = [
  {
    directorProject: "Risk Management",
    directorFeedname: "Market Data Feed",
    scmFeedname: "Bloomberg Terminal",
    matchProcess: "Price Validation",
    workflow: "Real-time Price Check",
    state: "Completed",
    alertCount: 1250
  },
  {
    directorProject: "Risk Management", 
    directorFeedname: "Market Data Feed",
    scmFeedname: "Reuters Feed",
    matchProcess: "Price Validation",
    workflow: "Real-time Price Check",
    state: "Failed",
    alertCount: 45
  },
  {
    directorProject: "Compliance",
    directorFeedname: "Transaction Monitor",
    scmFeedname: "SWIFT Network",
    matchProcess: "AML Screening",
    workflow: "KYC Assessment",
    state: "In Progress",
    alertCount: 320
  },
  {
    directorProject: "Operations",
    directorFeedname: "Settlement Feed", 
    scmFeedname: "Clearstream",
    matchProcess: "Trade Settlement",
    workflow: "T+2 Settlement",
    state: "Completed",
    alertCount: 890
  },
  {
    directorProject: "Risk Management",
    directorFeedname: "Credit Risk Feed",
    scmFeedname: "Internal Systems",
    matchProcess: "Credit Scoring",
    workflow: "Daily Credit Review",
    state: "Pending Review",
    alertCount: 156
  },
  {
    directorProject: "Compliance",
    directorFeedname: "Regulatory Reporting",
    scmFeedname: "MiFID II System",
    matchProcess: "Transaction Reporting",
    workflow: "Daily Regulatory Submit",
    state: "Completed", 
    alertCount: 2340
  },
  {
    directorProject: "Operations",
    directorFeedname: "Reconciliation Feed",
    scmFeedname: "Nostro Accounts",
    matchProcess: "Balance Reconciliation", 
    workflow: "Daily Recon Process",
    state: "Exception",
    alertCount: 78
  },
  {
    directorProject: "Risk Management",
    directorFeedname: "VaR Calculation",
    scmFeedname: "Market Risk Engine",
    matchProcess: "Portfolio Analysis",
    workflow: "VaR Computation",
    state: "Completed",
    alertCount: 445
  }
];
