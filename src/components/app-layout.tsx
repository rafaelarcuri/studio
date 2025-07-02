
'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/use-auth';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // You can return a global loading indicator here if needed
    return null; 
  }

  // No sidebar for login page or for non-manager roles
  if (pathname === '/login' || !user || user.role !== 'gerente') {
    return (
        <>
            {children}
            <Toaster />
        </>
    );
  }

  // Manager layout with sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-muted/30">
        {children}
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
