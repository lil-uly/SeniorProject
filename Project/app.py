import flask
from flask import Flask, redirect, url_for, session, request, jsonify, render_template
import boto3
from authlib.integrations.flask_client import OAuth
import config as config
import os
import sys
import hmac, hashlib, base64 
import cognito_idp as cognito_idp
from cognito_idp import CognitoIdentityProviderWrapper
from flask_cors import CORS, cross_origin
import json
import uuid
import requests
import logging
from dotenv import load_dotenv
from botocore.exceptions import ClientError
from datetime import datetime, timedelta
from functools import wraps

# Load environment variables
load_dotenv()

# Verify required environment variables
required_env_vars = [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "BEDROCK_AGENT_ID",
    "BEDROCK_AGENT_ALIAS_ID"
]

missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise EnvironmentError(f"Missing required environment variables: {', '.join(missing_vars)}")

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app with session configuration
app = Flask(__name__, static_folder="static")
app.secret_key = os.getenv('FLASK_SECRET_KEY', os.urandom(24))

# Configure session
app.config.update(
    PERMANENT_SESSION_LIFETIME=timedelta(hours=24),
    SESSION_COOKIE_SECURE=False,  # Set to True in production
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax'
)

# Simplified CORS configuration
CORS(app, 
    origins=["http://localhost:3000"],
    supports_credentials=True,
    methods=["GET", "POST", "OPTIONS"])

@app.after_request
def after_request(response):
    """Add CORS headers to every response"""
    origin = request.headers.get('Origin')
    if origin and origin == "http://localhost:3000":
        response.headers.update({
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        })
    return response

# Get Cognito configuration from environment variables
COGNITO_CLIENT_SECRET = os.getenv('COGNITO_CLIENT_SECRET')
if not COGNITO_CLIENT_SECRET:
    raise EnvironmentError("COGNITO_CLIENT_SECRET environment variable is not set")

# Configure AWS Session
aws_session = boto3.Session(
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'us-east-1')
)

# Update client initializations
bedrock_agent_runtime = aws_session.client('bedrock-agent-runtime')
client = aws_session.client('cognito-idp')

# Configure OAuth and Cognito
app_client_id = '3uo9it101gch2ik7jlt8ou5ijb'
oauth = OAuth(app)
oauth.register(
    name='oidc',
    authority='https://cognito-idp.us-east-1.amazonaws.com/us-east-1_LhWvaZUmp',
    client_id=app_client_id,
    client_secret=COGNITO_CLIENT_SECRET,
    server_metadata_url='https://cognito-idp.us-east-1.amazonaws.com/us-east-1_LhWvaZUmp/.well-known/openid-configuration',
    client_kwargs={'scope': 'email openid phone'}
)
cognito = CognitoIdentityProviderWrapper(
    client, 
    config.BUSINESS_COGNITO_USER_POOL_ID, 
    config.COGNITO_APP_CLIENT_ID, 
    COGNITO_CLIENT_SECRET
)

# Agent configuration
AGENT_ID = os.getenv('BEDROCK_AGENT_ID')
AGENT_ALIAS_ID = os.getenv('BEDROCK_AGENT_ALIAS_ID')

# Store conversation history
conversation_sessions = {}

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

# Helper function for login required
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not verify_session():
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.before_request
def before_request():
    """Log session data before each request"""
    logger.debug(f"Request path: {request.path}")
    logger.debug(f"Session data before request: {dict(session)}")
    session.permanent = True
    if session.get('authenticated'):
        session.modified = True

# Routes for dashboard
@app.route('/dashboard', methods=['GET'])
#@login_required
def get_dashboard_data():
    try:
        # Format date for frontend
        last_updated = datetime.now().isoformat()
        
        # Default values in case of missing data
        default_metrics = {
            "sales": 0,
            "customer_engagement": 0,
            "inventory_levels": {}
        }
        
        # Merge default values with actual business metrics
        metrics = {
            **default_metrics,
            **business_metrics
        }
        
        dashboard_data = {
            "username": session.get('username', 'Guest'),
            "lastUpdated": last_updated,
            "metrics": {
                "sales": metrics["sales"],
                "customer_engagement": metrics["customer_engagement"],
                "inventory_levels": metrics["inventory_levels"] or {}
            },
            "orders": orders or []
        }

        logger.debug(f"Sending dashboard data: {dashboard_data}")
        return jsonify(dashboard_data)

    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}", exc_info=True)
        # Return a valid data structure even in error case
        return jsonify({
            "username": "Guest",
            "lastUpdated": datetime.now().isoformat(),
            "metrics": {
                "sales": 0,
                "customer_engagement": 0,
                "inventory_levels": {}
            },
            "orders": [],
            "error": "Failed to fetch dashboard data"
        }), 500

@app.route('/orders', methods=['POST'])
#@login_required
def submit_order():
    data = request.json
    orders.append(data)
    return jsonify({"message": "Order submitted successfully!", "orders": orders})

@app.route('/orders', methods=['GET'])
#@login_required
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
        user_attributes = construct_user_attributes(data)
        response = client.sign_up(
            ClientId=app_client_id,
            SecretHash=secret_hash,
            Username=username,
            Password=data['password'],
            UserAttributes=user_attributes
        )
        return jsonify({"message": "User is being sent confirmation!", "response": response})
    except Exception as e:
        logger.error(f"Error during signup: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 400

def construct_user_attributes(data):
    """Helper function to construct user attributes for Cognito."""
    return [
        {'Name': 'name', 'Value': f"{data['firstName']} {data['lastName']}"},
        {'Name': 'email', 'Value': data['email']},
        {'Name': 'custom:businessName', 'Value': data['businessName']},
        {'Name': 'custom:businessType', 'Value': data['businessType']},
        {'Name': 'address', 'Value': data['address']},
        {'Name': 'website', 'Value': data['website']},
        {'Name': 'birthdate', 'Value': data['birthdate']},
        {'Name': 'phone_number', 'Value': data['phoneNumbers']}
    ]

@app.route('/confirm-sign-up', methods=['POST'])
def confirm_signup():
    logger.info("Received request to confirm signup")
    data = request.json
    username = data['username']
    logger.debug(f"Username: {username}")
    secret_hash = cognito.secret_hash(username)
    try:
        logger.info("Attempting to confirm signup")
        response = client.confirm_sign_up(
            ClientId=app_client_id,
            SecretHash=secret_hash,
            Username=data['username'],
            ConfirmationCode=data['code'],
            ForceAliasCreation=False
        )
        return jsonify({"message": "User registered successfully!", "response": response})
    except Exception as e:
        logger.error(f"Unexpected error during signup: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error",
            "message": "An unexpected error occurred during signup. Please try again later."
        }), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data['username']
        password = data['password']
        secret_hash = cognito.secret_hash(username)

        response = client.initiate_auth(
            AuthFlow='USER_PASSWORD_AUTH',
            ClientId=app_client_id,
            AuthParameters={
                'USERNAME': username,
                'PASSWORD': password,
                'SECRET_HASH': secret_hash
            }
        )

        auth_result = response['AuthenticationResult']
        session_id = str(uuid.uuid4())

        # Set session data directly with session dict
        session.clear()
        session['authenticated'] = True
        session['username'] = username
        session['access_token'] = auth_result['AccessToken']
        session['id_token'] = auth_result['IdToken']
        session['session_id'] = session_id
        session['login_time'] = datetime.now().isoformat()
        session.permanent = True

        logger.info(f"User {username} logged in successfully")
        logger.debug(f"Session data after login: {dict(session)}")

        return jsonify({
            "message": "Login successful",
            "username": username,
            "id_token": auth_result['IdToken'],
            "access_token": auth_result['AccessToken'],
            "session_id": session_id
        })

    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Login failed",
            "message": str(e)
        }), 500

@app.route('/authorize')
def authorize():
    token = oauth.oidc.authorize_access_token()
    user = token['userinfo']
    session['user'] = user
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    """Handle user logout"""
    try:
        # Clear session data
        session.clear()
        return jsonify({"message": "Logged out successfully"})
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({"error": "Logout failed"}), 500

# API to interact with Amazon Nova Pro model
@app.route('/api/nova-pro', methods=['POST'])
#@login_required
def nova_pro():
    input_text = request.json.get('input_text', '')

    if not input_text:
        return jsonify({"error": "Input text is required"}), 400

    session_id = get_session_id()
    body = construct_nova_pro_request_body(input_text, session_id)

    url = "https://bedrock-runtime.us-east-1.amazonaws.com/model/amazon.nova-pro-v1/invoke"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    response = requests.post(url, headers=headers, json=body)
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Failed to get response from Amazon Nova Pro"}), response.status_code

def get_session_id():
    """Retrieve or generate a session ID."""
    return session.get('session_id', str(uuid.uuid4()))

def construct_nova_pro_request_body(input_text, session_id):
    """Construct the request body for the Nova Pro API."""
    return {
        "modelId": "amazon.nova-pro-v1:0",
        "contentType": "application/json",
        "accept": "application/json",
        "body": {
            "inferenceConfig": {
                "max_new_tokens": 1000
            },
            "sessionId": session_id,
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

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
@cross_origin(
    origin='http://localhost:3000',
    supports_credentials=True,
    methods=['POST', 'OPTIONS'],
    allow_headers=['Content-Type']
)
#@login_required
def chat():
    """Handle chat requests and preflight"""
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        user_message = data.get('message')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400

        # Get session ID from Flask session
        session_id = flask.session.get('session_id')
        if not session_id:
            session_id = str(uuid.uuid4())
            flask.session['session_id'] = session_id

        try:
            response = bedrock_agent_runtime.invoke_agent(
                agentId=AGENT_ID,
                agentAliasId=AGENT_ALIAS_ID,
                sessionId=session_id,
                inputText=user_message
            )
            
            # Extract completion from response
            completion = None
            for event in response['completion']:
                if 'chunk' in event and 'bytes' in event['chunk']:
                    completion = event['chunk']['bytes'].decode('utf-8')
                    break
            
            if not completion:
                raise ValueError("No completion in response")

            return jsonify({
                'response': completion,
                'sessionId': session_id
            })

        except ClientError as e:
            logger.error(f"Bedrock error: {str(e)}", exc_info=True)
            return jsonify({
                'error': 'Bedrock error',
                'message': str(e)
            }), 500

    except Exception as e:
        logger.error(f"Chat error: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Chat failed',
            'message': str(e)
        }), 500

@app.route('/api/reset-chat', methods=['POST'])
#@login_required
def reset_chat():
    """Reset chat session and clear history"""
    try:
        data = request.json
        session_id = data.get('sessionId')
        
        if not session_id:
            return jsonify({'error': 'Session ID is required'}), 400
        
        # Clear chat history for this session
        if session_id in conversation_sessions:
            conversation_sessions[session_id] = {
                'created_at': datetime.now(),
                'messages': []
            }
            logger.info(f"Reset session: {session_id}")
            return jsonify({'message': 'Chat history cleared'})
        else:
            # Create new session if it doesn't exist
            conversation_sessions[session_id] = {
                'created_at': datetime.now(),
                'messages': []
            }
            return jsonify({'message': 'New chat session created'})
            
    except Exception as e:
        logger.error(f"Error resetting chat: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred while resetting the chat'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # Verify Bedrock agent configuration
        if not AGENT_ID or not AGENT_ALIAS_ID:
            return jsonify({
                'status': 'error',
                'message': 'Bedrock agent not configured'
            }), 500
            
        return jsonify({
            'status': 'healthy',
            'agent_id': AGENT_ID,
            'agent_alias_id': AGENT_ALIAS_ID
        })
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

def verify_bedrock_connection():
    try:
        # Test the connection using invoke_agent instead of retrieve
        response = bedrock_agent_runtime.invoke_agent(
            agentId=AGENT_ID,
            agentAliasId=AGENT_ALIAS_ID,
            sessionId=str(uuid.uuid4()),
            inputText="test query"
        )
        logger.info("Successfully connected to Bedrock agent")
        return True
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        logger.error(f"Bedrock error: {error_code} - {error_message}")
        return False
    except Exception as e:
        logger.error(f"Failed to connect to Bedrock: {str(e)}", exc_info=True)
        return False

# Add this helper function to test AWS credentials
def verify_aws_credentials():
    try:
        sts = boto3.client('sts')
        identity = sts.get_caller_identity()
        logger.info(f"AWS Identity verified: {identity['Arn']}")
        return True
    except Exception as e:
        logger.error(f"Failed to verify AWS credentials: {str(e)}", exc_info=True)
        return False

def verify_session():
    """Verify if the current session is valid"""
    try:
        session_data = dict(flask.session)
        logger.debug(f"Verifying session data: {session_data}")
        
        # Check for required session data
        if not all(key in session_data for key in ['authenticated', 'username', 'access_token']):
            logger.debug("Missing required session data")
            return False
        
        # Verify authentication flag
        if not session_data['authenticated']:
            logger.debug("Session not authenticated")
            return False
            
        # Verify login time if present
        login_time = session_data.get('login_time')
        if login_time:
            login_datetime = datetime.fromisoformat(login_time)
            if datetime.now() - login_datetime > timedelta(hours=24):
                logger.debug("Session expired")
                flask.session.clear()
                return False

        logger.debug("Session verified successfully")
        return True

    except Exception as e:
        logger.error(f"Session verification error: {str(e)}", exc_info=True)
        return False

if __name__ == '__main__':
    # Ensure secret key is set
    if not app.secret_key:
        logger.error("❌ Flask secret key not set")
        sys.exit(1)
        
    if not verify_aws_credentials():
        logger.error("❌ Failed to verify AWS credentials")
        sys.exit(1)
        
    if not verify_bedrock_connection():
        logger.error("❌ Failed to verify Bedrock connection")
        sys.exit(1)
        
    logger.info("✅ AWS and Bedrock connections verified")
    app.run(port=5001, debug=True)
