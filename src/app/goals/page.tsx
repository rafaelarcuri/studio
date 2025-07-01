
'use client';

import * as React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit, PlusCircle, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SalesPerson } from '@/data/sales';
import { getSalesData, updateSalesPersonData } from '@/data/sales';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const editFormSchema = z.object({
  target: z.coerce.number({ invalid_type_error: 'A meta deve ser um número.' }).positive({ message: 'A meta deve ser um valor positivo.' }),
  quarterlyTarget: z.coerce.number({ invalid_type_error: 'A meta deve ser um número.' }).positive({ message: 'A meta deve ser um valor positivo.' }),
  margin: z.coerce.number({ invalid_type_error: 'A margem deve ser um número.' }).positive({ message: 'A margem deve ser um valor positivo.' }),
  positivationsTarget: z.coerce.number({ invalid_type_error: 'A meta deve ser um número.' }).int().positive({ message: 'A meta deve ser um valor inteiro positivo.' }),
  newRegistrationsTarget: z.coerce.number({ invalid_type_error: 'A meta deve ser um número.' }).int().positive({ message: 'A meta deve ser um valor inteiro positivo.' }),
});

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;

export default function GoalsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [salesPeople, setSalesPeople] = React.useState<SalesPerson[]>([]);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<SalesPerson | null>(null);

  React.useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.replace('/login');
    } else if (user.role !== 'gerente') {
      router.replace(`/sales/${user.salesPersonId}`);
    } else {
        const fetchSalesData = async () => {
            setIsLoadingData(true);
            const data = await getSalesData();
            setSalesPeople(data);
            setIsLoadingData(false);
        };
        fetchSalesData();
    }
  }, [user, isAuthLoading, router]);
  
  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
  });

  const handleEditClick = (salesPerson: SalesPerson) => {
    setEditingUser(salesPerson);
    form.reset({
      target: salesPerson.target,
      quarterlyTarget: salesPerson.quarterlyTarget,
      margin: salesPerson.margin,
      positivationsTarget: salesPerson.positivations.target,
      newRegistrationsTarget: salesPerson.newRegistrations.target,
    });
    setIsEditDialogOpen(true);
  };
  
  const onSubmit = async (values: z.infer<typeof editFormSchema>) => {
    if (editingUser) {
        const newPositivations = { ...editingUser.positivations, target: values.positivationsTarget };
        const newNewRegistrations = { ...editingUser.newRegistrations, target: values.newRegistrationsTarget };

        await updateSalesPersonData(editingUser.id, {
            target: values.target,
            quarterlyTarget: values.quarterlyTarget,
            margin: values.margin,
            positivations: newPositivations,
            newRegistrations: newNewRegistrations
        });

        // Update local state to reflect changes instantly
        setSalesPeople(prev =>
            prev.map(p =>
                p.id === editingUser.id ? { 
                    ...p, 
                    target: values.target, 
                    quarterlyTarget: values.quarterlyTarget,
                    margin: values.margin,
                    positivations: newPositivations,
                    newRegistrations: newNewRegistrations
                } : p
            )
        );

        toast({
            title: "Metas Atualizadas!",
            description: `As metas de ${editingUser.name} foram salvas com sucesso.`,
        });
    }
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const filteredSalesPeople = React.useMemo(() => {
    return salesPeople.filter(person =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [salesPeople, searchTerm]);


  if (isAuthLoading || isLoadingData || !user || user.role !== 'gerente') {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Metas</h1>
          <p className="text-muted-foreground">
            Modifique metas existentes de forma individual ou carregue em massa.
          </p>
        </div>
      </header>
      
      <Card>
        <CardHeader>
            <CardTitle>Colaboradores</CardTitle>
            <CardDescription>
                Visualize e edite as metas mensais e trimestrais de cada colaborador.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <Button asChild>
                    <Link href="/goals/upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Carregar em Massa
                    </Link>
                </Button>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vendedor</TableHead>
                            <TableHead className="text-right">Meta Mensal</TableHead>
                            <TableHead className="text-right">Meta Trimestral</TableHead>
                            <TableHead className="text-right">Margem (%)</TableHead>
                            <TableHead className="text-right">Positivação</TableHead>
                            <TableHead className="text-right">Novos Cadastros</TableHead>
                            <TableHead className="text-right">Inadimplência (%)</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSalesPeople.map(person => (
                            <TableRow key={person.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={person.avatar} alt={person.name} />
                                            <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{person.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(person.target)}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(person.quarterlyTarget)}</TableCell>
                                <TableCell className="text-right font-mono">{person.margin.toFixed(1)}%</TableCell>
                                <TableCell className="text-right font-mono">{person.positivations.target}</TableCell>
                                <TableCell className="text-right font-mono">{person.newRegistrations.target}</TableCell>
                                <TableCell className="text-right font-mono">{person.inadimplencia.toFixed(1)}%</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="icon" onClick={() => handleEditClick(person)}>
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Editar Metas</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Metas de {editingUser?.name}</DialogTitle>
                    <DialogDescription>
                        Ajuste os valores das metas e clique em salvar.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="target"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meta Mensal (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Ex: 25000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="quarterlyTarget"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meta Trimestral (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Ex: 75000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="margin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Margem Média (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" placeholder="Ex: 15.5" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="positivationsTarget"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meta de Positivação</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Ex: 10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="newRegistrationsTarget"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meta Novos Cadastros</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Ex: 5" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit">Salvar Metas</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

    </main>
  );
}
