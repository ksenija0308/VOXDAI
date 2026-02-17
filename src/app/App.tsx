import { BrowserRouter } from 'react-router-dom';
import { FormProvider } from '../context/FormContext';
import { LogoProvider } from '../context/LogoContext';
import AppContent from './AppContent';
import { Toaster } from './components/ui/toaster';
import CookieBanner from './components/CookieBanner';

export default function App() {
  return (
    <BrowserRouter>
      <LogoProvider>
        <FormProvider>
          <div className="min-h-screen bg-white">
            <Toaster position="top-right" closeButton />
            <AppContent />
            <CookieBanner />
          </div>
        </FormProvider>
      </LogoProvider>
    </BrowserRouter>
  );
}
