from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from vw import run_test_generation_pipeline
import os
from docx import Document
import sys
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

LATEST_REPORT_PATH = None

def update_latest_report_path(path):
    global LATEST_REPORT_PATH
    LATEST_REPORT_PATH = path
    print(f"Updated latest report path: {LATEST_REPORT_PATH}")

remote_file = None

@app.route('/api/generate-tests', methods=['POST'])
def generate_tests():
    try:
        website_url = request.form.get('websiteUrl')
        document_text = request.form.get('documentText')

        def text_to_docx(text, file_name):
            doc = Document()
            doc.add_paragraph(text)
            doc.save(file_name)
        
        text_to_docx(document_text, os.path.join(app.config['UPLOAD_FOLDER'], 'output.docx'))
        run_test_generation_pipeline(os.path.join(app.config['UPLOAD_FOLDER'], 'output.docx'),output_dir='.',gemini_key="Your API Key here")

        # import argparse
        # parser = argparse.ArgumentParser(description="Run automated Playwright tests")
        # parser.add_argument("--test-file", default="playwright_tests.json", help="Path to test cases JSON file")
        # parser.add_argument("--headless", action="store_true", default=True, help="Run in headless mode")
        # parser.add_argument("--timeout", type=int, default=5000, help="Timeout in milliseconds")
        # parser.add_argument("--retries", type=int, default=2, help="Number of retries for failed tests")
        # parser.add_argument("--base-url", default=website_url, help="Base URL for tests")
        # args = parser.parse_args()
    
        # # Load and execute test cases
        # print(f"🚀 Starting automated test execution")
        # print(f"📋 Loading test cases from: {args.test_file}")
        
        # if __name__ == "__main__":
        #     app.run(debug=True, use_reloader=False, port=5000)
        #     text = document_text
        #     file_name = "output.docx"
        #     text_to_docx(text, file_name)
        #     print(f"Text has been converted to {file_name}")

        # Process attached files

        # Mock test generation logic
        # test_results = {
        #     "websiteUrl": website_url,
        #     "documentText": document_text,
        #     "attachedFiles": attached_files,
        #     "generatedTests": [
        #         {
        #             "testName": "Test Home Page Load",
        #             "description": "Verify that the home page loads successfully.",
        #             "status": "Pending"
        #         },
        #         {
        #             "testName": "Test Login Functionality",
        #             "description": "Verify that the login functionality works as expected.",
        #             "status": "Pending"
        #         }
        #     ]
        # }

        get_analytics()
        return True

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/get-analytics', methods=['GET'])
def get_analytics():
    try:
        global LATEST_REPORT_PATH
        
        if not LATEST_REPORT_PATH:
            import glob
            report_files = glob.glob("test_report_*.json")
            if not report_files:
                return jsonify({"error": "No test reports found"}), 404
                
            LATEST_REPORT_PATH = max(report_files, key=os.path.getmtime)
            print(f"Using most recent report: {LATEST_REPORT_PATH}")
        
        if os.path.exists(LATEST_REPORT_PATH):
            with open(LATEST_REPORT_PATH, 'r') as f:
                report_data = json.load(f)
                
            return jsonify({
                "summary": {
                    "totalTests": report_data["summary"]["total"],
                    "passedTests": report_data["summary"]["passed"],
                    "failedTests": report_data["summary"]["failed"],
                    "lastGenerated": report_data["summary"]["timestamp"],
                    "sourceFile": "playwright_tests.json",
                    "baseUrl": "https://krishi-mitra-front.vercel.app/",
                    "status": "Test execution completed"
                },
                "tests": format_tests(report_data["tests"]),
                "observations": generate_observations(report_data),
                "logContent": get_log_content()
            })
        else:
            return jsonify({
                "error": f"Test report file not found: {LATEST_REPORT_PATH}"
            }), 404
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "error": str(e)
        }), 500

def format_tests(tests_data):
    """Format the test data for frontend display"""
    formatted_tests = []
    
    for test in tests_data:
        formatted_test = {
            "name": test.get("name"),
            "status": "Passed" if test.get("status") == "passed" else "Failed",
            "steps": [f"Step {i+1}: Executed" for i in range(test.get("steps_executed", 0))],
            "issues": []
        }
        
        if test.get("error"):
            formatted_test["issues"] = [f"Error: {test.get('error')}"]
            
        formatted_tests.append(formatted_test)
        
    return formatted_tests

def generate_observations(report_data):
    """Generate observations based on test results"""
    observations = []
    
    if report_data["summary"]["failed"] > 0:
        observations.append(f"{report_data['summary']['failed']} tests failed out of {report_data['summary']['total']}")
    
    if report_data["summary"]["passed"] == report_data["summary"]["total"]:
        observations.append("All tests passed successfully")
        
    return observations

def get_log_content():
    """Get contents of the test execution log"""
    try:
        with open("test_execution.log", "r") as f:
            return f.read()
    except:
        return "No log content available"

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, port=5000)
