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

-- Create indexes for better query performance
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_engagement_customer ON customer_engagement(customer_id);
CREATE INDEX idx_engagement_timestamp ON customer_engagement(timestamp);

-- test data
-- Insert test data into customers table
INSERT INTO customers (name, email) VALUES 
('John Doe', 'john.doe@example.com'),
('Jane Smith', 'jane.smith@example.com'),
('Alice Johnson', 'alice.johnson@example.com'),
('Bob Brown', 'bob.brown@example.com');

-- Insert test data into products table
INSERT INTO products (name, description, price) VALUES 
('Product A', 'Description for product A', 10.99),
('Product B', 'Description for product B', 20.99),
('Product C', 'Description for product C', 30.99),
('Product D', 'Description for product D', 40.99);

-- Insert test data into inventory table
INSERT INTO inventory (product_id, quantity, reorder_point) VALUES 
(1, 100, 10),
(2, 200, 20),
(3, 300, 30),
(4, 400, 40);

-- Insert test data into orders table
INSERT INTO orders (customer_id, order_date) VALUES 
(1, '2023-01-01 10:00:00'),
(2, '2023-01-02 11:00:00'),
(3, '2023-01-03 12:00:00'),
(4, '2023-01-04 13:00:00');

-- Insert test data into order_items table
INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES 
(1, 1, 2, 10.99),
(1, 2, 1, 20.99),
(2, 3, 3, 30.99),
(3, 4, 4, 40.99),
(4, 1, 1, 10.99);

-- Insert test data into customer_engagement table
INSERT INTO customer_engagement (customer_id, engagement_type, engagement_value) VALUES 
(1, 'website_visit', 5),
(2, 'purchase', 10),
(3, 'support_contact', 3),
(4, 'website_visit', 7);