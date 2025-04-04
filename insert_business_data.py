import psycopg2
import csv

def create_connection():
    try:
        conn = psycopg2.connect(
            dbname="cloud_catalyst",
            user="cloudadmin",
            password="SeniorProject2!",
            host="localhost",
            port="5432"
        )
        return conn
    except Exception as e:
        print(f"An error occurred while connecting to the database: {e}")
        return None

def insert_business_data_from_csv(csv_file_path):
    conn = create_connection()
    if conn:
        try:
            cur = conn.cursor()
            with open(csv_file_path, 'r') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    cur.execute('''
                        INSERT INTO businesses (business_name, business_type, address, business_email, first_name, last_name, number_of_employees, annual_revenue)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ''', (
                        row['Business Name'],
                        row['Business Type'],
                        row['Address'],
                        row['Business Email'],
                        row['First Name'],
                        row['Last Name'],
                        int(row['Number of Employees']),
                        float(row['Annual Revenue'].replace('$', '').replace(',', ''))
                    ))
            conn.commit()
            print("Data inserted successfully from CSV.")
        except Exception as e:
            print(f"An error occurred while inserting data: {e}")
        finally:
            cur.close()
            conn.close()
    else:
        print("Failed to connect to the database.")

if __name__ == "__main__":
    # Provide the path to CSV file
    csv_file_path = "Small_Business_Test_Data.csv"
    insert_business_data_from_csv(csv_file_path)