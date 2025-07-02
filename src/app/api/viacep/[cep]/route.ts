
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { cep: string } }
) {
  const cep = params.cep.replace(/\D/g, ''); // Remove non-digit characters

  if (cep.length !== 8) {
    return NextResponse.json({ error: 'CEP inválido.' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    
    if (!response.ok) {
      throw new Error('Falha ao buscar dados do CEP.');
    }

    const data = await response.json();

    if (data.erro) {
      return NextResponse.json({ error: 'CEP não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[VIACEP API] Error:', error);
    return NextResponse.json({ error: 'Falha ao conectar com a API do ViaCEP.' }, { status: 500 });
  }
}
