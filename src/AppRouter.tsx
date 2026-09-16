import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { Layout } from './components/Layout';

import Index from './pages/Index';
import { NIP19Page } from './pages/NIP19Page';
import NotFound from './pages/NotFound';

const MethodologyPage = lazy(() => import('./pages/MethodologyPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const AppPage = lazy(() => import('./pages/AppPage'));
const DevelopersPage = lazy(() => import('./pages/DevelopersPage'));
const UpdatesPage = lazy(() => import('./pages/UpdatesPage'));
const UpdatePage = lazy(() => import('./pages/UpdatePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/app/:naddr" element={<AppPage />} />
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="/updates" element={<UpdatesPage />} />
          <Route path="/updates/:naddr" element={<UpdatePage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
          <Route path="/:nip19" element={<NIP19Page />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;
