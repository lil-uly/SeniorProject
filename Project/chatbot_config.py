import os

# Bedrock Agent Configuration
BEDROCK_AGENT_CONFIG = {
    "agentId": os.getenv("BEDROCK_AGENT_ID", "YJ9JMZY1PW"), # AWS Bedrock agent ID
    "agentAliasId": os.getenv("BEDROCK_AGENT_ALIAS_ID", "7NEBCEGJS4"),  # AWS Bedrock agent alias ID
    "region": os.getenv("AWS_REGION", "us-east-1"),  # AWS region
}