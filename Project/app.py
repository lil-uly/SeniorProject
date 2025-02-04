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

if __name__ == '__main__':
    app.run(debug=True)
