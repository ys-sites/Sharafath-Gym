import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WebsiteLayout from './components/layout/WebsiteLayout';
import Home from './pages/Home';
import ProgressAnalytics from './pages/ProgressAnalytics';
import BlueprintPortal from './pages/BlueprintPortal';
import WeightTracker from './pages/WeightTracker';
import NutritionLogPage from './pages/NutritionLogPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WebsiteLayout />}>
          <Route index element={<Home />} />
          <Route path="progression" element={<ProgressAnalytics />} />
          <Route path="blueprint" element={<BlueprintPortal />} />
          <Route path="weight" element={<WeightTracker />} />
          <Route path="nutrition" element={<NutritionLogPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
