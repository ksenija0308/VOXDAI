import { BrowserRouter } from 'react-router-dom';
import { FormProvider } from '../context/FormContext';
import AppContent from './AppContent';
import { Toaster } from './components/ui/toaster';

export default function App() {
  return (
    <BrowserRouter>
      <FormProvider>
        <div className="min-h-screen bg-white">
          <Toaster position="top-right" />
          <AppContent />
        </div>
      </FormProvider>
    </BrowserRouter>
  );
}
