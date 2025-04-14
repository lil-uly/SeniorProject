from flask import Flask, jsonify, request, redirect, url_for, session
import os
import boto3
import json
import requests
import psycopg2
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from chatbot_config import BEDROCK_AGENT_CONFIG
import uuid
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)
logger.error("Error message", exc_info=True)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # Allow requests from the frontend

# Initialize AWS Bedrock clients
bedrock_runtime = boto3.client(
    service_name="bedrock-runtime",
    region_name=os.getenv("AWS_REGION", "us-east-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

bedrock_agent = boto3.client(
    service_name="bedrock-agent-runtime",
    region_name=os.getenv("AWS_REGION", "us-east-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

# Store conversation history
conversation_sessions = {}

# Chat endpoint
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        session_id = data.get('sessionId', 'default_session')
        
        # Initialize session if it doesn't exist
        if session_id not in conversation_sessions:
            conversation_sessions[session_id] = []
        
        # Add user message to conversation history
        conversation_sessions[session_id].append({
            "role": "user",
            "content": user_message
        })
        
        # Prepare parameters for Bedrock Agent
        params = {
            "agentId": os.getenv("BEDROCK_AGENT_ID"),
            "agentAliasId": os.getenv("BEDROCK_AGENT_ALIAS_ID"),
            "sessionId": session_id,
            "inputText": user_message
        }
        
        # Invoke the Bedrock Agent
        response = bedrock_agent.invoke_agent(**params)
        
        # Process the response
        completion_reason = response.get('completionReason', '')
        agent_response = ''
        
        # Extract response from chunks if streaming
        if 'chunks' in response:
            for chunk in response['chunks']:
                if 'chunk' in chunk and 'bytes' in chunk['chunk']:
                    chunk_data = json.loads(chunk['chunk']['bytes'].decode('utf-8'))
                    if 'content' in chunk_data:
                        agent_response += chunk_data['content']
        
        # If not streaming or empty response
        if not agent_response and 'completion' in response:
            agent_response = response['completion']
        
        # Add agent response to conversation history
        conversation_sessions[session_id].append({
            "role": "assistant",
            "content": agent_response
        })
        
        # Trim conversation history if too long (to prevent token limits)
        if len(conversation_sessions[session_id]) > 100:
            conversation_sessions[session_id] = conversation_sessions[session_id][-100:]
        
        return jsonify({
            "response": agent_response,
            "completionReason": completion_reason,
            "sessionId": session_id
        })
        
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        return jsonify({
            "error": str(e),
            "response": "Sorry, there was an error processing your request."
        }), 500

# Reset chat endpoint
@app.route('/api/reset-chat', methods=['POST'])
def reset_chat():
    try:
        data = request.json
        session_id = data.get('sessionId', 'default_session')
        
        # Clear conversation history for session
        if session_id in conversation_sessions:
            conversation_sessions[session_id] = []
        
        return jsonify({"status": "success", "message": "Chat history cleared"})
    except Exception as e:
        logger.error(f"Error resetting chat: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

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

@app.route('/api/bedrock-agent', methods=['POST', 'OPTIONS'])
def bedrock_agent():
    if request.method == 'OPTIONS':
        return '', 200  # Handle preflight request

    data = request.json
    prompt = data.get('prompt', '')

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    # Query the Bedrock agent
    response = query_agent(prompt)
    if "error" in response:
        return jsonify(response), 500  # Return the error response with a 500 status code
    else:
        return jsonify({"response": response})


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


if __name__ == '__main__':
    app.run(debug=True)