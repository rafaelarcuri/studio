import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import NewSalespersonForm from '@/components/new-salesperson-form';
import { Button } from '@/components/ui/button';

export default function NewSalespersonPage() {
    return (
        <main className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
            <header className="flex items-center gap-4 mb-8">
                <Button asChild variant="outline" size="icon" className="shrink-0">
                    <Link href="/">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Adicionar Novo Vendedor</h1>
                    <p className="text-muted-foreground">
                        Preencha os dados para cadastrar um novo membro na equipe.
                    </p>
                </div>
            </header>
            <NewSalespersonForm />
        </main>
    );
}
