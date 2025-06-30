
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Target, UploadCloud, Edit, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FeatureItem = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="bg-primary/10 text-primary p-2 rounded-full">
            <Icon className="h-5 w-5" />
        </div>
        <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-muted-foreground">{children}</p>
        </div>
    </div>
);


export default function GoalsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
    } else if (user.role !== 'gerente') {
      router.replace(`/sales/${user.salesPersonId}`);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'gerente') {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" size="icon" className="shrink-0">
          <Link href="/">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Gestão de Metas</h1>
          <p className="text-muted-foreground">
            Uma ferramenta completa para gerenciar as metas da equipe.
          </p>
        </div>
      </header>
      
      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Funcionalidade em Desenvolvimento</CardTitle>
            </div>
          <CardDescription>
            Estamos trabalhando para trazer uma ferramenta completa de gestão de metas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
            <p>Em breve, esta área permitirá que administradores realizem as seguintes ações:</p>

            <div className="space-y-6">
                <FeatureItem icon={UploadCloud} title="Cadastro e Edição em Massa">
                    Carregue metas via formulário ou importando planilhas (CSV/Excel) com dados de vendedor, ID, meta mensal e trimestral.
                </FeatureItem>
                <FeatureItem icon={Edit} title="Alteração de Metas">
                    Modifique metas existentes, atribua ou remova metas de colaboradores de forma simples.
                </FeatureItem>
                <FeatureItem icon={History} title="Histórico de Metas">
                    Visualize o histórico de metas por vendedor, filtrando por diferentes períodos para uma análise completa.
                </FeatureItem>
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
