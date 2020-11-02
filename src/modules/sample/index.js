import React from 'react';

export const samplePagesConfig = [
  {
    auth: ['user'],
    routes: [
      {
        path: '/sample/page-1',
        component: React.lazy(() => import('./Pages/PageOne')),
      },
    ],
  },
  {
    auth: ['user'],
    routes: [
      {
        path: '/sample/page-2',
        component: React.lazy(() => import('./Pages/PageTwo')),
      },
    ],
  },
  {
    auth: ['user'],
    routes: [
      {
        path: '/sample/page-3',
        component: React.lazy(() => import('./Pages/PageThree')),
      },
    ],
  },
  {
    auth: ['user'],
    routes: [
      {
        path: '/sample/page-4',
        component: React.lazy(() => import('./Pages/PageFour')),
      },
    ],
  },
  {
    auth: ['user'],
    routes: [
      {
        path: '/sample/page-1',
        component: React.lazy(() => import('./Pages/PageOne')),
      },
    ],
  },
  {
    auth: ['user'],
    routes: [
      {
        path: '/sample/page-1',
        component: React.lazy(() => import('./Pages/PageOne')),
      },
    ],
  },
  {
    auth: ['user'],
    routes: [
      {
        path: '/sample/page-7',
        component: React.lazy(() => import('./Pages/PageSeven')),
      },
    ],
  },
  {
    auth: ['user'],
    routes: [
      {
        path: '/sample/page-1',
        component: React.lazy(() => import('./Pages/PageOne')),
      },
    ],
  },
  {
    auth: ['user'],
    routes: [
      {
        path: '/sample/Admin/Tenant',
        component: React.lazy(() => import('./Admin/Tenant')),
      },
    ],
  },
];
