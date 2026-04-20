import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useAuth } from './hooks/useAuth';
import { Toaster } from './components/ui/sonner';
import { PageTransition } from './components/shared/PageTransition';

function App() {
  const { initialize, loading } = useAuth();

  useEffect(() => {
    // Start the KithLy Auth Engine
    initialize();
  }, [initialize]);

  // Prevent "Flicker": Wait until we know if the user is logged in
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-primary rounded-full mb-4"></div>
          <p className="text-sm text-gray-500 font-medium">Powering up KithLy...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTransition>
        <RouterProvider router={router} />
      </PageTransition>
      <Toaster position="top-center" />
    </>
  );
}

export default App;