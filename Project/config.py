import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Validate required environment variables
required_env_vars = [
    "BEDROCK_AGENT_ID",
    "BEDROCK_AGENT_ALIAS_ID",
    "AWS_REGION",
    "BUSINESS_COGNITO_USER_POOL_ID",
    "COGNITO_APP_CLIENT_ID",
    "CLIENT_SECRET"
]

missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise EnvironmentError(f"Missing required environment variables: {', '.join(missing_vars)}")

# AWS Bedrock Agent Configuration
BEDROCK_AGENT_CONFIG = {
    "agentId": os.getenv("BEDROCK_AGENT_ID"),  # AWS Bedrock agent ID
    "agentAliasId": os.getenv("BEDROCK_AGENT_ALIAS_ID"),  # AWS Bedrock agent alias ID
    "region": os.getenv("AWS_REGION"),  # AWS region
}

# AWS Cognito Configuration
AWS_REGION = os.getenv("AWS_REGION")
BUSINESS_COGNITO_USER_POOL_ID = os.getenv("BUSINESS_COGNITO_USER_POOL_ID")
COGNITO_APP_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

