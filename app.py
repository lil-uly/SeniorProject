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

app = Flask(__name__, static_folder="static")

CORS(app)

app_client_id = '3uo9it101gch2ik7jlt8ou5ijb'

# app.secret_key = os.urandom(24)  # Use a secure random key in production
oauth = OAuth(app)
oauth.register(
  name='oidc',
  authority='https://cognito-idp.us-east-1.amazonaws.com/us-east-1_LhWvaZUmp',
  client_id='3uo9it101gch2ik7jlt8ou5ijb',
  client_secret='9kpgl8dm8g1tkv5rmdu5fo8m15fr5ghoi6ldtvo5url8nm3dgm2',
  server_metadata_url='https://cognito-idp.us-east-1.amazonaws.com/us-east-1_LhWvaZUmp/.well-known/openid-configuration',
  client_kwargs={'scope': 'email openid phone'}
)
client = boto3.client('cognito-idp', region_name=config.AWS_REGION)
cognito = CognitoIdentityProviderWrapper(client, config.BUSINESS_COGNITO_USER_POOL_ID, config.COGNITO_APP_CLIENT_ID, config.CLIENT_SECRET)

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
            UserAttributes=[{
                'Name': 'name',
                'Value': data['name'],
             }, 
             {
                'Name': 'email',
                'Value': data['email'],
             },
             {
                'Name': 'address',
                'Value': data['address'],
             },
             {
                'Name': 'birthdate',
                'Value': data['birthday'],
             },
             {
                'Name': 'phone_number',
                'Value': data['phonenumber']
             }]
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
            ForceAliasCreation=False # ensures that people can't sign up with same # or email 
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
            AuthParameters={'USERNAME': username, 'PASSWORD': password, 'SECRET_HASH': secret_hash})
        return jsonify({"message": "User logged in successfully!", "response": response})
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
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
