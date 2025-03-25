import json
import psycopg2
import os

def lambda_handler(event, context):
    # Get slot values
    slots = event['sessionState']['intent']['slots']
    
    business_goals = get_slot_value(slots, 'BusinessGoals')
    business_challenges = get_slot_value(slots, 'BusinessChallenges')
    employee_count = get_slot_value(slots, 'EmployeeCount')
    business_tools = get_slot_value(slots, 'BusinessTools')
    
    # Store in PostgreSQL database
    try:
        # Connect to PostgreSQL database
        conn = psycopg2.connect(
            dbname="Cloud Catalyst",
            user="cloudadmin",
            password="SeniorProject2!",
            host="localhost",
            port="5432"
        )
        cur = conn.cursor()
        
        # Generate a unique ID or use session ID
        business_id = event['sessionId']
        
        # Store data
        cur.execute('''
            INSERT INTO business_profiles (business_id, business_goals, business_challenges, employee_count, business_tools)
            VALUES (%s, %s, %s, %s, %s)
        ''', (business_id, business_goals, business_challenges, employee_count, business_tools))
        
        # Commit the transaction
        conn.commit()
        
        # Close the cursor and connection
        cur.close()
        conn.close()
        
        # Return successful response
        return close(event, 'Fulfilled')
        
    except Exception as e:
        print(e)
        return close(event, 'Failed')

def get_slot_value(slots, slot_name):
    if slots and slot_name in slots and slots[slot_name]:
        return slots[slot_name]['value']['interpretedValue']
    return None

def close(event, fulfillment_state):
    return {
        'sessionState': {
            'dialogAction': {
                'type': 'Close'
            },
            'intent': {
                'name': event['sessionState']['intent']['name'],
                'state': fulfillment_state
            }
        }
    }