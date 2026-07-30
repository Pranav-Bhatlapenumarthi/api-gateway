import express from "express";
import cors from 'cors';

export function createApp() {
  const app = express(); // initialises a new express app
  
  app.use(cors());
  app.use(express.json()); // initialises a global middleware for the express app

  app.get('/health', (_, res) => {
    res.status(200).json({
      status: 'okay',
      uptime: process.uptime() // returns the uptime of the process in seconds
    });
  });
 
  return app;
}