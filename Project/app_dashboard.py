from flask import Flask, jsonify, request, redirect, url_for, session
import os
import boto3
import json
import requests
import psycopg2
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # Allow requests from the frontend

# API to handle business registration
@app.route('/api/register-business', methods=['POST'])
def register_business():
    data = request.json
    conn = create_connection()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute('''
                INSERT INTO businesses (business_name, business_type, address, business_email, first_name, last_name)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (
                data['businessName'],
                data['businessType'],
                data['physicalAddress'],
                data['email'],
                data['firstName'],
                data['lastName']
            ))
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"message": "Business registered successfully!"}), 201
        except Exception as e:
            print(f"An error occurred while inserting data: {e}")
            return jsonify({"error": "Failed to register business"}), 500
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500
    

# Database connection function
def create_connection():
    try:
        conn = psycopg2.connect(
            dbname="cloud_catalyst",
            user="cloudadmin",
            password="SeniorProject2!",
            host="localhost",
            port="5432"
        )
        return conn
    except Exception as e:
        print(f"An error occurred while connecting to the database: {e}")
        return None


# Fetch business metrics from the database
def fetch_business_metrics():
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        cur.execute('''
            SELECT 
                (SELECT COUNT(*) FROM orders) AS total_sales,
                (SELECT AVG(engagement_value) FROM customer_engagement) AS avg_engagement,
                (SELECT json_agg(json_build_object('product', name, 'quantity', quantity)) FROM inventory) AS inventory_levels
        ''')
        result = cur.fetchone()
        cur.close()
        conn.close()
        return {
            "sales": result[0],
            "customer_engagement": result[1],
            "inventory_levels": result[2]
        }
    return None

# Fetch orders from the database
def fetch_orders():
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        cur.execute('SELECT * FROM orders')
        orders = cur.fetchall()
        cur.close()
        conn.close()
        return orders
    return []

@app.route('/')
def home():
    return "Backend is running!"

# API to get business metrics for the dashboard
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    metrics = fetch_business_metrics()
    if metrics:
        return jsonify(metrics)
    else:
        return jsonify({"error": "Unable to fetch business metrics"}), 500

# API to submit a customer order
@app.route('/api/orders', methods=['POST'])
def submit_order():
    data = request.json
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        cur.execute('''
            INSERT INTO orders (customer_id, order_date)
            VALUES (%s, %s)
        ''', (data['customer_id'], data['order_date']))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Order submitted successfully!"})
    else:
        return jsonify({"error": "Unable to submit order"}), 500

# API to get all submitted orders
@app.route('/api/orders', methods=['GET'])
def get_orders():
    orders = fetch_orders()
    return jsonify({"orders": orders})

# API to interact with Amazon Nova Pro model
@app.route('/api/nova-pro', methods=['POST'])
def nova_pro():
    input_text = request.json.get('input_text', '')
    if not input_text:
        return jsonify({"error": "Input text is required"}), 400

    url = "https://your-amazon-nova-pro-endpoint"  # Replace with your actual endpoint
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    body = {
        "modelId": "amazon.nova-pro-v1:0",
        "contentType": "application/json",
        "accept": "application/json",
        "body": {
            "inferenceConfig": {
                "max_new_tokens": 1000
            },
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "text": input_text
                        }
                    ]
                }
            ]
        }
    }

    response = requests.post(url, headers=headers, json=body)
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Failed to get response from Amazon Nova Pro"}), response.status_code

@app.route('/api/bedrock-agent', methods=['POST', 'OPTIONS'])
def bedrock_agent():
    if request.method == 'OPTIONS':
        return '', 200  # Handle preflight request
    data = request.json
    prompt = data.get('prompt', '')

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    # Simulate a response from the Bedrock agent for testing
    response = {"completion": f"Echo: {prompt}"}

    return jsonify({"response": response["completion"]})


@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200  # Handle preflight request
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username == 'testuser' and password == 'password123':
        return jsonify({"message": "Login successful!"})
    else:
        return jsonify({"error": "Invalid credentials"}), 401

bedrock_agent_runtime = boto3.client('bedrock-agent-runtime')

def query_agent(prompt):
    response = bedrock_agent_runtime.invoke_agent(
        agentId='your-agent-id',
        agentAliasId='your-agent-alias-id',
        sessionId='unique-session-id',  # Generate or reuse for conversation continuity
        inputText=prompt
    )
    
    return response['completion']



if __name__ == '__main__':
    app.run(debug=True)