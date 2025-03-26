// src/socket.ts
import { io } from 'socket.io-client';

export const socket = io('http://localhost:5005'); // NestJS sunucu adresin
