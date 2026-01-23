import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Bell, Shield } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();

  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Market Data',
      description: 'Track live cryptocurrency prices from CoinGecko\'s public REST API with reliable market data',
      gradient: 'from-primary to-secondary',
    },
    {
      icon: BarChart3,
      title: 'Advanced Forecasting',
      description: 'Analyze trends with Linear Regression, Moving Average, and Exponential Smoothing methods',
      gradient: 'from-secondary to-accent',
    },
    {
      icon: Bell,
      title: 'Custom Watchlists',
      description: 'Create personalized watchlists to monitor your favorite cryptocurrencies',
      gradient: 'from-accent to-primary',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with Internet Computer blockchain technology',
      gradient: 'from-primary via-accent to-secondary',
    },
  ];

  return (
    <div className="container py-12 md:py-24">
      <div className="mx-auto max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent shadow-lg mb-4">
            <TrendingUp className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            ItsRon Analysis and Predictions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional cryptocurrency trend analysis and forecasting platform powered by real-time market data
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/40"
            >
              <CardHeader>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} shadow-md mb-2 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-4">
          <Button
            size="lg"
            onClick={login}
            disabled={loginStatus === 'logging-in'}
            className="px-8 py-6 text-lg bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
          >
            {loginStatus === 'logging-in' ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Connecting...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                Get Started
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            Secure authentication powered by Internet Identity
          </p>
        </div>
      </div>
    </div>
  );
}
