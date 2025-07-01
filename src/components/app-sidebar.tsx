
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  Home,
  LogOut,
  PieChart,
  Plug,
  Settings,
  Target,
  Trophy,
  Users,
  ClipboardList,
  ListChecks,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function AppSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user || user.role !== 'gerente') {
    return null;
  }
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 hover:bg-sidebar-accent">
                <Target className="h-6 w-6 text-primary" />
            </Button>
            <div className="flex flex-col">
                <span className="text-lg font-semibold tracking-tight">Vendas Ágil</span>
            </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
                 <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === '/'}>
                            <Link href="/"><Home />Dashboard</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
            <SidebarGroupLabel>Relatórios</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith('/analytics')}>
                            <Link href="/analytics"><PieChart />Análise de Produtividade</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith('/ranking')}>
                            <Link href="/ranking"><Trophy />Ranking de Clientes</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
        
         <SidebarGroup>
            <SidebarGroupLabel>Tarefas</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === '/tasks'}>
                            <Link href="/tasks"><ClipboardList />Minhas Tarefas</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith('/tasks/management')}>
                            <Link href="/tasks/management"><ListChecks />Gestão de Tarefas</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>

         <SidebarGroup>
            <SidebarGroupLabel>Gestão</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith('/goals')}>
                            <Link href="/goals"><Target />Metas da Equipe</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith('/users') || pathname.startsWith('/sales/new')}>
                            <Link href="/users"><Users />Gestão de Usuários</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith('/integrations')}>
                            <Link href="/integrations"><Plug />APIs e Integrações</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 flex-col gap-2">
         <div className="flex items-center gap-3 p-2 rounded-md bg-sidebar-accent/50">
            <div className="relative">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {user.status === 'ativo' && (
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-sidebar-accent" />
                )}
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
         </div>
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start hover:bg-sidebar-accent text-sidebar-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
