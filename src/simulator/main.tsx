import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { I18nProvider } from '../i18n/I18nProvider.tsx';
import '../styles.css';
import SimulatorApp from './SimulatorApp.tsx';

const container = document.querySelector('#root');
if (!container) throw new Error('Missing #root element');

createRoot(container).render(
  <StrictMode>
    <I18nProvider page="simulator">
      <SimulatorApp />
    </I18nProvider>
  </StrictMode>,
);
