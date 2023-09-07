import { Routes, RouterModule } from '@angular/router';

//Route for content layout with sidebar, navbar and footer.

export const Full_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('../../dashboard/dashboard.module').then(m => m.DashboardModule)
  },

  {
    path: 'inputs',
    loadChildren: () => import('../../inputs/inputs.module').then(m => m.InputsModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('../../reports/reports.module').then(m => m.ReportsModule)
  },
  {
    path: 'masters',
    loadChildren: () => import('../../masters/master.module').then(m => m.MasterModule)
  },
  {
    path: 'components',
    loadChildren: () => import('../../components/ui-components.module').then(m => m.UIComponentsModule)
  },
  {
    path: 'pages',
    loadChildren: () => import('../../pages/full-pages/full-pages.module').then(m => m.FullPagesModule)
  },
  // {
  //   path: 'cards',
  //   loadChildren: () => import('../../cards/cards.module').then(m => m.CardsModule)
  // },
  // {
  //   path: 'chat',
  //   loadChildren: () => import('../../chat/chat.module').then(m => m.ChatModule)
  // },
  // {
  //   path: 'chat-ngrx',
  //   loadChildren: () => import('../../chat-ngrx/chat-ngrx.module').then(m => m.ChatNGRXModule)
  // },
  // {
  //   path: 'inbox',
  //   loadChildren: () => import('../../inbox/inbox.module').then(m => m.InboxModule)
  // },
  // {
  //   path: 'taskboard',
  //   loadChildren: () => import('../../taskboard/taskboard.module').then(m => m.TaskboardModule)
  // },
  // {
  //   path: 'taskboard-ngrx',
  //   loadChildren: () => import('../../taskboard-ngrx/taskboard-ngrx.module').then(m => m.TaskboardNGRXModule)
  // }
];
