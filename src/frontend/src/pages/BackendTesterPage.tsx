import SimulatedBashPanel from '../components/SimulatedBashPanel';
import { useIsAdmin, useGetCallerUserRole } from '../hooks/useQueries';
import { Loader2, AlertCircle, ArrowLeft, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActorEnhanced } from '../hooks/useActorEnhanced';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BackendTesterPageProps {
  onNavigateToDashboard?: () => void;
}

export default function BackendTesterPage({ onNavigateToDashboard }: BackendTesterPageProps) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading, error: adminError } = useIsAdmin();
  const { data: userRole, isLoading: roleLoading, error: roleError } = useGetCallerUserRole();
  const { diagnostics, retryAdminInit } = useActorEnhanced();

  const callerPrincipal = identity?.getPrincipal().toString() || 'Not available';
  const hasAdminAccess = isAdmin === true;
  const isLimitedMode = !hasAdminAccess;

  if (isAdminLoading || roleLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  const showDiagnostics = !hasAdminAccess || adminError || roleError || diagnostics.adminInitError;

  const handleClose = () => {
    if (onNavigateToDashboard) {
      onNavigateToDashboard();
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backend Tester</h1>
          <p className="text-muted-foreground mt-1">
            {hasAdminAccess 
              ? 'Diagnostic console for backend operations and testing with live canister calls'
              : 'Limited diagnostic console - some commands require admin privileges'}
          </p>
        </div>
        {onNavigateToDashboard && (
          <Button onClick={onNavigateToDashboard} variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
        )}
      </div>

      {showDiagnostics && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Access Diagnostics
            </CardTitle>
            <CardDescription>
              Current authentication and authorization status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-foreground">Caller Principal:</span>
                <p className="text-muted-foreground font-mono text-xs mt-1 break-all">
                  {callerPrincipal}
                </p>
              </div>
              <div>
                <span className="font-semibold text-foreground">User Role:</span>
                <p className="text-muted-foreground mt-1">
                  {roleLoading ? 'Loading...' : roleError ? `Error: ${roleError.message}` : userRole || 'Unknown'}
                </p>
              </div>
              <div>
                <span className="font-semibold text-foreground">Admin Status:</span>
                <p className="text-muted-foreground mt-1">
                  {isAdminLoading ? 'Checking...' : adminError ? `Error: ${adminError.message}` : hasAdminAccess ? 'Admin' : 'Not Admin'}
                </p>
              </div>
              <div>
                <span className="font-semibold text-foreground">Initialization Stage:</span>
                <p className="text-muted-foreground mt-1 capitalize">
                  {diagnostics.stage.replace('-', ' ')}
                </p>
              </div>
              {diagnostics.adminInitAttempted && (
                <>
                  <div>
                    <span className="font-semibold text-foreground">Admin Token Present:</span>
                    <p className="text-muted-foreground mt-1">Yes</p>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Admin Init Result:</span>
                    <p className="text-muted-foreground mt-1">
                      {diagnostics.adminInitSucceeded ? 'Succeeded' : diagnostics.adminInitError ? 'Failed' : 'In Progress'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {diagnostics.adminInitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Admin Initialization Failed</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{diagnostics.adminInitError}</p>
                  <Button 
                    onClick={retryAdminInit} 
                    variant="outline" 
                    size="sm"
                    className="mt-2 gap-2"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry Initialization
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {isLimitedMode && !diagnostics.adminInitError && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Limited Mode Active</AlertTitle>
                <AlertDescription>
                  You are accessing the Backend Tester in limited mode. Only non-admin commands are available. 
                  {diagnostics.adminInitAttempted && !diagnostics.adminInitSucceeded && (
                    <span className="block mt-2">
                      Note: An admin token was detected, but admin initialization did not succeed. 
                      This means the backend did not grant admin privileges to your principal.
                    </span>
                  )}
                  {!diagnostics.adminInitAttempted && (
                    <span className="block mt-2">
                      To access admin commands, you need an admin token and must be designated as an administrator.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {adminError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Admin Check Error</AlertTitle>
                <AlertDescription>
                  Unable to verify admin status: {adminError.message}
                </AlertDescription>
              </Alert>
            )}

            {roleError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Role Check Error</AlertTitle>
                <AlertDescription>
                  Unable to fetch user role: {roleError.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <SimulatedBashPanel onClose={handleClose} isLimitedMode={isLimitedMode} />
    </div>
  );
}
