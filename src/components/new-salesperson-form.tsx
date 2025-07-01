
"use client"

import * as React from "react";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from 'next/navigation'
import { Camera, User as UserIcon } from 'lucide-react';

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
import { addUser, getUserByEmail } from "@/data/users"
import type { User } from "@/data/users"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
      message: "Por favor, insira um e-mail válido."
  }),
  password: z.string().min(6, {
      message: "A senha deve ter pelo menos 6 caracteres."
  }),
  role: z.enum(["vendedor", "gerente"], {
      required_error: "É necessário selecionar uma função."
  }),
  position: z.string().min(2, { message: "O cargo é obrigatório."}),
  team: z.string().min(2, { message: "A equipe é obrigatória."}),
  target: z.coerce.number().optional(),
  margin: z.coerce.number().optional(),
  positivationsTarget: z.coerce.number().int().optional(),
  newRegistrationsTarget: z.coerce.number().int().optional(),
  avatar: z.string().optional(),
}).refine(data => {
    if (data.role === 'vendedor') {
        return data.target != null && data.target > 0 && data.margin != null && data.margin > 0 && data.positivationsTarget != null && data.positivationsTarget > 0 && data.newRegistrationsTarget != null && data.newRegistrationsTarget > 0;
    }
    return true;
}, {
    message: "Para vendedores, todos os campos de meta são obrigatórios e devem ser positivos.",
    path: ["target"], // Attach error to a field to be displayed
});

export default function NewSalespersonForm() {
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            position: "",
            team: "",
            avatar: "https://placehold.co/100x100.png"
        },
    })

    const role = form.watch("role");
    const avatarUrl = form.watch("avatar");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue('avatar', reader.result as string, { shouldDirty: true });
            };
            reader.readAsDataURL(file);
        }
    };


    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);

        try {
            // Check if user already exists
            const existingUser = await getUserByEmail(values.email);
            if (existingUser) {
                form.setError("email", { message: "Este e-mail já está em uso." });
                setIsSubmitting(false);
                return;
            }

            const nextId = Date.now(); // Simple way to generate a unique numeric ID for this context

            if (values.role === 'vendedor') {
                await addSalesPerson({
                    id: nextId,
                    name: values.name,
                    target: values.target!,
                    margin: values.margin!,
                    positivationsTarget: values.positivationsTarget!,
                    newRegistrationsTarget: values.newRegistrationsTarget!,
                    avatar: values.avatar
                });
            }
            
            const newUser: Omit<User, 'docId'> = {
                id: nextId,
                name: values.name,
                email: values.email.toLowerCase(),
                password: values.password, // In a real app, this should be hashed on the server
                role: values.role,
                salesPersonId: values.role === 'vendedor' ? nextId : undefined,
                position: values.position,
                team: values.team,
                status: 'ativo',
                avatar: values.avatar,
            };

            await addUser(newUser);

            toast({
                title: "Usuário Cadastrado!",
                description: `${values.name} foi adicionado ao sistema como ${values.role}.`,
            });
            router.push('/users')

        } catch (error: any) {
            console.error("Failed to create user:", error);
            toast({
                variant: "destructive",
                title: "Erro ao Cadastrar",
                description: error.message || "Não foi possível criar o usuário. Tente novamente.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dados do Novo Usuário</CardTitle>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={avatarUrl} alt="Avatar do usuário" />
                                    <AvatarFallback>
                                        <UserIcon className="h-12 w-12" />
                                    </AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-1 right-1 block h-4 w-4 rounded-full bg-green-500 ring-2 ring-card" />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="absolute bottom-0 right-0 rounded-full"
                                    onClick={handleAvatarClick}
                                >
                                    <Camera className="h-4 w-4" />
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cargo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Vendedor Pleno" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="team"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time/Setor</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Varejo" {...field} />
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
                                        <FormLabel>Função (Tipo de Acesso)</FormLabel>
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
                        </div>

                        {role === 'vendedor' && (
                            <div className="pt-4 border-t">
                                <h3 className="text-lg font-medium mb-2">Metas do Vendedor</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                            <FormLabel>Meta de Positivação</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Ex: 10" {...field} value={field.value ?? ''} />
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
                                                <Input type="number" placeholder="Ex: 5" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : "Salvar Cadastro"}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}
