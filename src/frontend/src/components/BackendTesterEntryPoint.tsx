import { Settings, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsAdmin } from '../hooks/useQueries';
import { toast } from 'sonner';

interface BackendTesterEntryPointProps {
  onNavigate: () => void;
  variant?: 'button' | 'header';
}

export default function BackendTesterEntryPoint({ onNavigate, variant = 'button' }: BackendTesterEntryPointProps) {
  const { data: isAdmin, isLoading, isError, error, refetch } = useIsAdmin();

  // Loading state - clickable with feedback
  if (isLoading) {
    const handleLoadingClick = () => {
      toast.info('Checking admin permissions...', {
        description: 'Please wait while we verify your access level.',
      });
    };

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant === 'header' ? 'ghost' : 'default'}
              size="sm"
              onClick={handleLoadingClick}
              className="shadow-sm opacity-70"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Backend Tester
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Checking admin permissions...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Error state with retry - clickable with feedback
  if (isError) {
    const handleErrorClick = () => {
      toast.error('Admin check failed', {
        description: error?.message || 'Unable to verify admin status. Click the refresh icon to retry.',
        action: {
          label: 'Retry',
          onClick: () => {
            refetch();
            toast.info('Retrying admin check...');
          },
        },
      });
    };

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Button
                variant={variant === 'header' ? 'ghost' : 'default'}
                size="sm"
                onClick={handleErrorClick}
                className="shadow-sm"
              >
                <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                Backend Tester
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  refetch();
                  toast.info('Retrying admin check...');
                }}
                className="h-8 w-8"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-semibold">Admin check failed</p>
            <p className="text-xs mt-1">
              {error?.message || 'Unable to verify admin status. Click to see details or use the refresh icon to retry.'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Non-admin state - now navigates to limited mode
  if (!isAdmin) {
    const handleNonAdminClick = () => {
      toast.info('Opening Backend Tester in limited mode', {
        description: 'Only non-admin commands will be available. Admin commands require elevated permissions.',
      });
      onNavigate();
    };

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant === 'header' ? 'ghost' : 'outline'}
              size="sm"
              onClick={handleNonAdminClick}
              className="shadow-sm"
            >
              <Settings className="mr-2 h-4 w-4" />
              Backend Tester
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Open in limited mode</p>
            <p className="text-xs mt-1">Non-admin commands available. Admin commands require elevated permissions.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Admin state - fully enabled
  return (
    <Button
      variant={variant === 'header' ? 'ghost' : 'default'}
      size="sm"
      onClick={onNavigate}
      className="shadow-sm hover:bg-primary/90 transition-colors"
    >
      <Settings className="mr-2 h-4 w-4" />
      Backend Tester
    </Button>
  );
}
