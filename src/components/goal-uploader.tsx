
'use client';

import * as React from 'react';
import Papa from 'papaparse';
import { z } from 'zod';
import { Download, File, Loader2, UploadCloud, X } from 'lucide-react';

import type { SalesPerson } from '@/data/sales';
import { getSalesData, bulkUpdateSalesTargets } from '@/data/sales';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const csvRowSchema = z.object({
  salesPersonId: z.coerce.number({ invalid_type_error: 'ID deve ser um número.' }).int().positive(),
  monthlyTarget: z.coerce.number({ invalid_type_error: 'Meta mensal deve ser um número.' }).positive(),
  quarterlyTarget: z.coerce.number({ invalid_type_error: 'Meta trimestral deve ser um número.' }).positive(),
});

type PreviewData = {
    id: number;
    name: string;
    currentMonthly: number;
    newMonthly: number;
    currentQuarterly: number;
    newQuarterly: number;
    error: string | null;
}

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;

export default function GoalUploader() {
  const [salesPeople, setSalesPeople] = React.useState<SalesPerson[]>([]);
  const [file, setFile] = React.useState<File | null>(null);
  const [previewData, setPreviewData] = React.useState<PreviewData[]>([]);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const fetchInitialData = async () => {
        const data = await getSalesData();
        setSalesPeople(data);
    };
    fetchInitialData();
  }, []);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv') {
      setErrors(['Formato de arquivo inválido. Por favor, envie um arquivo .csv']);
      setFile(null);
      setPreviewData([]);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setPreviewData([]);
    setIsProcessing(true);

    Papa.parse<Record<string, unknown>>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validationErrors: string[] = [];
        const validRows: PreviewData[] = [];
        
        results.data.forEach((row, index) => {
          const parsed = csvRowSchema.safeParse(row);
          if (!parsed.success) {
            const errorMessages = parsed.error.errors.map(e => `Linha ${index + 2}: ${e.message}`).join(', ');
            validationErrors.push(errorMessages);
            return;
          }

          const person = salesPeople.find(p => p.id === parsed.data.salesPersonId);
          if (!person) {
            validationErrors.push(`Linha ${index + 2}: Vendedor com ID ${parsed.data.salesPersonId} não encontrado.`);
            return;
          }

          validRows.push({
            id: person.id,
            name: person.name,
            currentMonthly: person.target,
            newMonthly: parsed.data.monthlyTarget,
            currentQuarterly: person.quarterlyTarget,
            newQuarterly: parsed.data.quarterlyTarget,
            error: null,
          });
        });

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
        } else {
            setPreviewData(validRows);
        }
        setIsProcessing(false);
      },
      error: (error) => {
        setErrors([`Erro ao processar o arquivo: ${error.message}`]);
        setIsProcessing(false);
      },
    });
  };

  const handleSaveChanges = async () => {
    if (previewData.length === 0) return;
    
    const updates = previewData.map(item => ({
        salesPersonId: item.id,
        monthlyTarget: item.newMonthly,
        quarterlyTarget: item.newQuarterly,
    }));

    await bulkUpdateSalesTargets(updates);

    toast({
        title: 'Metas Atualizadas!',
        description: `${updates.length} vendedores tiveram suas metas atualizadas com sucesso.`,
    });

    setFile(null);
    setPreviewData([]);
  };

  const handleDownloadTemplate = () => {
    const templateContent = 'salesPersonId,monthlyTarget,quarterlyTarget\n';
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_metas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const hasValidData = previewData.length > 0 && errors.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Metas em Massa</CardTitle>
        <CardDescription>
          Faça o upload de um arquivo CSV para atualizar as metas mensais e trimestrais da sua equipe.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div 
            className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                }
            }}
        >
          <UploadCloud className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-semibold">Arraste e solte o arquivo aqui, ou clique para selecionar</p>
          <p className="text-sm text-muted-foreground">O arquivo deve estar no formato .csv</p>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept=".csv"
            onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
          />
        </div>

        <div className="flex items-center justify-center">
            <Button variant="link" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Baixar modelo de planilha
            </Button>
        </div>

        {file && (
            <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                    <File className="h-6 w-6" />
                    <span className="font-medium">{file.name}</span>
                </div>
                {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <Button variant="ghost" size="icon" onClick={() => { setFile(null); setPreviewData([]); setErrors([]); }}>
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>
        )}

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTitle>Erros de Validação</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.slice(0, 5).map((error, i) => <li key={i}>{error}</li>)}
                {errors.length > 5 && <li>E mais {errors.length - 5} erros...</li>}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {hasValidData && (
          <div>
            <h3 className="text-lg font-medium mb-2">Pré-visualização das Alterações</h3>
            <div className="max-h-[400px] overflow-y-auto border rounded-md">
                <Table>
                    <TableHeader className="sticky top-0 bg-card">
                        <TableRow>
                            <TableHead>Vendedor</TableHead>
                            <TableHead>Meta Mensal</TableHead>
                            <TableHead>Meta Trimestral</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {previewData.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground line-through text-xs">{formatCurrency(item.currentMonthly)}</span>
                                        <span className="font-semibold">{formatCurrency(item.newMonthly)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground line-through text-xs">{formatCurrency(item.currentQuarterly)}</span>
                                        <span className="font-semibold">{formatCurrency(item.newQuarterly)}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          </div>
        )}

      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveChanges} disabled={!hasValidData || isProcessing}>
          {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processando...</> : 'Salvar Alterações'}
        </Button>
      </CardFooter>
    </Card>
  );
}
