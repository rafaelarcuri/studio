
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

const formSchema = z.object({
  cep: z.string().min(8, { message: 'O CEP deve ter pelo menos 8 dígitos.' }).max(9, { message: 'O CEP deve ter no máximo 9 caracteres (com hífen).' }),
});

type Address = {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
};

export default function ViaCepIntegration() {
  const [address, setAddress] = React.useState<Address | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cep: '',
    },
  });
  
  const handleCepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5, 8);
    }
    form.setValue('cep', value);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAddress(null);
    const cep = values.cep.replace(/\D/g, ''); // Ensure only digits are sent

    try {
      const response = await fetch(`/api/viacep/${cep}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao buscar o CEP.');
      }
      
      setAddress(data);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro na Consulta',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultar CEP</CardTitle>
        <CardDescription>
          Digite um CEP válido para buscar o endereço correspondente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input placeholder="01001-000" {...field} onChange={handleCepChange} maxLength={9} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-8" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">Buscar Endereço</span>
            </Button>
          </form>
        </Form>
        
        {address && (
            <div>
                <Separator className="my-6" />
                <h3 className="text-lg font-semibold mb-4">Resultado da Consulta</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Logradouro</p>
                        <p className="font-medium">{address.logradouro || 'N/A'}</p>
                    </div>
                     <div>
                        <p className="text-muted-foreground">Complemento</p>
                        <p className="font-medium">{address.complemento || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Bairro</p>
                        <p className="font-medium">{address.bairro || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Cidade</p>
                        <p className="font-medium">{address.localidade || 'N/A'}</p>
                    </div>
                     <div>
                        <p className="text-muted-foreground">Estado (UF)</p>
                        <p className="font-medium">{address.uf || 'N/A'}</p>
                    </div>
                     <div>
                        <p className="text-muted-foreground">DDD</p>
                        <p className="font-medium">{address.ddd || 'N/A'}</p>
                    </div>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
