import { sql } from './db.js';

const createFuelRefillsTable = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS fuel_refills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- ID do abastecimento
        vehicle_id UUID REFERENCES vehicles(id),         -- ID do veículo referenciado
        price NUMERIC NOT NULL,                         -- Preço do abastecimento
        mileage NUMERIC NOT NULL,                       -- Quilometragem do carro no momento do abastecimento
        fuel_type VARCHAR(50) NOT NULL,                 -- Tipo de combustível (gasolina, etanol, diesel)
        refill_date TIMESTAMP DEFAULT NOW()             -- Data do abastecimento, por padrão a data atual
      );
    `;
    console.log('Tabela "fuel_refills" criada com sucesso.');
  } catch (error) {
    console.error('Erro ao criar a tabela "fuel_refills":', error);
  }
};

createFuelRefillsTable();
