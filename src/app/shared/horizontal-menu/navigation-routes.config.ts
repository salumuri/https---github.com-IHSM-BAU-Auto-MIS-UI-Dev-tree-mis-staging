import { RouteInfo } from '../vertical-menu/vertical-menu.metadata';
import {AuthGuard} from '../auth/auth-guard.service'
export const HROUTES: RouteInfo[] = [

  {
    path: '/dashboard/dashboard', title: 'Dashboard', icon: 'ft-home', class: 'dropdown nav-item has-sub', isExternalLink: false,
    submenu: [
      // { path: '/dashboard/dashboard1', title: 'Dashboard 1', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      // { path: '/dashboard/dashboard2', title: 'Dashboard 2', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] }
    ]
  },
  {
    path: '', title: 'Input Tools', icon: 'ft-zap', class: 'dropdown nav-item has-sub', isExternalLink: false,
    submenu: [
      { path: '/inputs/maps',  title: 'Maps',  icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/work-allotment', title: 'Work Allotment', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/checklist', title: 'Check List', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/single-timeentry', title: 'Time Sheet Entry', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      // {
      //   path: '', title: 'Masters', icon: 'ft-arrow-right submenu-icon', class: 'has-sub', isExternalLink: false,
      //   submenu: [
      //     { path: '/masters/workstreams-services', title: 'Workstream/Service', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      //     { path: '/masters/workstream-user-access', title: 'Workstream User Access', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
          
      //   ]
      // },

     // { path: '/inputs/feedback-entry', title: 'Feedback Entry', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },

    ]
  },
  {
    path: '', title: 'Reports', icon: 'ft-layers', class: 'dropdown nav-item has-sub', isExternalLink: false,
    submenu: [
      { path: '/reports/attendance-report', title: 'Attendance Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/reports/delivery-report', title: 'Delivery Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/reports/daily-log', title: 'Daily Log', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/reports/employee-details', title: 'Employee Details', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/reports/qcfeedbackreport', title: 'QC FeedBack Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: []},
      // { path: '/reports/projections', title: 'Projections', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      // { path: '/reports/realization', title: 'Realization', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      // { path: '/reports/sync', title: 'E3 Sync', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      //{ path: '/reports/user-feedback-list', title: 'User Feedback Errors List', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      //{ path: '/reports/controltower', title: 'Control Tower', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
    
      { path: '/masters/work-flow', title: 'Work Flow', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/attendance-management', title: 'Attendance Management', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] }
    ]
  },
  {
    path: '', title: 'Admin', icon: 'ft-user-check', class: 'dropdown nav-item has-sub', isExternalLink: false,
    submenu: [
    { path: '/masters/workstreams-services', title: 'Workstream/Service', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
    { path: '/masters/workstream-user-access', title: 'Workstream User Access', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
    // { path: '/reports/master-report', title: 'Master Reports', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
    // { path: '/reports/time-spent-details', title: 'Time Spent Details', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
    // { path: '/reports/ondemand-report', title: 'OnDemand Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
    // { path: '/reports/training-info', title: 'Training Information', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
    // { path: '/reports/patr-entry-report', title: 'PART', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
    // { path: '/reports/patr-entry', title: 'PART Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
    ]
  },

  {
    path: '', title: 'Client Reports', icon: 'ft-user-check', class: 'dropdown nav-item has-sub', isExternalLink: false,
    submenu: [
      { path: '/inputs/view-feedback', title: 'View Feedback', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/ClientDashboard/demand-supply-report', title: 'DashBoard Reports', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/ClientDashboard/sla-tracker', title: 'SLA Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },

      { path: '/inputs/ClientDashboard/kpi-report', title: 'KPI Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/ClientDashboard/upload-data', title: 'Upload DashBoard Data', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
    ]
  },

];



export const HROUTES2: RouteInfo[] = [

  {
    path: '/dashboard/dashboard', title: 'Dashboard', icon: 'ft-home', class: 'dropdown nav-item has-sub', isExternalLink: false,
    submenu: [
      // { path: '/dashboard/dashboard1', title: 'Dashboard 1', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      // { path: '/dashboard/dashboard2', title: 'Dashboard 2', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] }
    ]
  },
  {
    path: '', title: 'Input Tools', icon: 'ft-aperture', class: 'dropdown nav-item has-sub', isExternalLink: false,
    submenu: [
      { path: '/inputs/maps', title: 'Maps', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/work-allotment', title: 'Work Allotment', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      // { path: '/inputs/checklist', title: 'Check List', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/single-timeentry', title: 'Time Sheet Entry', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
    ]
  },
  {
    path: '', title: 'Reports', icon: 'ft-layers', class: 'dropdown nav-item has-sub', isExternalLink: false,
    submenu: [
      { path: '/reports/attendance-report', title: 'Attendance Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/reports/delivery-report', title: 'Delivery Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/reports/daily-log', title: 'Daily Log', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/reports/employee-details', title: 'Employee Details', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/masters/work-flow', title: 'Work Flow', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/reports/qcfeedbackreport', title: 'QC FeedBack Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: []},
      // { path: '/reports/projections', title: 'Projections', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      // { path: '/reports/sync', title: 'E3 Sync', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      // { path: '/reports/ondemand-report', title: 'OnDemand Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      // { path: '/reports/training-info', title: 'Training Info', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
    ]
  }

];





export const CLIENTDASHBOARD: RouteInfo[] = [

  {
    path: '/dashboard/dashboard', title: 'Dashboard', icon: 'ft-home', class: 'dropdown nav-item has-sub', isExternalLink: false,
    submenu: [
      // { path: '/dashboard/dashboard1', title: 'Dashboard 1', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      // { path: '/dashboard/dashboard2', title: 'Dashboard 2', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] }
    ]
  },
  {
    path: '', title: 'Input Tools', icon: 'ft-aperture', class: 'dropdown nav-item has-sub', isExternalLink: false,
    submenu: [
     // { path: '/inputs/view-feedback', title: 'View Feedback', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/feedback-entry', title: 'Feedback Entry', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/ClientDashboard/demand-supply-report', title: 'DashBoard Reports', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/ClientDashboard/sla-tracker', title: 'SLA Reports', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
    ]
  }


];

export const HROUTES3: RouteInfo[] = [

  {
    path: '/dashboard/dashboard', title: 'Dashboard', icon: 'ft-home', class: 'dropdown nav-item has-sub', isExternalLink: false,
    submenu: [
      // { path: '/dashboard/dashboard1', title: 'Dashboard 1', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      // { path: '/dashboard/dashboard2', title: 'Dashboard 2', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] }
    ]
  },
  {
    path: '', title: 'Input Tools', icon: 'ft-zap', class: 'dropdown nav-item has-sub', isExternalLink: false,
    submenu: [
      { path: '/inputs/maps',  title: 'Maps',  icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/work-allotment', title: 'Work Allotment', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/checklist', title: 'Check List', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/single-timeentry', title: 'Time Sheet Entry', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      // {
      //   path: '', title: 'Masters', icon: 'ft-arrow-right submenu-icon', class: 'has-sub', isExternalLink: false,
      //   submenu: [
      //     { path: '/masters/workstreams-services', title: 'Workstream/Service', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      //     { path: '/masters/workstream-user-access', title: 'Workstream User Access', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
          
      //   ]
      // },

     // { path: '/inputs/feedback-entry', title: 'Feedback Entry', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },

    ]
  },
  {
    path: '', title: 'Reports', icon: 'ft-layers', class: 'dropdown nav-item has-sub', isExternalLink: false,
    submenu: [
      { path: '/reports/attendance-report', title: 'Attendance Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/reports/delivery-report', title: 'Delivery Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/reports/daily-log', title: 'Daily Log', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/reports/employee-details', title: 'Employee Details', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/reports/qcfeedbackreport', title: 'QC FeedBack Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: []},
      // { path: '/reports/projections', title: 'Projections', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      // { path: '/reports/realization', title: 'Realization', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/reports/sync', title: 'E3 Sync', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      //{ path: '/reports/user-feedback-list', title: 'User Feedback Errors List', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      //{ path: '/reports/controltower', title: 'Control Tower', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
    
      { path: '/masters/work-flow', title: 'Work Flow', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/inputs/attendance-management', title: 'Attendance Management', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] }
    ]
  }

 
];

// export const E3Sync: RouteInfo[] = [

//   {
//     path: '/dashboard/dashboard', title: 'Dashboard', icon: 'ft-home', class: 'dropdown nav-item has-sub', isExternalLink: false,
//     submenu: [
//       // { path: '/dashboard/dashboard1', title: 'Dashboard 1', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
//       // { path: '/dashboard/dashboard2', title: 'Dashboard 2', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] }
//     ]
//   },
//   {
//     path: '', title: 'Input Tools', icon: 'ft-aperture', class: 'dropdown nav-item has-sub', isExternalLink: false,
//     submenu: [
//       { path: '/inputs/maps', title: 'Maps', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
//       { path: '/inputs/work-allotment', title: 'Work Allotment', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
//       // { path: '/inputs/checklist', title: 'Check List', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
//       { path: '/inputs/single-timeentry', title: 'Time Sheet Entry', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
//     ]
//   },
//   {
//     path: '', title: 'Reports', icon: 'ft-layers', class: 'dropdown nav-item has-sub', isExternalLink: false,
//     submenu: [
//       { path: '/reports/attendance-report', title: 'Attendance Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
//       { path: '/reports/delivery-report', title: 'Delivery Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
//       { path: '/reports/daily-log', title: 'Daily Log', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
//       { path: '/reports/employee-details', title: 'Employee Details', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
//       { path: '/masters/work-flow', title: 'Work Flow', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
//       // { path: '/reports/projections', title: 'Projections', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
//       { path: '/reports/qcfeedbackreport', title: 'QC FeedBack Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: []},
//       { path: '/reports/sync', title: 'E3 Sync', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
//       // { path: '/reports/ondemand-report', title: 'OnDemand Report', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
//       // { path: '/reports/training-info', title: 'Training Info', icon: 'ft-arrow-right submenu-icon', class: 'dropdown-item', isExternalLink: false, submenu: [] },
//     ]
//   }

// ];
