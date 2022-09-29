import { createHashRouter } from 'react-router-dom';
import {
  Analyze,
  Calibrate,
  Dashboard,
  History,
  HistoryDetails,
  Settings,
  Root,
  CalibrateFragment,
  SelectSequence,
  AnalyzeDetails,
} from './pages';

export const router = createHashRouter([
  {
    path: '/*',
    element: <Root />,
    children: [
      { path: '', element: <Dashboard /> },
      {
        path: 'history/*',
        element: <History />,
        children: [
          {
            path: ':entryId',
            element: <HistoryDetails />,
          },
        ],
      },
      {
        path: 'calibrate/:entryId/*',
        element: <Calibrate />,
        children: [
          {
            path: ':fragmentId',
            element: <CalibrateFragment />,
          },
        ],
      },
      { path: 'settings', element: <Settings /> },
      {
        path: 'analyze/*',
        element: <Analyze />,
        children: [
          {
            path: 'select',
            element: <SelectSequence />,
          },
          {
            path: 'details',
            element: <AnalyzeDetails />,
          },
        ],
      },
    ],
  },
]);
