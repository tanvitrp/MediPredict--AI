#!/usr/bin/env python3
import sys
import traceback

sys.path.insert(0, 'backend')

try:
    print("Attempting to import Flask app module...")
    from app import app
    print("✓ Flask app imported successfully")
    
    print("✓ Flask app is ready to handle requests")
    print("✓ Model will be loaded lazily on first image prediction request")
    
    print("\nAttempting to start Flask app on port 5000...")
    print("Send image predictions to: http://127.0.0.1:5000/api/predict/image")
    app.run(debug=False, port=5000, use_reloader=False)
    
except Exception as e:
    print(f"✗ Error: {type(e).__name__}: {e}")
    traceback.print_exc()
    sys.exit(1)
