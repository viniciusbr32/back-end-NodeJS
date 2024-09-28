// GET, POST, PATCH, PUT, DELETE

import { fastify } from 'fastify';
import { DatabasePostgres } from './database-postgres.js';

const server = fastify();

const database = new DatabasePostgres();

server.post('/videos', async (request, response) => {
  const { title, description, duration } = request.body;

  await database.create({
    title,
    description,
    duration,
  });

  return response.status(201).send();
});

server.get('/videos', async (request) => {
  const search = request.query.search;

  console.log(search);
  const videos = await database.list(search);

  return videos;
});

server.put('/videos/:id', async (request, response) => {
  const videoId = request.params.id;
  const { title, description, duration } = request.body;

  const video = await database.update(videoId, {
    title,
    description,
    duration,
  });

  return response.status(204).send();
});

server.delete('/videos/:id', async (request, response) => {
  const videoId = request.params.id;

  await database.delete(videoId);

  return response.status(204).send();
});

server.listen({
  port: 3000,
});
