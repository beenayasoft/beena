import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Clock, 
  Database, 
  RefreshCw, 
  Settings, 
  TrendingUp,
  Wifi,
  WifiOff
} from 'lucide-react';
import { opportunityService } from '@/lib/services/opportunityService';

interface ServiceMetricsProps {
  className?: string;
}

export function ServiceMetrics({ className }: ServiceMetricsProps) {
  const [metrics, setMetrics] = useState({
    apiCalls: 0,
    apiFailures: 0,
    mockFallbacks: 0,
    averageResponseTime: 0,
    lastError: undefined as string | undefined,
  });
  
  const [config, setConfig] = useState({
    useAPI: true,
    enableFallback: true,
    enableMetrics: true,
    cacheEnabled: true,
    cacheTimeout: 300000,
  });
  
  const [isExpanded, setIsExpanded] = useState(false);

  // Charger les métriques et configuration
  useEffect(() => {
    const loadData = () => {
      setMetrics(opportunityService.getMetrics());
      setConfig(opportunityService.getConfig());
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculer les statistiques de fiabilité
  const successRate = metrics.apiCalls > 0 
    ? ((metrics.apiCalls - metrics.apiFailures) / metrics.apiCalls) * 100 
    : 100;

  // Gestion des configurations
  const handleConfigChange = (key: string, value: boolean | number) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    opportunityService.updateConfig(newConfig);
  };

  const handleToggleAPI = () => {
    const newValue = !config.useAPI;
    opportunityService.enableAPI(newValue);
    handleConfigChange('useAPI', newValue);
  };

  if (!isExpanded) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Card className="w-64 shadow-lg border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <CardTitle className="text-sm">Service Status</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Mode</span>
                <Badge variant={config.useAPI ? "default" : "secondary"}>
                  {config.useAPI ? (
                    <><Wifi className="w-3 h-3 mr-1" /> API</>
                  ) : (
                    <><WifiOff className="w-3 h-3 mr-1" /> Mock</>
                  )}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Performance</span>
                <Badge>
                  <Clock className="w-3 h-3 mr-1" />
                  {Math.round(metrics.averageResponseTime)}ms
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Fiabilité</span>
                <Badge variant={successRate > 90 ? 'default' : 'destructive'}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {Math.round(successRate)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className="w-96 shadow-xl border-l-4 border-l-blue-500">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <div>
                <CardTitle className="text-base">🚀 Service Intelligent</CardTitle>
                <CardDescription className="text-xs">
                  Monitoring temps réel
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Configuration Mode */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {config.useAPI ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm">Mode API</span>
                </div>
                <Switch
                  checked={config.useAPI}
                  onCheckedChange={handleToggleAPI}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">Fallback Auto</span>
                </div>
                <Switch
                  checked={config.enableFallback}
                  onCheckedChange={(value) => handleConfigChange('enableFallback', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span className="text-sm">Cache</span>
                </div>
                <Switch
                  checked={config.cacheEnabled}
                  onCheckedChange={(value) => handleConfigChange('cacheEnabled', value)}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Métriques de Performance */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">{metrics.apiCalls}</div>
                <div className="text-muted-foreground">Appels API</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">{Math.round(metrics.averageResponseTime)}ms</div>
                <div className="text-muted-foreground">Temps moyen</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">{metrics.mockFallbacks}</div>
                <div className="text-muted-foreground">Fallbacks</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">{metrics.apiFailures}</div>
                <div className="text-muted-foreground">Échecs</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Taux de succès</span>
                <span className={successRate > 90 ? 'text-green-600' : 'text-red-600'}>
                  {Math.round(successRate)}%
                </span>
              </div>
              <Progress value={successRate} className="h-2" />
            </div>
          </div>
          
          {metrics.lastError && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-600">Dernière erreur</h4>
                <p className="text-xs text-muted-foreground bg-red-50 p-2 rounded">
                  {metrics.lastError}
                </p>
              </div>
            </>
          )}
          
          <Separator />
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => opportunityService.clearCache()}
              className="flex-1"
            >
              <Database className="w-3 h-3 mr-1" />
              Clear Cache
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 