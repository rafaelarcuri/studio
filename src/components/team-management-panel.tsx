
'use client';

import * as React from 'react';
import {
  CheckSquare,
  ChevronDown,
  Download,
  Filter,
  Search,
  Calendar,
} from 'lucide-react';

import type { TeamMemberPerformance } from '@/data/team-performance';
import { getTeamPerformanceData } from '@/data/team-performance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

export default function TeamManagementPanel() {
  const [performanceData, setPerformanceData] = React.useState<TeamMemberPerformance[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await getTeamPerformanceData();
      setPerformanceData(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const filteredData = React.useMemo(() => {
    return performanceData.filter(
      (item) =>
        item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [performanceData, searchTerm]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };


  if (isLoading) {
      return (
          <div className="space-y-4">
              <Skeleton className="h-10 w-1/4" />
              <Skeleton className="h-96 w-full" />
          </div>
      );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Painel da Equipe</CardTitle>
        <CardDescription>
          Visão em tempo real da atividade e desempenho da sua equipe comercial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end sm:justify-normal">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Calendar className="mr-2 h-4 w-4" />
                  Período: Este Mês
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Hoje</DropdownMenuItem>
                <DropdownMenuItem>Esta Semana</DropdownMenuItem>
                <DropdownMenuItem>Este Mês</DropdownMenuItem>
                <DropdownMenuItem>Este Trimestre</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Por Status</DropdownMenuItem>
                <DropdownMenuItem>Por Equipe</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="secondary" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Resp. Médio</TableHead>
                <TableHead>Atendimentos</TableHead>
                <TableHead>Tarefas</TableHead>
                <TableHead className="text-center">Volume Pedidos</TableHead>
                <TableHead className="text-right">Receita (Clientes)</TableHead>
                <TableHead>Meta %</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Nota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map(({ user, ...perf }) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.position}</div>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'h-2.5 w-2.5 rounded-full',
                          user.status === 'ativo' ? 'bg-green-500' : 'bg-gray-400'
                        )}
                      />
                      <span className="capitalize">{user.status === 'ativo' ? 'Online' : 'Offline'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{perf.loginTime}</TableCell>
                  <TableCell>{perf.avgResponseTime} min</TableCell>
                  <TableCell>{perf.attendances}</TableCell>
                  <TableCell>{perf.tasksCompleted}</TableCell>
                  <TableCell className="font-mono text-center">{perf.orderVolume}</TableCell>
                  <TableCell className="font-mono text-right">{formatCurrency(perf.customerRevenue)}</TableCell>
                  <TableCell>{perf.metaPercentage}%</TableCell>
                  <TableCell>
                    {perf.slaMet ? (
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    ) : (
                      <span>-</span>
                    )}
                  </TableCell>
                  <TableCell>{perf.avgRating.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
