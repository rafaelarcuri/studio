
'use client';

import * as React from 'react';
import { CheckCircle, Copy, Eye, EyeOff, KeyRound, MoreVertical, Plug, Power, PowerOff, RefreshCw } from 'lucide-react';

import type { Integration } from '@/data/integrations';
import { getIntegrations, updateIntegrationApiKey, updateIntegrationStatus } from '@/data/integrations';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from './ui/skeleton';

export default function IntegrationsPanel() {
  const [integrations, setIntegrations] = React.useState<Integration[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedIntegration, setSelectedIntegration] = React.useState<Integration | null>(null);
  const [apiKey, setApiKey] = React.useState('');
  const [showApiKey, setShowApiKey] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const data = await getIntegrations();
        setIntegrations(data);
        setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration);
    setApiKey(integration.apiKey);
    setIsModalOpen(true);
  };
  
  const handleToggleStatus = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    const newStatus = integration.status === 'ativo' ? 'inativo' : 'ativo';
    await updateIntegrationStatus(integrationId, newStatus);
    const updatedIntegrations = await getIntegrations();
    setIntegrations(updatedIntegrations);

    toast({
        title: `Integração ${newStatus === 'ativo' ? 'Ativada' : 'Desativada'}`,
        description: `A integração ${integration.name} foi ${newStatus === 'ativo' ? 'ativada' : 'desativada'} com sucesso.`
    });
  }

  const handleSaveChanges = async () => {
    if (!selectedIntegration) return;

    await updateIntegrationApiKey(selectedIntegration.id, apiKey);
    const updatedIntegrations = await getIntegrations();
    setIntegrations(updatedIntegrations);
    setIsModalOpen(false);
    setSelectedIntegration(null);
    setShowApiKey(false);

    toast({
      title: 'Chave de API Atualizada!',
      description: `A chave para ${selectedIntegration.name} foi salva com sucesso.`,
    });
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: 'Copiado!',
      description: 'A chave de API foi copiada para a área de transferência.',
      className: 'bg-green-600 text-white',
    });
  };

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <Plug className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{integration.name}</CardTitle>
                  <Badge variant={integration.status === 'ativo' ? 'default' : 'destructive'} className={integration.status === 'ativo' ? 'bg-green-600' : ''}>
                    {integration.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {integration.status === 'ativo' ? (
                    <DropdownMenuItem onClick={() => handleToggleStatus(integration.id)} className="text-red-600 focus:text-red-600">
                        <PowerOff className="mr-2 h-4 w-4" /> Desativar
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => handleToggleStatus(integration.id)} className="text-green-600 focus:text-green-600">
                        <Power className="mr-2 h-4 w-4" /> Ativar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <CardDescription>{integration.description}</CardDescription>
              <Button className="mt-4 w-full" onClick={() => handleConfigure(integration)}>
                Configurar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Insira e salve a chave de API para ativar a comunicação com o serviço.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="api-key" className="font-semibold">
                Chave de API (Token)
              </Label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="api-key"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pl-10 pr-24"
                  placeholder="Cole sua chave de API aqui"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowApiKey((prev) => !prev)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-md bg-muted/50 border">
              <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
              <div>
                <p className="text-sm font-semibold">Conexão Ativa</p>
                <p className="text-xs text-muted-foreground">Última sincronização: 5 minutos atrás</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button>
                <RefreshCw className="mr-2 h-4 w-4" />
                Testar Conexão
            </Button>
            <Button onClick={handleSaveChanges}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
