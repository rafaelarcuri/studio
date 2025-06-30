
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { addSalesPerson } from "@/data/sales"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  target: z.coerce.number().positive({
    message: "A meta deve ser um número positivo.",
  }),
  margin: z.coerce.number().positive({
    message: "A margem deve ser um número positivo.",
  }),
})

export default function NewSalespersonForm() {
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            target: 0,
            margin: 0,
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        addSalesPerson(values);
        toast({
            title: "Vendedor Adicionado!",
            description: `${values.name} foi adicionado à equipe.`,
        });
        router.push('/')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dados do Vendedor</CardTitle>
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
                            name="target"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meta de Vendas (R$)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Ex: 25000" {...field} />
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
                    </CardContent>
                    <CardFooter>
                         <Button type="submit">Salvar Cadastro</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}
