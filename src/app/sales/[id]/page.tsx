import IndividualDashboard from '@/components/individual-dashboard';

type IndividualPageProps = {
    params: {
        id: string;
    }
}

export default function IndividualSalesPage({ params }: IndividualPageProps) {
    const { id } = params;
    
    const numericId = parseInt(id, 10);
    
    // Basic validation for the ID
    if (isNaN(numericId)) {
        return (
            <main className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Vendedor não encontrado</h1>
                    <p className="text-muted-foreground">O ID fornecido não é válido.</p>
                </div>
            </main>
        )
    }

    return (
        <main className="p-4 sm:p-6 lg:p-8">
            <IndividualDashboard salespersonId={numericId} />
        </main>
    );
}
