from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import threading
import time

app = Flask(__name__, static_folder='static')
CORS(app)  # Enable Cross-Origin Resource Sharing

# Global flag to indicate if data has been received
data_received = threading.Event()
ui_elements = []

@app.route('/')
def index():
    return """
    <html>
    <head>
        <title>UI Extractor Server</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .status { padding: 15px; border-radius: 5px; margin-top: 20px; }
            .waiting { background-color: #FFF3CD; color: #856404; }
            .received { background-color: #D4EDDA; color: #155724; }
            pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow: auto; }
        </style>
    </head>
    <body>
        <h1>UI Extractor Server</h1>
        <div id="status" class="status waiting">
            <p>Waiting for UI data from Figma plugin...</p>
        </div>
        <div id="data" style="display: none;">
            <h2>Received UI Elements:</h2>
            <pre id="json-data"></pre>
        </div>
        <script>
            // Check status every 2 seconds
            setInterval(() => {
                fetch('/status')
                    .then(response => response.json())
                    .then(data => {
                        if (data.received) {
                            document.getElementById('status').className = 'status received';
                            document.getElementById('status').innerHTML = '<p>✅ UI data received successfully!</p>';
                            document.getElementById('data').style.display = 'block';
                            document.getElementById('json-data').textContent = JSON.stringify(data.elements, null, 2);
                        }
                    });
            }, 2000);
        </script>
    </body>
    </html>
    """

@app.route('/status')
def status():
    """Check if data has been received"""
    global ui_elements
    return jsonify({
        "received": data_received.is_set(),
        "elements": ui_elements
    })

@app.route('/receive', methods=['POST'])
def receive_ui_data():
    """Receive UI data from Figma plugin and save it to ui.json"""
    global ui_elements, data_received
    
    try:
        data = request.json
        
        # Extract UI elements from the received data
        ui_elements = data.get('ui_elements', [])
        
        # Create more user-friendly format for the test generator
        formatted_elements = []
        for element in ui_elements:
            formatted_elements.append(f"{element['type']} - {element['label']} ({element['selector']})")
        
        # Save to ui.json
        output_path = os.path.join(os.path.dirname(__file__), 'ui.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump({
                "ui_elements": formatted_elements,
                "raw_elements": ui_elements
            }, f, indent=4)
        
        print(f"✅ Saved {len(ui_elements)} UI elements to {output_path}")
        
        # Set the flag to indicate data has been received
        data_received.set()
        
        return jsonify({
            "status": "success", 
            "message": f"Received {len(ui_elements)} UI elements",
            "elements_count": len(ui_elements)
        })
    
    except Exception as e:
        print(f"❌ Error processing UI data: {e}")
        return jsonify({
            "status": "error", 
            "message": str(e)
        }), 500

def open_browser():
    """Open web browser after a short delay"""
    import webbrowser
    time.sleep(1)
    webbrowser.open('http://localhost:5000')

if __name__ == '__main__':
    # Open browser automatically when run directly
    threading.Thread(target=open_browser, daemon=True).start()
    
    print("🚀 Starting UI Extractor server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)