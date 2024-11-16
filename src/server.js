import { fastify } from 'fastify';
import { DatabasePostgres } from './database-postgres.js';
import bcrypt from 'bcrypt';
import cors from '@fastify/cors';

const server = fastify();
const database = new DatabasePostgres();

server.register(cors, {
  origin: '*',
});

server.get('/users', async (request, reply) => {
  const search = request.query.search;
  const users = await database.list(search);
  return users;
});

server.post('/cadastro', async (request, reply) => {
  const user = request.body;

  if (!user.username || !user.email || !user.password) {
    return reply.status(400).send({ error: 'Nome de usuário, email e senha são obrigatórios.' });
  }

  try {
    await database.create(user);
    return reply.status(201).send({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    return reply.status(400).send({ error: error.message });
  }
});

server.delete('/users/:id', async (request, reply) => {
  const { id } = request.params;

  try {
    const response = await database.delete(id);
    return reply.status(200).send(response);
  } catch (error) {
    return reply.status(404).send({ error: error.message });
  }
});

server.post('/login', async (request, reply) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return reply.status(400).send({ error: 'Email e senha são obrigatórios.' });
  }

  const user = await database.findByEmail(email);

  if (!user) {
    return reply.status(401).send({ error: 'Email ou senha inválidos.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return reply.status(401).send({ error: 'Email ou senha inválidos.' });
  }

  return reply.send({ message: 'Login realizado com sucesso!' });
});

server.get('/vehicles', async (request, reply) => {
  try {
    const vehicles = await database.listVehicles();
    return reply.send(vehicles);
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao listar veículos.' });
  }
});

server.post('/vehicles', async (request, reply) => {
  const vehicle = request.body;

  if (!vehicle.model || !vehicle.brand || !vehicle.plate || !vehicle.year) {
    return reply.status(400).send({ error: 'Model, brand, plate e year são obrigatórios.' });
  }

  try {
    await database.createVehicle(vehicle);
    return reply.status(201).send({ message: 'Veículo cadastrado com sucesso!' });
  } catch (error) {
    return reply.status(400).send({ error: error.message });
  }
});

server.delete('/vehicles/:id', async (request, reply) => {
  const { id } = request.params;

  try {
    const response = await database.deleteVehicle(id);
    return reply.status(200).send(response);
  } catch (error) {
    return reply.status(404).send({ error: error.message });
  }
});

server.get('/movements', async (request, reply) => {
  try {
    const movements = await database.listMovements();
    return reply.send(movements);
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao listar movimentações.' });
  }
});

server.post('/movements', async (request, reply) => {
  const movement = request.body;

  if (!movement.vehicle_id || !movement.start_location || !movement.end_location || !movement.distance) {
    return reply.status(400).send({ error: 'Vehicle ID, start location, end location e distance são obrigatórios.' });
  }

  try {
    const createdMovement = await database.createMovement(movement);
    return reply.status(201).send(createdMovement);
  } catch (error) {
    return reply.status(400).send({ error: error.message });
  }
});

server.get('/refills', async (request, reply) => {
  try {
    const refills = await database.listRefills();
    return reply.send(refills);
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao listar abastecimentos.' });
  }
});

server.post('/refills', async (request, reply) => {
  const refill = request.body;

  if (!refill.vehicle_id || !refill.price || !refill.mileage || !refill.fuel_type) {
    return reply.status(400).send({
      error: 'Vehicle ID, price, mileage e fuel type são obrigatórios.',
    });
  }

  try {
    const createdRefill = await database.createRefill(refill);
    return reply.status(201).send(createdRefill);
  } catch (error) {
    return reply.status(400).send({ error: error.message });
  }
});

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Servidor rodando em ${address}`);
});
