import { randomUUID } from 'node:crypto';
import { sql } from './db.js';
import bcrypt from 'bcrypt';

export class DatabasePostgres {
  async list(search) {
    let users;

    if (search) {
      users = await sql`SELECT * FROM users WHERE username ILIKE ${`%${search}%`}`;
    } else {
      users = await sql`SELECT * FROM users`;
    }

    return users;
  }

  async create(user) {
    const userId = randomUUID();
    const { username, email, password } = user;

    const existingEmail = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingEmail.length > 0) {
      throw new Error('Email já cadastrado. Por favor, use outro email.');
    }

    const existingUsername = await sql`SELECT * FROM users WHERE username = ${username}`;
    if (existingUsername.length > 0) {
      throw new Error('Nome de usuário já cadastrado. Por favor, escolha outro nome de usuário.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`INSERT INTO users (id, username, email, password) VALUES (${userId}, ${username}, ${email}, ${hashedPassword})`;
  }

  async delete(id) {
    const result = await sql`DELETE FROM users WHERE id = ${id}`;
    if (result.rowCount === 0) {
      throw new Error('Usuário não encontrado.');
    }
    return { message: 'Usuário deletado com sucesso!' };
  }

  async findByEmail(email) {
    const user = await sql`SELECT * FROM users WHERE email = ${email}`;
    return user.length ? user[0] : null;
  }

  async listVehicles() {
    const vehicles = await sql`SELECT * FROM vehicles`;
    return vehicles;
  }

  async createVehicle(vehicle) {
    const vehicleId = randomUUID();
    const { model, brand, plate, year } = vehicle;

    const existingPlate = await sql`SELECT * FROM vehicles WHERE plate = ${plate}`;
    if (existingPlate.length > 0) {
      throw new Error('A placa já está cadastrada. Use outra placa.');
    }

    await sql`INSERT INTO vehicles (id, model, brand, plate, year) VALUES (${vehicleId}, ${model}, ${brand}, ${plate}, ${year})`;
  }

  async deleteVehicle(id) {
    const result = await sql`DELETE FROM vehicles WHERE id = ${id}`;
    if (result.rowCount === 0) {
      throw new Error('Veículo não encontrado.');
    }
    return { message: 'Veículo deletado com sucesso!' };
  }

  async createMovement(movement) {
    const movementId = randomUUID();
    const { vehicle_id, start_location, end_location, distance } = movement;

    await sql`
      INSERT INTO vehicle_movements (id, vehicle_id, start_location, end_location, distance)
      VALUES (${movementId}, ${vehicle_id}, ${start_location}, ${end_location}, ${distance});
    `;

    return { message: 'Movimentação criada com sucesso!' };
  }

  async listMovements() {
    const movements = await sql`
      SELECT vm.*, v.plate as vehicle_plate
      FROM vehicle_movements vm
      JOIN vehicles v ON vm.vehicle_id = v.id
      ORDER BY vm.movement_date DESC
    `;
    return movements;
  }

  async createRefill(refill) {
    const refillId = randomUUID();
    const { vehicle_id, price, mileage, fuel_type } = refill;

    const existingVehicle = await sql`SELECT * FROM vehicles WHERE id = ${vehicle_id}`;
    if (existingVehicle.length === 0) {
      throw new Error('Veículo não encontrado. Não é possível criar o abastecimento.');
    }

    await sql`
      INSERT INTO fuel_refills (id, vehicle_id, price, mileage, fuel_type)
      VALUES (${refillId}, ${vehicle_id}, ${price}, ${mileage}, ${fuel_type});
    `;

    return { message: 'Abastecimento criado com sucesso!' };
  }

  async listRefills() {
    const refills = await sql`
      SELECT fr.*, v.plate as vehicle_plate
      FROM fuel_refills fr
      JOIN vehicles v ON fr.vehicle_id = v.id
      ORDER BY fr.refill_date DESC;
    `;

    return refills;
  }
}
