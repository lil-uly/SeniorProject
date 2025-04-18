import boto3
import os
from dotenv import load_dotenv
import logging
import json
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def verify_env_vars():
    required_vars = [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_REGION',
        'BEDROCK_KNOWLEDGE_BASE_ID'
    ]
    
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        logger.error(f"Missing required environment variables: {', '.join(missing)}")
        return False
    return True

def test_bedrock_setup():
    load_dotenv()
    
    if not verify_env_vars():
        sys.exit(1)
    
    try:
        # Create Bedrock client
        session = boto3.Session(
            region_name=os.getenv('AWS_REGION'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        bedrock_agent = session.client('bedrock-agent-runtime')
        
        # Get configuration
        knowledge_base_id = os.getenv('BEDROCK_KNOWLEDGE_BASE_ID')
        
        logger.info(f"Testing Bedrock with Knowledge Base ID: {knowledge_base_id}")
        
        # Test retrieve functionality
        response = bedrock_agent.retrieve(
            knowledgeBaseId=knowledge_base_id,
            retrievalQuery={
                'text': 'What services do you offer?'
            },
            retrievalConfiguration={
                'vectorSearchConfiguration': {
                    'numberOfResults': 3
                }
            }
        )
        
        logger.info("✅ Successfully connected to Bedrock agent")
        logger.info(f"Response: {json.dumps(response, indent=2)}")
        
    except Exception as e:
        logger.error(f"❌ Error testing Bedrock: {str(e)}")
        raise

if __name__ == "__main__":
    test_bedrock_setup()