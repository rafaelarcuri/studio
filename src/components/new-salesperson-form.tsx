
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { addSalesPerson } from "@/data/sales"
import { addUser, users } from "@/data/users"
import type { User } from "@/data/users"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
      message: "Por favor, insira um e-mail válido."
  }).refine(email => !users.some(user => user.email === email), {
      message: "Este e-mail já está em uso."
  }),
  password: z.string().min(6, {
      message: "A senha deve ter pelo menos 6 caracteres."
  }),
  role: z.enum(["vendedor", "gerente"], {
      required_error: "É necessário selecionar uma função."
  }),
  target: z.coerce.number().optional(),
  margin: z.coerce.number().optional(),
  positivationsTarget: z.coerce.number().int().optional(),
}).refine(data => {
    if (data.role === 'vendedor') {
        return data.target != null && data.target > 0 && data.margin != null && data.margin > 0 && data.positivationsTarget != null && data.positivationsTarget > 0;
    }
    return true;
}, {
    message: "Para vendedores, todos os campos de meta são obrigatórios e devem ser positivos.",
    path: ["target"], // Attach error to a field to be displayed
});

export default function NewSalespersonForm() {
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    const role = form.watch("role");

    function onSubmit(values: z.infer<typeof formSchema>) {
        let newUser: User;

        if (values.role === 'vendedor') {
            const newSalesPersonId = addSalesPerson({
                name: values.name,
                target: values.target!,
                margin: values.margin!,
                positivationsTarget: values.positivationsTarget!,
            });
            newUser = {
                id: newSalesPersonId,
                name: values.name,
                email: values.email,
                password: values.password,
                role: 'vendedor',
                salesPersonId: newSalesPersonId
            };
        } else { // Gerente
            const newUserId = Math.max(...users.map(u => u.id)) + 1;
             newUser = {
                id: newUserId,
                name: values.name,
                email: values.email,
                password: values.password,
                role: 'gerente',
            };
        }

        addUser(newUser);

        toast({
            title: "Usuário Cadastrado!",
            description: `${values.name} foi adicionado ao sistema como ${values.role}.`,
        });
        router.push('/')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dados do Novo Usuário</CardTitle>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: João da Silva" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-mail</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="usuario@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Função</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a função do usuário" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="vendedor">Vendedor</SelectItem>
                                            <SelectItem value="gerente">Gerente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {role === 'vendedor' && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="target"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Meta de Vendas (R$)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Ex: 25000" {...field} value={field.value ?? ''} />
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
                                                <Input type="number" step="0.1" placeholder="Ex: 15.5" {...field} value={field.value ?? ''} />
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
                                            <FormLabel>Meta de Positivação (Clientes)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Ex: 10" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}
                    </CardContent>
                    <CardFooter>
                         <Button type="submit">Salvar Cadastro</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}
