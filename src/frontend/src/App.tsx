import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Dashboard from './pages/Dashboard';
import BackendTesterPage from './pages/BackendTesterPage';
import LoginPrompt from './components/LoginPrompt';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import ConnectionBootstrapper from './components/ConnectionBootstrapper';
import { Loader2 } from 'lucide-react';
import { Button } from './components/ui/button';
import { useEffect, useState } from 'react';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useActorEnhanced } from './hooks/useActorEnhanced';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

function AppContent() {
  const { identity, loginStatus, isInitializing, isLoginError, clear, login } = useInternetIdentity();
  const { actor, isFetching: actorFetching, isError: actorError, error: actorErrorMessage, retry: retryActor, diagnostics } = useActorEnhanced();
  const [currentView, setCurrentView] = useState<'dashboard' | 'backend-tester' | 'pending'>('pending');

  // CRITICAL: Check if identity is ready AND non-anonymous
  // Only after initialization completes can we determine if user is truly authenticated
  const isAuthenticated = !isInitializing && identity && !identity.getPrincipal().isAnonymous();

  // Query user profile - only enabled after initialization completes
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();

  // Determine if we should show profile setup
  const showProfileSetup = Boolean(isAuthenticated && !profileLoading && profileFetched && userProfile === null);

  // Handle manual retry with re-authentication
  const handleRetry = async () => {
    try {
      console.log('🔄 User initiated retry...');
      await clear();
      setTimeout(() => {
        login();
      }, 500);
    } catch (error) {
      console.error('❌ Retry failed:', error);
      window.location.reload();
    }
  };

  // Navigation handler for Backend Tester - now allows all authenticated users
  const handleNavigateToTester = () => {
    setCurrentView('backend-tester');
    window.history.pushState({}, '', '/backend-tester');
  };

  // Navigation handler for Dashboard
  const handleNavigateToDashboard = () => {
    setCurrentView('dashboard');
    window.history.pushState({}, '', '/');
  };

  // Post-login routing - allow backend-tester for all authenticated users
  useEffect(() => {
    if (isAuthenticated && actor && !actorFetching && currentView === 'pending') {
      const path = window.location.pathname;
      
      if (path === '/backend-tester') {
        setCurrentView('backend-tester');
      } else {
        setCurrentView('dashboard');
      }
    }
  }, [isAuthenticated, actor, actorFetching, currentView]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      
      if (path === '/backend-tester') {
        setCurrentView('backend-tester');
      } else {
        setCurrentView('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // CRITICAL: Show loading during Internet Identity initialization/rehydration
  // This prevents any anonymous/limited state from flashing on screen
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Establishing identity...</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Connecting to Internet Identity
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error screen with retry option
  if (isLoginError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <svg
              className="h-8 w-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Authentication Failed</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Failed to establish identity. Please try again.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRetry} variant="default">
              Retry
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show authenticated app with connection bootstrapper
  // Only render after initialization completes and user is authenticated
  if (isAuthenticated) {
    return (
      <ConnectionBootstrapper
        isAuthenticated={isAuthenticated}
        actorFetching={actorFetching}
        actorError={actorErrorMessage}
        actorReady={!!actor && !actorFetching && !actorError}
        isAdminLoading={false}
        onRetry={retryActor}
        diagnostics={diagnostics}
      >
        <div className="flex min-h-screen flex-col">
          <Header onNavigateToTester={handleNavigateToTester} />
          <main className="flex-1">
            {currentView === 'backend-tester' ? (
              <BackendTesterPage onNavigateToDashboard={handleNavigateToDashboard} />
            ) : (
              <Dashboard onNavigateToTester={handleNavigateToTester} />
            )}
          </main>
          <Footer />
          <ProfileSetupModal open={showProfileSetup} />
        </div>
      </ConnectionBootstrapper>
    );
  }

  // Show login prompt for unauthenticated users (after initialization completes)
  return <LoginPrompt />;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
