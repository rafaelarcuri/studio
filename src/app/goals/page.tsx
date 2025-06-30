
'use client';

import * as React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Edit, Search } from 'lucide-react';
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
});

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;

export default function GoalsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [salesPeople, setSalesPeople] = React.useState<SalesPerson[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<SalesPerson | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setSalesPeople(getSalesData());
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
    } else if (user.role !== 'gerente') {
      router.replace(`/sales/${user.salesPersonId}`);
    }
  }, [user, isLoading, router]);
  
  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
  });

  const handleEditClick = (salesPerson: SalesPerson) => {
    setEditingUser(salesPerson);
    form.reset({
      target: salesPerson.target,
      quarterlyTarget: salesPerson.quarterlyTarget,
    });
    setIsEditDialogOpen(true);
  };
  
  const onSubmit = (values: z.infer<typeof editFormSchema>) => {
    if (editingUser) {
        updateSalesPersonData(editingUser.id, {
            target: values.target,
            quarterlyTarget: values.quarterlyTarget,
        });

        // Update local state to reflect changes instantly
        setSalesPeople(prev =>
            prev.map(p =>
                p.id === editingUser.id ? { ...p, target: values.target, quarterlyTarget: values.quarterlyTarget } : p
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
          <h1 className="text-3xl font-bold">Alteração de Metas de Colaboradores</h1>
          <p className="text-muted-foreground">
            Modifique metas existentes de forma individual.
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
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vendedor</TableHead>
                            <TableHead className="text-right">Meta Mensal</TableHead>
                            <TableHead className="text-right">Meta Trimestral</TableHead>
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Metas de {editingUser?.name}</DialogTitle>
                    <DialogDescription>
                        Ajuste os valores das metas e clique em salvar.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
