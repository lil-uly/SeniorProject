import boto3
import json

bedrock = boto3.client(service_name='bedrock-runtime')

def lambda_handler(event, context):
    # Extract user input from the frontend (e.g., API Gateway)
    user_input = json.loads(event['body'])
    
    # Step 1: Ask for goals (if not provided)
    if 'goals' not in user_input:
        return {
            'statusCode': 200,
            'body': json.dumps({
                'response': "What are your top three business goals? (e.g., 'Increase sales, Reduce costs, Improve customer retention')"
            })
        }
    
    # Step 2: Generate tips if goals are provided
    goals = user_input['goals'].split(',')[:3]  # Get top 3 goals
    
    # Call Bedrock to generate tips
    prompt = f"""
    You are a business advisor. Provide 3 actionable tips for each of these business goals:
    Goals: {', '.join(goals)}
    
    Format the response as:
    Goal 1: [Goal]
    - Tip 1: [Tip]
    - Tip 2: [Tip]
    - Tip 3: [Tip]
    """
    
    response = bedrock.invoke_model(
        modelId='anthropic.claude-v2',
        body=json.dumps({
            "prompt": prompt,
            "max_tokens_to_sample": 500
        })
    )
    
    # Parse and return the response
    tips = json.loads(response['body'].read())['completion']
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'response': tips
        })
    }