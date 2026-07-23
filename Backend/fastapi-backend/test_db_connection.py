"""Test database connections for all environments"""
import sys
import os
from sqlalchemy import create_engine, text
from app.config import settings

def test_database_connection(db_name: str, connection_string: str, env: str = "development") -> bool:
    """Test a single database connection"""
    print(f"\n{'='*60}")
    print(f"Testing {db_name.upper()} Database")
    print(f"{'='*60}")

    try:
        # Extract host from connection string for display
        if '@' in connection_string:
            host = connection_string.split('@')[1].split(':')[0] if ':' in connection_string.split('@')[1] else connection_string.split('@')[1].split('/')[0]
        else:
            host = 'unknown'

        db_name_extracted = connection_string.split('/')[-1].split('?')[0]
        print(f"Host: {host}")
        print(f"Database: {db_name_extracted}")
        print(f"Driver: psycopg (PostgreSQL native driver)")

        # Create engine with psycopg driver
        if not connection_string.startswith("postgresql+psycopg://"):
            connection_string = connection_string.replace("postgresql://", "postgresql+psycopg://", 1)

        engine = create_engine(connection_string, echo=False)

        # Test connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✅ Connection Successful!")
            print(f"PostgreSQL Version: {version.split(',')[0]}")

            # Get connection info
            result = connection.execute(text("SELECT current_database(), current_user;"))
            db, user = result.fetchone()
            print(f"Connected as: {user}")
            print(f"Active Database: {db}")

        engine.dispose()
        return True

    except Exception as e:
        print(f"❌ Connection Failed!")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Test all database connections"""
    print("\n" + "="*60)
    print("DATABASE CONNECTION TEST SUITE")
    print("="*60)
    print(f"Environment: {settings.app_env}")
    print(f"Python Version: {sys.version.split()[0]}")

    results = {}

    # Test dev database
    results['dev'] = test_database_connection('dev', settings.db_dev, 'development')

    # Test test database
    results['test'] = test_database_connection('test', settings.db_test, 'test')

    # Test prod database
    results['prod'] = test_database_connection('prod', settings.db_prod, 'production')

    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    print(f"Dev Database:  {'✅ PASS' if results['dev'] else '❌ FAIL'}")
    print(f"Test Database: {'✅ PASS' if results['test'] else '❌ FAIL'}")
    print(f"Prod Database: {'✅ PASS' if results['prod'] else '❌ FAIL'}")

    all_passed = all(results.values())
    print(f"\nOverall: {'✅ ALL DATABASES WORKING' if all_passed else '❌ SOME DATABASES FAILED'}")

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
