from flask import Flask, jsonify, request, redirect, url_for, session
import os
import boto3
import json
import requests
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth

app = Flask(__name__)

# Sample data for dashboard
business_metrics = {
    "sales": 12000,
    "customer_engagement": 85,  # Percentage
    "inventory_levels": {
        "Product A": 30,
        "Product B": 20,
        "Product C": 50
    }
}

# Sample order data
orders = []

@app.route('/')
def home():
    return "Backend is running!"

# API to get business metrics for the dashboard
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    return jsonify(business_metrics)

# API to submit a customer order
@app.route('/api/orders', methods=['POST'])
def submit_order():
    data = request.json
    orders.append(data)
    return jsonify({"message": "Order submitted successfully!", "orders": orders})

# API to get all submitted orders
@app.route('/api/orders', methods=['GET'])
def get_orders():
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

bedrock_agent_runtime = boto3.client('bedrock-agent-runtime')

def query_agent(prompt):
    response = bedrock_agent_runtime.invoke_agent(
        agentId='your-agent-id',
        agentAliasId='your-agent-alias-id',
        sessionId='unique-session-id',  # Generate or reuse for conversation continuity
        inputText=prompt
    )
    
    return response['completion']

# Example usage
result = query_agent("Analyze the order fulfillment process and suggest automation opportunities")
print(result)

if __name__ == '__main__':
    app.run(debug=True)