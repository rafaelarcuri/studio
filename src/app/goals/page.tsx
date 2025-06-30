
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Target, Upload, History, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
            Ajuste, carregue e visualize o histórico de metas da equipe.
          </p>
        </div>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            <span>Funcionalidade em Desenvolvimento</span>
          </CardTitle>
          <CardDescription>
            Estamos trabalhando para trazer uma ferramenta completa de gestão de metas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
            <p className="text-center text-muted-foreground">
              Em breve, esta área permitirá que administradores realizem as seguintes ações:
            </p>
            <ul className="list-disc list-inside space-y-4 text-left mx-auto max-w-md">
                <li className="flex items-start gap-3">
                    <Upload className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                    <div>
                        <span className="font-semibold">Cadastro e Edição em Massa:</span>
                        <p className="text-sm text-muted-foreground">
                            Carregue metas via formulário ou importando planilhas (CSV/Excel) com dados de vendedor, ID, meta mensal e trimestral.
                        </p>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <Edit className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                    <div>
                        <span className="font-semibold">Alteração de Metas:</span>
                        <p className="text-sm text-muted-foreground">
                            Modifique metas existentes, atribua ou remova metas de colaboradores de forma simples.
                        </p>
                    </div>
                </li>
                 <li className="flex items-start gap-3">
                    <History className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                    <div>
                        <span className="font-semibold">Histórico de Metas:</span>
                        <p className="text-sm text-muted-foreground">
                            Visualize o histórico de metas por vendedor, filtrando por diferentes períodos para uma análise completa.
                        </p>
                    </div>
                </li>
            </ul>
        </CardContent>
      </Card>
    </main>
  );
}
