
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChevronDown, Download, Users, CheckCircle, ListTodo, Hourglass } from 'lucide-react';

import type { Task } from '@/data/tasks';
import { getTasks } from '@/data/tasks';
import type { User } from '@/data/users';
import { getUsers } from '@/data/users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProgressThermometer } from './progress-thermometer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from './ui/skeleton';


type UserAnalytics = {
  user: User;
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  efficiency: number;
};

const categoryLabels: Record<string, string> = {
    inadimplencia: 'Inadimplência',
    carteira: 'Carteira',
    prospeccao: 'Prospecção',
    inativos: 'Inativos',
};

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];


export default function AnalyticsDashboard() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const [fetchedTasks, fetchedUsers] = await Promise.all([
            getTasks(),
            getUsers()
        ]);
        setTasks(fetchedTasks);
        setUsers(fetchedUsers.filter(u => u.role === 'vendedor'));
        setIsLoading(false);
    }
    fetchData();
  }, []);

  const analyticsData = React.useMemo<UserAnalytics[]>(() => {
    return users.map(user => {
      const userTasks = tasks.filter(task => task.assigneeId === user.id);
      const assignedTasks = userTasks.length;
      const completedTasks = userTasks.filter(t => t.status === 'concluida').length;
      const efficiency = assignedTasks > 0 ? (completedTasks / assignedTasks) * 100 : 0;

      return {
        user,
        assignedTasks,
        completedTasks,
        pendingTasks: userTasks.filter(t => t.status === 'pendente').length,
        inProgressTasks: userTasks.filter(t => t.status === 'em_andamento').length,
        efficiency,
      };
    });
  }, [tasks, users]);

  const teamTotals = React.useMemo(() => {
    const totalAssigned = analyticsData.reduce((sum, data) => sum + data.assignedTasks, 0);
    const totalCompleted = analyticsData.reduce((sum, data) => sum + data.completedTasks, 0);
    const totalPending = tasks.filter(t => t.status === 'pendente').length;
    const totalInProgress = tasks.filter(t => t.status === 'em_andamento').length;
    const teamEfficiency = totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;

    return { totalAssigned, totalCompleted, totalPending, totalInProgress, teamEfficiency };
  }, [analyticsData, tasks]);
  
  const tasksByCategory = React.useMemo(() => {
    const categoryCounts = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts).map(([name, value]) => ({
      name: categoryLabels[name] || name,
      value,
    }));
  }, [tasks]);

  const sortedByEfficiency = [...analyticsData].sort((a, b) => b.efficiency - a.efficiency);

  if (isLoading) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="grid grid-cols-5 gap-6">
                <Skeleton className="h-96 w-full col-span-3" />
                <Skeleton className="h-64 w-full col-span-2" />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        Período: Este Mês <ChevronDown className="ml-2 h-4 w-4" />
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
                    <Button variant="outline">
                        Equipe: Todas <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Todas</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button variant="secondary">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
          </Button>
      </div>

      {/* KPIs Resumidos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamTotals.totalAssigned}</div>
            <p className="text-xs text-muted-foreground">Total de tarefas no período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamTotals.totalCompleted}</div>
             <p className="text-xs text-muted-foreground">Tarefas finalizadas com sucesso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamTotals.totalPending}</div>
            <p className="text-xs text-muted-foreground">Aguardando início</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamTotals.totalInProgress}</div>
            <p className="text-xs text-muted-foreground">Tarefas sendo executadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 items-start">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Produtividade Individual</CardTitle>
            <CardDescription>Desempenho de cada colaborador da equipe.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Colaborador</TableHead>
                        <TableHead className="text-center">Atribuídas</TableHead>
                        <TableHead className="text-center">Concluídas</TableHead>
                        <TableHead className="text-center">Eficiência</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {analyticsData.map(data => (
                        <TableRow key={data.user.id}>
                            <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                <AvatarImage src={data.user.avatar} alt={data.user.name} />
                                <AvatarFallback>{data.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{data.user.name}</span>
                            </div>
                            </TableCell>
                            <TableCell className="text-center font-mono">{data.assignedTasks}</TableCell>
                            <TableCell className="text-center font-mono">{data.completedTasks}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Progress value={data.efficiency} className="w-full h-3" />
                                    <span className="font-mono text-sm w-12 text-right">{data.efficiency.toFixed(0)}%</span>
                                </div>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
         <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Eficiência da Equipe</CardTitle>
                <CardDescription>Média de conclusão de tarefas da equipe.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProgressThermometer value={teamTotals.teamEfficiency} />
            </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Ranking de Eficiência</CardTitle>
            </CardHeader>
            <CardContent className="pl-0">
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart layout="vertical" data={sortedByEfficiency} margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" dataKey="efficiency" tickFormatter={(v) => `${v}%`} />
                        <YAxis type="category" dataKey="user.name" width={100} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Eficiência']} />
                        <Bar dataKey="efficiency" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                            <LabelList dataKey="efficiency" position="right" offset={10} className="fill-foreground font-bold" formatter={(v: number) => `${v.toFixed(0)}%`} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={tasksByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return (
                                <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                                );
                            }}
                        >
                             {tasksByCategory.map((entry, index) => (
                                <Pie key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                         <Tooltip formatter={(value, name) => [value, name]} />
                        <Legend iconSize={10} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
