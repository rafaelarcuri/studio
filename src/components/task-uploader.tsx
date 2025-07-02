
'use client';

import * as React from 'react';
import Papa from 'papaparse';
import { z } from 'zod';
import { Download, File, Loader2, UploadCloud, X } from 'lucide-react';
import { format } from 'date-fns';

import type { Task, Category, Priority, Status } from '@/data/tasks';
import { bulkAddTasks } from '@/data/tasks';
import type { User } from '@/data/users';
import type { CustomerSale } from '@/data/customers';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TaskUploaderProps {
    users: User[];
    customers: CustomerSale[];
    onUploadSuccess: () => void;
}

const csvRowSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório.'),
  assigneeId: z.coerce.number({ invalid_type_error: 'ID do Responsável deve ser um número.' }),
  clientId: z.coerce.number({ invalid_type_error: 'ID do Cliente deve ser um número.' }),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de Vencimento deve estar no formato AAAA-MM-DD.'),
  category: z.enum(['inadimplencia', 'carteira', 'prospeccao', 'inativos']),
  status: z.enum(['pendente', 'em_andamento', 'concluida']),
  priority: z.enum(['low', 'medium', 'high']),
});

type CsvData = z.infer<typeof csvRowSchema>;

export default function TaskUploader({ users, customers, onUploadSuccess }: TaskUploaderProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewData, setPreviewData] = React.useState<CsvData[]>([]);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
        const validRows: CsvData[] = [];
        
        results.data.forEach((row, index) => {
          const parsed = csvRowSchema.safeParse(row);
          if (!parsed.success) {
            const errorMessages = parsed.error.errors.map(e => `Linha ${index + 2}: Campo '${e.path.join('.')}' - ${e.message}`).join('; ');
            validationErrors.push(errorMessages);
            return;
          }

          const assignee = users.find(u => u.id === parsed.data.assigneeId);
          if (!assignee) {
            validationErrors.push(`Linha ${index + 2}: Responsável com ID ${parsed.data.assigneeId} não encontrado.`);
          }

          const customer = customers.find(c => c.id === parsed.data.clientId);
           if (!customer) {
            validationErrors.push(`Linha ${index + 2}: Cliente com ID ${parsed.data.clientId} não encontrado.`);
          }

          if (assignee && customer) {
            validRows.push(parsed.data);
          }
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
    setIsProcessing(true);

    const tasksToUpload = previewData.map(item => {
        const customer = customers.find(c => c.id === item.clientId)!;
        return {
            ...item,
            clientName: customer.name,
            clientPhone: customer.phone,
        };
    });

    const success = await bulkAddTasks(tasksToUpload);

    if (success) {
        toast({
            title: 'Tarefas Carregadas!',
            description: `${tasksToUpload.length} tarefas foram adicionadas com sucesso.`,
        });
        setFile(null);
        setPreviewData([]);
        onUploadSuccess();
    } else {
        toast({
            variant: 'destructive',
            title: 'Erro no Carregamento',
            description: 'Não foi possível salvar as tarefas. Verifique os dados e tente novamente.',
        });
    }
    setIsProcessing(false);
  };

  const handleDownloadTemplate = () => {
    const templateContent = 'title,assigneeId,clientId,dueDate,category,status,priority\n"Ligar para cliente XPTO","1","101","2024-12-31","inadimplencia","pendente","high"\n';
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_tarefas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const hasValidData = previewData.length > 0 && errors.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carregar Tarefas em Massa</CardTitle>
        <CardDescription>
          Faça o upload de um arquivo CSV para adicionar múltiplas tarefas de uma vez.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div 
            className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-semibold">Arraste e solte o arquivo aqui, ou clique para selecionar</p>
          <p className="text-sm text-muted-foreground">O arquivo deve estar no formato .csv com cabeçalhos</p>
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
                <div className="flex items-center gap-3"><File className="h-6 w-6" /><span>{file.name}</span></div>
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Button variant="ghost" size="icon" onClick={() => { setFile(null); setPreviewData([]); setErrors([]); }}><X className="h-5 w-5" /></Button>}
            </div>
        )}

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTitle>Erros de Validação</AlertTitle>
            <AlertDescription><ul className="list-disc list-inside text-xs">{errors.slice(0, 10).map((error, i) => <li key={i}>{error}</li>)}{errors.length > 10 && <li>E mais {errors.length - 10} erros...</li>}</ul></AlertDescription>
          </Alert>
        )}

        {hasValidData && (
          <div>
            <h3 className="text-lg font-medium mb-2">Pré-visualização das Tarefas ({previewData.length})</h3>
            <div className="max-h-[400px] overflow-y-auto border rounded-md">
                <Table>
                    <TableHeader className="sticky top-0 bg-card">
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Responsável</TableHead>
                            <TableHead>Vencimento</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {previewData.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.title}</TableCell>
                                <TableCell>{users.find(u => u.id === item.assigneeId)?.name || 'N/A'}</TableCell>
                                <TableCell>{format(new Date(item.dueDate), 'dd/MM/yyyy')}</TableCell>
                                <TableCell>{item.status}</TableCell>
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
          {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processando...</> : `Carregar ${previewData.length} Tarefas`}
        </Button>
      </CardFooter>
    </Card>
  );
}
