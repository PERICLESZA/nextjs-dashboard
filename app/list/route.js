// app/list/route.js
import { NextResponse } from 'next/server';
import getCustomers from './listCustomers'; // Certifique-se de ajustar o caminho corretamente

export async function GET() {
    try {
        const customers = await getCustomers(); // Chama a função que busca os customers do banco de dados
        return NextResponse.json({ message: 'Seeded successfully', customers }); // Retorna os customers como JSON
    } catch (error) {
        console.error('Erro ao listar customers:', error);
        return NextResponse.json({ error: 'Erro ao listar customers' }, { status: 500 }); // Retorna um erro caso ocorra
    }
}
