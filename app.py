from flask import Flask, redirect, url_for, session, request, jsonify, render_template
import boto3
from authlib.integrations.flask_client import OAuth
import config
import os
import sys
import hmac, hashlib, base64 
import cognito_idp
from cognito_idp import CognitoIdentityProviderWrapper
from flask_cors import CORS
import json
import uuid  # Added for session ID generation
import requests  # Ensure you have requests installed

# Initialize Flask app
app = Flask(__name__, static_folder="static")
app.secret_key = os.urandom(24)  # Secret key for session handling
CORS(app, origins=["http://localhost:3000"])

# Configure OAuth and Cognito
app_client_id = '3uo9it101gch2ik7jlt8ou5ijb'
oauth = OAuth(app)
oauth.register(
    name='oidc',
    authority='https://cognito-idp.us-east-1.amazonaws.com/us-east-1_LhWvaZUmp',
    client_id=app_client_id,
    client_secret='9kpgl8dm8g1tkv5rmdu5fo8m15fr5ghoi6ldtvo5url8nm3dgm2',
    server_metadata_url='https://cognito-idp.us-east-1.amazonaws.com/us-east-1_LhWvaZUmp/.well-known/openid-configuration',
    client_kwargs={'scope': 'email openid phone'}
)
client = boto3.client('cognito-idp', region_name=config.AWS_REGION)
cognito = CognitoIdentityProviderWrapper(client, config.BUSINESS_COGNITO_USER_POOL_ID, config.COGNITO_APP_CLIENT_ID, config.CLIENT_SECRET)

# AWS Bedrock Configuration
bedrock_client = boto3.client(
    'bedrock-runtime',
    region_name='us-east-1',  # Replace with your AWS region
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),  # Use environment variables for credentials
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

# Function to query the Bedrock agent
def query_bedrock_agent(prompt):
    session_id = session.get('session_id', str(uuid.uuid4()))  # Retrieve or generate session ID

    try:
        response = bedrock_client.invoke_agent(
            agentId='YJ9JMZY1PW',  # Replace with your Bedrock agent ID
            agentAliasId='7NEBCEGJS4',  # Replace with your Bedrock agent alias ID
            sessionId=session_id,
            inputText=prompt
        )
        return response['completion']
    except Exception as e:
        print(f"Error querying Bedrock agent: {e}")
        return None

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

# Routes for dashboard
@app.route('/dashboard', methods=['GET'])
def get_dashboard_data():
    return jsonify(business_metrics)

@app.route('/orders', methods=['POST'])
def submit_order():
    data = request.json
    orders.append(data)
    return jsonify({"message": "Order submitted successfully!", "orders": orders})

@app.route('/orders', methods=['GET'])
def get_orders():
    return jsonify({"orders": orders})

# Authentication routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data['username']
    secret_hash = cognito.secret_hash(username)

    try:
        response = client.sign_up(
            ClientId=app_client_id,
            SecretHash=secret_hash,
            Username=data['username'],
            Password=data['password'], 
            UserAttributes=[
                {'Name': 'name', 'Value': f"{data['firstName']} {data['lastName']}"},
                {'Name': 'email', 'Value': data['email']},
                {'Name': 'custom:businessName', 'Value': data['businessName']},
                {'Name': 'custom:businessType', 'Value': data['businessType']},
                {'Name': 'address', 'Value': data['address']},
                {'Name': 'website', 'Value': data['website']},
                {'Name': 'birthdate', 'Value': data['birthdate']},
                {'Name': 'phone_number', 'Value': data['phoneNumbers']}
            ]
        )
        return jsonify({"message": "User is being sent confirmation!", "response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/confirm-sign-up', methods=['POST'])
def confirm_signup():
    data = request.json
    username = data['username']
    secret_hash = cognito.secret_hash(username)
    try:
        response = client.confirm_sign_up(
            ClientId=app_client_id,
            SecretHash=secret_hash,
            Username=data['username'],
            ConfirmationCode=data['code'],
            ForceAliasCreation=False
        )
        return jsonify({"message": "User registered successfully!", "response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']
    secret_hash = cognito.secret_hash(username)

    try:
        response = client.initiate_auth(
            AuthFlow='USER_PASSWORD_AUTH',
            ClientId=app_client_id,
            AuthParameters={'USERNAME': username, 'PASSWORD': password, 'SECRET_HASH': secret_hash}
        )

        # Generate and store session ID
        session['session_id'] = str(uuid.uuid4())

        return jsonify({"message": "User logged in successfully!", "session_id": session['session_id'], "response": response})

    except client.exceptions.NotAuthorizedException:
        return jsonify({"error": "Incorrect username or password"}), 400
    except client.exceptions.UserNotFoundException:
        return jsonify({"error": "User not found"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/authorize')
def authorize():
    token = oauth.oidc.authorize_access_token()
    user = token['userinfo']
    session['user'] = user
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    session.pop('user', None)
    session.pop('session_id', None)  # Clear session ID on logout
    return redirect(url_for('index'))

# API to interact with Amazon Nova Pro model
@app.route('/api/nova-pro', methods=['POST'])
def nova_pro():
    input_text = request.json.get('input_text', '')

    if not input_text:
        return jsonify({"error": "Input text is required"}), 400

    # Retrieve session ID
    session_id = session.get('session_id', str(uuid.uuid4()))

    url = "https://bedrock-runtime.us-east-1.amazonaws.com/model/amazon.nova-pro-v1/invoke"
  # Replace with your actual endpoint
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
            "sessionId": session_id,  # Include session ID
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

# API endpoint to interact with the Bedrock agent
@app.route('/api/bedrock-agent', methods=['POST'])
def bedrock_agent():
    data = request.json
    prompt = data.get('prompt', '')

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    # Query the Bedrock agent
    response = query_bedrock_agent(prompt)
    if response:
        return jsonify({"response": response})
    else:
        return jsonify({"error": "Failed to get a response from the Bedrock agent"}), 500

if __name__ == '__main__':
    app.run(debug=True)
