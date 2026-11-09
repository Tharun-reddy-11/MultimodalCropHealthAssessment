/**
 * Dependency-free development API for the React client.
 * It provides real local SQLite account persistence while the Python ML stack
 * is being installed. Use backend/app/main.py for production ML inference.
 */
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stateDir = path.join(root, 'runtime_data');
fs.mkdirSync(stateDir, { recursive: true });
const db = new DatabaseSync(path.join(stateDir, 'verdantai-dev.db'));
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at TEXT NOT NULL
)`);
const sessions = new Map();
const json = (res, status, payload) => { res.writeHead(status, { 'content-type':'application/json', 'access-control-allow-origin':'http://localhost:5173', 'access-control-allow-headers':'content-type, authorization', 'access-control-allow-methods':'GET,POST,OPTIONS' }); res.end(JSON.stringify(payload)); };
const hash = (password, salt) => crypto.scryptSync(password, salt, 64).toString('hex');
const token = (user) => { const value = crypto.randomBytes(32).toString('hex'); sessions.set(value, { id:user.id, name:user.name, email:user.email }); return value; };
const userFrom = (req) => sessions.get((req.headers.authorization || '').replace('Bearer ', ''));
const body = async (req) => { let data=''; for await (const part of req) data += part; try { return JSON.parse(data || '{}'); } catch { return {}; } };

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (req.method === 'GET' && req.url === '/api/health') return json(res, 200, { status:'ok', model:{ ready:false, mode:'image-only', reason:'Python ML model has not been trained yet.' }});
  if (req.method === 'POST' && req.url === '/api/auth/register') {
    const {name='', email='', password='', confirmPassword=''} = await body(req);
    if (name.trim().length < 2) return json(res, 422, {detail:'Enter your full name.'});
    if (!/^\S+@\S+\.\S+$/.test(email)) return json(res, 422, {detail:'Enter a valid email address.'});
    if (password.length < 8 || !/\d/.test(password)) return json(res, 422, {detail:'Use at least 8 characters including a number.'});
    if (password !== confirmPassword) return json(res, 422, {detail:'Passwords do not match.'});
    const salt = crypto.randomBytes(16).toString('hex');
    try {
      db.prepare('INSERT INTO users(name,email,password_hash,salt,created_at) VALUES(?,?,?,?,?)').run(name.trim(),email.trim().toLowerCase(),hash(password,salt),salt,new Date().toISOString());
      const user = db.prepare('SELECT id,name,email FROM users WHERE email=?').get(email.trim().toLowerCase());
      return json(res, 201, { token:token(user), user });
    } catch { return json(res, 409, {detail:'An account with this email already exists.'}); }
  }
  if (req.method === 'POST' && req.url === '/api/auth/login') {
    const {email='',password=''} = await body(req); const user = db.prepare('SELECT * FROM users WHERE email=?').get(email.trim().toLowerCase());
    if (!user || !crypto.timingSafeEqual(Buffer.from(hash(password,user.salt),'hex'),Buffer.from(user.password_hash,'hex'))) return json(res,401,{detail:'Email or password is incorrect.'});
    return json(res,200,{token:token(user),user:{id:user.id,name:user.name,email:user.email}});
  }
  const user = userFrom(req); if (!user) return json(res,401,{detail:'Your session is invalid or has expired. Please sign in again.'});
  if (req.method === 'GET' && req.url === '/api/me') return json(res,200,user);
  if (req.method === 'GET' && req.url === '/api/overview') return json(res,200,{stats:{total:0,completed:0,healthy:0,needs_review:0},recent:[],model:{ready:false,mode:'image-only',reason:'Train the Python MobileNetV2 model to enable real image prediction.'}});
  if (req.method === 'GET' && req.url.startsWith('/api/assessments')) return json(res,200,[]);
  return json(res,404,{detail:'Endpoint not found.'});
}).listen(8010, '127.0.0.1', () => console.log('VerdantAI development API: http://127.0.0.1:8010'));
