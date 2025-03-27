from flask import Blueprint, jsonify, request
from flask_cors import CORS

dashboard_bp = Blueprint('dashboard', __name__)
CORS(dashboard_bp)

business_metrics = {
    "sales": 12000,
    "customer_engagement": 85,
    "inventory_levels": {"Product A": 30, "Product B": 20, "Product C": 50}
}

orders = []

@dashboard_bp.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    return jsonify(business_metrics)

@dashboard_bp.route('/api/orders', methods=['POST'])
def submit_order():
    data = request.json
    orders.append(data)
    return jsonify({"message": "Order submitted successfully!", "orders": orders})

@dashboard_bp.route('/api/orders', methods=['GET'])
def get_orders():
    return jsonify({"orders": orders})