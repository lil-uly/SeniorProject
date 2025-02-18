import psycopg2
from psycopg2 import sql

def create_connection():
    try:
        # Connect to your postgres DB
        conn = psycopg2.connect(
            dbname="Cloud Catalyst",
            user="cloudadmin",
            password="SeniorProject2!",
            host="localhost",
            port="5432"
        )
        print("Connection to the database established successfully.")
        return conn
    except Exception as e:
        print(f"An error occurred while connecting to the database: {e}")
        return None

def execute_sql_file(conn, filepath):
    try:
        # Open a cursor to perform database operations
        cur = conn.cursor()

        # Read the SQL file
        with open(filepath, 'r') as file:
            sql_commands = file.read()

        # Execute the SQL commands
        cur.execute(sql_commands)

        # Commit the changes
        conn.commit()

        # Close communication with the database
        cur.close()
        print("Tables created successfully.")
    except Exception as e:
        print(f"An error occurred while creating the tables: {e}")

if __name__ == "__main__":
    conn = create_connection()
    if conn:
        execute_sql_file(conn,'db.sql')
        conn.close()