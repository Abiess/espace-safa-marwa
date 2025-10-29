import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AppProvider } from './contexts/AppContext';
import { AppShell } from './components/AppShell';
import { UploadDialog } from './components/UploadDialog';
import { Toaster } from './components/ui/toaster';
import { Dashboard } from './pages/Dashboard';
import { ReceiptDetail } from './pages/ReceiptDetail';
import { Vendors } from './pages/Vendors';
import { Products } from './pages/Products';
import { Settings } from './pages/Settings';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AppProvider>
          <BrowserRouter>
            <AppShell onUpload={() => setUploadOpen(true)}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/r/:id" element={<ReceiptDetail />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/products" element={<Products />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </AppShell>
            <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
            <Toaster />
          </BrowserRouter>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
