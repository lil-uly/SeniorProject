-- Create the database if it doesn't exist
DO $$ BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'cloud_catalyst') THEN
      CREATE DATABASE cloud_catalyst;
   END IF;
END $$;

-- Connect to the database
\c cloud_catalyst;
-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS customer_engagement CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;


-- Create the tables

-- Customer table
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reorder_point INTEGER,
    CONSTRAINT positive_quantity CHECK (quantity >= 0)
);

-- Sales/Orders table
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    total_amount DECIMAL(10,2),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order details table
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER,
    price_at_time DECIMAL(10,2),
    CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Customer engagement table
CREATE TABLE customer_engagement (
    engagement_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    engagement_type VARCHAR(50),  -- e.g., 'website_visit', 'purchase', 'support_contact'
    engagement_value INTEGER,     -- Numeric value representing engagement level
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Businesses table
CREATE TABLE businesses (
    business_id SERIAL PRIMARY KEY,
    business_name VARCHAR(255),
    business_type VARCHAR(255),
    address TEXT,
    business_email VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    number_of_employees INTEGER,
    annual_revenue NUMERIC DEFAULT 0
);

-- Monthly revenue table
CREATE TABLE monthly_revenue (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    jan DECIMAL(10, 2) DEFAULT 0,
    feb DECIMAL(10, 2) DEFAULT 0,
    mar DECIMAL(10, 2) DEFAULT 0,
    apr DECIMAL(10, 2) DEFAULT 0,
    may DECIMAL(10, 2) DEFAULT 0,
    jun DECIMAL(10, 2) DEFAULT 0,
    jul DECIMAL(10, 2) DEFAULT 0,
    aug DECIMAL(10, 2) DEFAULT 0,
    sep DECIMAL(10, 2) DEFAULT 0,
    oct DECIMAL(10, 2) DEFAULT 0,
    nov DECIMAL(10, 2) DEFAULT 0,
    dec DECIMAL(10, 2) DEFAULT 0
);

-- Create indexes for better query performance
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_engagement_customer ON customer_engagement(customer_id);
CREATE INDEX idx_engagement_timestamp ON customer_engagement(timestamp);