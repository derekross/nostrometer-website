import { createRoot } from 'react-dom/client';

// Import polyfills first
import './lib/polyfills.ts';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// Display (Archivo, with its width axis), body (Public Sans) and mono (JetBrains Mono).
import '@fontsource-variable/archivo/standard.css';
import '@fontsource-variable/public-sans';
import '@fontsource-variable/jetbrains-mono';

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
