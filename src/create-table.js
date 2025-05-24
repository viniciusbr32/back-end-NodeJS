import { sql } from "./db.js";

const createDriversTable = async () => {
	try {
		await sql`
      CREATE TABLE IF NOT EXISTS drivers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- ID do motorista
        name VARCHAR(100) NOT NULL,                    -- Nome do motorista
        cnh VARCHAR(20) NOT NULL UNIQUE,               -- Número da CNH (Carteira Nacional de Habilitação)
                     -- Status atual: 'dirigindo', 'folga' ou 'viagem'
        experience TEXT,                               -- Experiência do motorista (campo livre para descrição)
        created_at TIMESTAMP DEFAULT NOW()             -- Data de criação do registro
      );
    `;
		console.log('Tabela "drivers" criada com sucesso.');
	} catch (error) {
		console.error('Erro ao criar a tabela "drivers":', error);
	}
};

createDriversTable();
