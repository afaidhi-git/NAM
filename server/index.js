
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); 

const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'nexus',
  password: process.env.DB_PASSWORD || 'nexus_password',
  database: process.env.DB_NAME || 'nexus_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

// Retry connection logic for Docker startup
const connectDB = async () => {
  try {
    pool = mysql.createPool(dbConfig);
    await pool.query('SELECT 1');
    console.log('Connected to MySQL');
    
    // Initialize Schema
    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'schema.sql'), 'utf8');
    const statements = schemaSql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) await pool.query(statement);
    }
    console.log('Database initialized');

  } catch (err) {
    console.error('MySQL connection failed, retrying in 5s...', err.message);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// --- API Routes ---

// Get All Assets
app.get('/api/assets', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM assets ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save Asset (Upsert)
app.post('/api/assets', async (req, res) => {
  const asset = req.body;
  const sql = `
    INSERT INTO assets (id, name, model, serialNumber, type, status, purchaseDate, price, assignedTo, notes, renewalDate, billingCycle)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    name=VALUES(name), model=VALUES(model), serialNumber=VALUES(serialNumber), type=VALUES(type),
    status=VALUES(status), purchaseDate=VALUES(purchaseDate), price=VALUES(price),
    assignedTo=VALUES(assignedTo), notes=VALUES(notes), renewalDate=VALUES(renewalDate), billingCycle=VALUES(billingCycle)
  `;
  const params = [
    asset.id, asset.name, asset.model, asset.serialNumber, asset.type, asset.status, 
    asset.purchaseDate || null, asset.price, asset.assignedTo, asset.notes, 
    asset.renewalDate || null, asset.billingCycle
  ];

  try {
    await pool.query(sql, params);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Asset
app.delete('/api/assets/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM assets WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
