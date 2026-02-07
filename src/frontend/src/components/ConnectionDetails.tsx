import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeActorError } from '../utils/connectionErrors';

interface ConnectionDetailsProps {
    isAuthenticated: boolean;
    actorFetching: boolean;
    actorReady: boolean;
    isAdminLoading: boolean;
    error: Error | null;
    diagnostics: {
        isAuthenticated: boolean;
        hasIdentity: boolean;
        isAnonymous: boolean;
        adminInitAttempted: boolean;
        adminInitSucceeded: boolean;
        stage: 'idle' | 'creating-actor' | 'initializing-admin' | 'ready' | 'error';
        actorCreationAttempted?: boolean;
        actorCreationFailed?: boolean;
    };
    elapsedSeconds: number;
}

export default function ConnectionDetails({
    isAuthenticated,
    actorFetching,
    actorReady,
    isAdminLoading,
    error,
    diagnostics,
    elapsedSeconds,
}: ConnectionDetailsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const normalizedErrorMessage = error ? normalizeActorError(error) : null;

    const handleCopy = () => {
        const summary = `
Connection Details:
- Authenticated: ${isAuthenticated}
- Has Identity: ${diagnostics.hasIdentity}
- Is Anonymous: ${diagnostics.isAnonymous}
- Actor Fetching: ${actorFetching}
- Actor Ready: ${actorReady}
- Admin Loading: ${isAdminLoading}
- Admin Init Attempted: ${diagnostics.adminInitAttempted}
- Admin Init Succeeded: ${diagnostics.adminInitSucceeded}
- Actor Creation Attempted: ${diagnostics.actorCreationAttempted ?? 'N/A'}
- Actor Creation Failed: ${diagnostics.actorCreationFailed ?? 'N/A'}
- Stage: ${diagnostics.stage}
- Elapsed Time: ${elapsedSeconds}s
- Error: ${error ? error.message : 'None'}
- Normalized Error: ${normalizedErrorMessage || 'None'}
        `.trim();

        navigator.clipboard.writeText(summary);
        setCopied(true);
        toast.success('Debug summary copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="w-full max-w-md border-muted/50">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Connection Details
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="h-8 w-8 p-0"
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </CardHeader>
            
            {isExpanded && (
                <CardContent className="space-y-3 pt-0">
                    <div className="space-y-2 text-xs">
                        <DetailRow label="Authenticated" value={isAuthenticated} />
                        <DetailRow label="Has Identity" value={diagnostics.hasIdentity} />
                        <DetailRow label="Is Anonymous" value={diagnostics.isAnonymous} />
                        <DetailRow label="Actor Fetching" value={actorFetching} />
                        <DetailRow label="Actor Ready" value={actorReady} />
                        <DetailRow label="Admin Loading" value={isAdminLoading} />
                        <DetailRow label="Admin Init Attempted" value={diagnostics.adminInitAttempted} />
                        <DetailRow label="Admin Init Succeeded" value={diagnostics.adminInitSucceeded} />
                        {diagnostics.actorCreationAttempted !== undefined && (
                            <DetailRow label="Actor Creation Attempted" value={diagnostics.actorCreationAttempted} />
                        )}
                        {diagnostics.actorCreationFailed !== undefined && (
                            <DetailRow label="Actor Creation Failed" value={diagnostics.actorCreationFailed} />
                        )}
                        <DetailRow label="Stage" value={diagnostics.stage} />
                        <DetailRow label="Elapsed Time" value={`${elapsedSeconds}s`} />
                        {error && (
                            <div className="pt-2 border-t border-muted">
                                <p className="font-medium text-destructive mb-1">Error:</p>
                                <p className="text-muted-foreground break-words mb-2">{error.message}</p>
                                {normalizedErrorMessage && normalizedErrorMessage !== error.message && (
                                    <>
                                        <p className="font-medium text-muted-foreground mb-1">User-friendly message:</p>
                                        <p className="text-foreground break-words">{normalizedErrorMessage}</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="w-full mt-3"
                    >
                        {copied ? (
                            <>
                                <Check className="h-3 w-3 mr-2" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-3 w-3 mr-2" />
                                Copy Debug Summary
                            </>
                        )}
                    </Button>
                </CardContent>
            )}
        </Card>
    );
}

function DetailRow({ label, value }: { label: string; value: boolean | string | number }) {
    const displayValue = typeof value === 'boolean' 
        ? (value ? '✓ Yes' : '✗ No')
        : value;
    
    const valueColor = typeof value === 'boolean'
        ? (value ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground')
        : 'text-foreground';

    return (
        <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{label}:</span>
            <span className={`font-mono ${valueColor}`}>{displayValue}</span>
        </div>
    );
}
