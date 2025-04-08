const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors()); // allow cross-origin requests
app.use(express.json()); // parse JSON request body
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");


// Setup PostgreSQL connection
const pool = new Pool({
  user: 'cloudadmin',
  host: 'localhost',
  database: 'cloud_catalyst',
  password: 'SeniorProject2!',
  port: 5432, // default PostgreSQL port
});

// API endpoint to receive business data
app.post('/api/save-business', async (req, res) => {
  const {
    business_name,
    business_type,
    address,
    business_email,
    first_name,
    last_name,
    number_of_employees,
    annual_revenue,
  } = req.body;

  try {
    const query = `
      INSERT INTO businesses (
        business_name, business_type, address, business_email,
        first_name, last_name, number_of_employees, annual_revenue
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING business_id
    `;

    const values = [
      business_name,
      business_type,
      address,
      business_email,
      first_name,
      last_name,
      parseInt(number_of_employees),
      parseFloat(annual_revenue),
    ];

    const result = await pool.query(query, values);
    res.json({ message: 'Business saved!', business_id: result.rows[0].business_id });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: 'DB insert failed' });
  }
});

// Start server
app.listen(3001, () => {
  console.log('Backend running on http://localhost:3000');
});