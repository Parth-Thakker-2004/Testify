import json
import re
import os
from docx import Document
import google.generativeai as genai
import time
from testing import load_test_cases, execute_test_cases

GEMINI_MODEL = 'gemini-2.0-flash-lite'
MAX_RETRIES = 3
RETRY_DELAY = 2 

def parse_requirements(doc_path, output_dir="."):
    """Parse requirements from a Word document and save them as JSON."""
    try:
        if not os.path.exists(doc_path):
            raise FileNotFoundError(f"Document not found: {doc_path}")
        
        os.makedirs(output_dir, exist_ok=True)
        
        doc = Document(doc_path)
        requirements = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        
        requirements_path = os.path.join(output_dir, "requirements.json")
        with open(requirements_path, "w", encoding="utf-8") as f:
            json.dump({"requirements": requirements}, f, indent=4, ensure_ascii=False)
        
        print(f"✅ Requirements JSON generated: {requirements_path}")
        return requirements_path
    
    except Exception as e:
        print(f"❌ Error parsing requirements: {e}")
        return None

def call_gemini_api(model, prompt, gemini_key):
    """Call Gemini API with simple retry logic."""
    if not gemini_key or gemini_key == "YOUR_GEMINI_API_KEY":
        raise ValueError("❌ Invalid Gemini API key. Please provide a valid key.")
    
    for attempt in range(MAX_RETRIES):
        try:
            genai.configure(api_key=gemini_key)
            gen_model = genai.GenerativeModel(model)
            
            response = gen_model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            print(f"⚠️ API error on attempt {attempt+1}/{MAX_RETRIES}: {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY)
            else:
                raise
    
    raise Exception("Failed all API call attempts")

def extract_json_from_text(text):
    """Extract and validate JSON from text response."""
    try:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError("No JSON content found in the response")
        
        json_str = match.group(0)
        
        return json.loads(json_str)
    
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        print(f"🔍 Raw JSON string: {text}")
        raise ValueError("Invalid JSON in the response")

def generate_functionality_testplan(requirements_path, output_dir=".", gemini_key=None):
    """Generate a test plan based on requirements JSON file."""
    if not gemini_key:
        raise ValueError("Gemini API key is required")
    
    try:
        with open(requirements_path, "r", encoding="utf-8") as f:
            requirements_data = json.load(f)
        
        requirements_text = "\n".join(requirements_data.get("requirements", []))
        prompt = f"""
        Based on these requirements:
        {requirements_text}

        Generate a comprehensive test plan that includes:
        1. Core functionality test cases
        2. Edge case test cases
        3. Security and performance considerations

        Format the output as JSON with the following structure:
        {{
            "core_tests": [
                {{ "description": "test description", "expected_result": "expected result" }}
            ],
            "edge_cases": [
                {{ "description": "test description", "expected_result": "expected result" }}
            ],
            "security_tests": [
                {{ "description": "test description", "expected_result": "expected result" }}
            ],
            "performance_tests": [
                {{ "description": "test description", "expected_result": "expected result" }}
            ]
        }}
        Only return valid JSON with no additional text.
        """
        
        # Call Gemini API
        print("📤 Sending test plan generation request to Gemini API...")
        response_text = call_gemini_api(GEMINI_MODEL, prompt, gemini_key)
        
        # Process response
        print("📥 Processing Gemini API response...")
        test_plan_data = extract_json_from_text(response_text)
        
        # Save test plan as JSON
        test_plan_path = os.path.join(output_dir, "test_plan.json")
        with open(test_plan_path, "w", encoding="utf-8") as f:
            json.dump(test_plan_data, f, indent=4, ensure_ascii=False)
        
        print(f"✅ Test plan JSON generated: {test_plan_path}")
        return test_plan_path
    
    except Exception as e:
        print(f"❌ Error generating test plan: {e}")
        return None
# Add these helper functions before generate_playwright_testcases


# 8849298521


def is_robust_selector_array(selectors):
    """Check if a selector array already has good coverage of CSS and XPath options."""
    if not isinstance(selectors, list) or len(selectors) < 2:
        return False
    
    # Check if we have both CSS and XPath selectors
    has_css = any(not str(s).startswith('//') for s in selectors if s)
    has_xpath = any(str(s).startswith('//') for s in selectors if s)
    
    # Check if we have reasonable variety (at least 3 selectors)
    has_variety = len(selectors) >= 3
    
    return has_css and has_xpath and has_variety

def generate_selector_alternatives(selector):
    """Generate alternative selectors for a given selector."""
    if not selector or selector == "url":
        return [selector] if selector else []
    
    alternatives = [selector]  # Always include the original
    
    # Handle XPath selectors
    if str(selector).startswith('//'):
        # XPath to CSS conversion attempts
        if '@id=' in selector:
            id_match = re.search(r"@id=['\"]([^'\"]+)['\"]", selector)
            if id_match:
                id_value = id_match.group(1)
                alternatives.append(f"#{id_value}")
        
        if '@type=' in selector:
            type_match = re.search(r"@type=['\"]([^'\"]+)['\"]", selector)
            if type_match:
                type_value = type_match.group(1)
                alternatives.append(f"input[type=\"{type_value}\"]")
        
        if 'contains(text()' in selector:
            text_match = re.search(r"contains\(text\(\), ['\"]([^'\"]+)['\"]", selector)
            if text_match:
                text_value = text_match.group(1)
                alternatives.append(f"text={text_value}")
                alternatives.append(f"button:has-text('{text_value}')")
    
    # Handle CSS selectors
    else:
        # CSS to XPath conversion attempts
        if selector.startswith('#'):
            id_value = selector[1:]
            alternatives.append(f"//*[@id='{id_value}']")
            alternatives.append(f"//input[@id='{id_value}']")
        
        elif selector.startswith('.'):
            class_name = selector[1:]
            alternatives.append(f"//*[contains(@class,'{class_name}')]")
        
        elif 'type=' in selector or 'type="' in selector:
            type_match = re.search(r'type=[\"\']([^\"\']+)[\"\']', selector)
            if type_match:
                type_value = type_match.group(1)
                alternatives.append(f"//input[@type='{type_value}']")
    
    if 'email' in str(selector).lower():
        alternatives.extend([
            "#email", 
            "input[type=\"email\"]",
            "input[name=\"email\"]", 
            "//input[@type='email']",
            "//input[@id='email']"
        ])
    elif 'password' in str(selector).lower():
        alternatives.extend([
            "#password", 
            "input[type=\"password\"]", 
            "input[name=\"password\"]",
            "//input[@type='password']",
            "//input[@id='password']"
        ])
    elif any(login_term in str(selector).lower() for login_term in ['login', 'signin', 'sign in', 'log in']):
        alternatives.extend([
            "text=Sign In",
            "button:has-text('Sign In')",
            "button.login-button",
            "//button[contains(text(), 'Sign In')]",
            "input[type=\"submit\"]"
        ])
    
    # Remove duplicates while preserving order
    seen = set()
    unique_alternatives = []
    for x in alternatives:
        if x not in seen:
            seen.add(x)
            unique_alternatives.append(x)
    
    return unique_alternatives

def enhance_selectors_intelligently(test_steps):
    """Enhance selectors in test steps intelligently."""
    enhanced_steps = []
    
    for i, step in enumerate(test_steps):
        # Skip steps without selectors or with special selectors
        if "selector" not in step or step.get("selector") == "url":
            enhanced_steps.append(step)
            continue
            
        # Process selectors to ensure we have robust options
        if isinstance(step["selector"], list):
            # Check if the existing array already has good coverage
            if is_robust_selector_array(step["selector"]):
                # Already robust, keep as is
                pass
            else:
                # Enhance the existing array with more alternatives
                enhanced_selectors = step["selector"].copy() if step["selector"] else []
                for selector in step["selector"]:
                    if selector:  # Skip empty selectors
                        # Generate alternatives for each selector and add them
                        alternatives = generate_selector_alternatives(selector)
                        for alt in alternatives:
                            if alt and alt not in enhanced_selectors:
                                enhanced_selectors.append(alt)
                
                # Limit to 5 most relevant selectors
                step["selector"] = enhanced_selectors[:5] if enhanced_selectors else []
        elif step["selector"]:  # Single non-empty selector
            # Convert single selector to array of alternatives
            step["selector"] = generate_selector_alternatives(step["selector"])[:5]
        
        # Add wait steps before click actions
        if step["action"] == "click" and i > 0:
            prev_step = test_steps[i-1]
            if prev_step["action"] != "wait" or prev_step.get("selector") != step.get("selector"):
                wait_step = {
                    "action": "wait",
                    "selector": step["selector"].copy() if isinstance(step["selector"], list) else step["selector"],
                    "value": "visible"
                }
                enhanced_steps.append(wait_step)
        
        enhanced_steps.append(step)
    
    return enhanced_steps

def generate_playwright_testcases(test_plan_path, output_dir=".", gemini_key=None):
    """Generate Playwright test cases based on the test plan."""
    if not gemini_key:
        raise ValueError("Gemini API key is required")
    
    try:
        # Read the test plan JSON
        with open(test_plan_path, "r", encoding="utf-8") as f:
            test_plan_data = json.load(f)
        
        # Construct prompt for Gemini with strict JSON structure requirements
        prompt = f"""
        You are an AI assistant that extracts functional requirements from an SRS (Software Requirements Specification) document.
        and generates functional test cases for Playwright in JSON format. Each test case should include the URL of the related functionality.

        ### Input:
        - An SRS document containing functional requirements.
        {json.dumps(test_plan_data, indent=2)}

        ### Output:
        - A JSON file containing test cases structured for Playwright.

        ### Instructions:
        1. **Extract** functional requirements from the document, identifying user actions, expected behaviors, and conditions with accurate names.
        2. **Determine the URL** (if mentioned explicitly) for each test case from the document. If not directly mentioned, infer the URL based on the functionality described.
        3. **Selectings the Values** if test case is needed the value such as nevigation url or any input variable like email/password then take the mentioned values from the document.
        4. **Text Format** for the test cases should be in JSON format should be with utf-8 encoding.
        5. **Convert** each functional requirement into structured test cases with the following format:

        ```json
        {{
            "tests": [
                {{
                    "name": "Test case name",
                    "description": "Detailed description of the test case",
                    "url": "url where the test is executed",
                    "steps": [
                        {{
                            "action": "Action to perform (e.g., navigate, click, type, expect, wait)",
                            "selector": ["CSS selector1", "CSS selector2", "XPath selector1"],
                            "value": "Value to use for the action (if applicable)"
                        }},
                        {{
                            "action": "navigate",
                            "selector": [],
                            "value": "/path-to-page"
                        }}
                    ],
                    "expected_result": "Expected outcome of the test case"
                }}
            ]
        }}
        Do not include any explanation, only return valid JSON.
        Always provide multiple selector options in arrays for each element that needs to be interacted with.
        Include both CSS selectors and XPath selectors for better robustness.
        """

        # Call Gemini API
        print("📤 Sending Playwright test generation request to Gemini API...")
        response_text = call_gemini_api(GEMINI_MODEL, prompt, gemini_key)
        
        # Process response
        print("📥 Processing Gemini API response...")
        playwright_data = extract_json_from_text(response_text)
        
        # Replace the validation loop in generate_playwright_testcases with:

        # Enhanced validation to ensure test quality
        print("🔍 Validating and enhancing test cases...")

        validated_tests = []
        for test in playwright_data.get("tests", []):
            # Ensure test has required fields
            if "name" not in test:
                test["name"] = "Unnamed test"
            if "description" not in test:
                test["description"] = "Auto-generated test case"
            if "expected_result" not in test:
                test["expected_result"] = "Test should complete successfully"
            if "steps" not in test or not isinstance(test["steps"], list):
                test["steps"] = []
            
            # Check if this is accessing a protected page
            needs_auth = False
            has_auth = False
            
            # First check if test needs auth by looking at navigation targets
            for step in test["steps"]:
                if step["action"] == "navigate" and step.get("value"):
                    path = step.get("value", "").lower()
                    if path.startswith("/shop") or path.startswith("/product") or path.startswith("/cart") or path.startswith("/checkout"):
                        needs_auth = True
                        break
            
            # Then check if it already has auth steps
            if needs_auth:
                auth_count = 0
                for step in test["steps"]:
                    if step["action"] == "type":
                        selector = step.get("selector", "")
                        if isinstance(selector, list):
                            # Check any selector in the list matches email or password
                            for s in selector:
                                if "email" in str(s).lower():
                                    auth_count += 1
                                    break
                                elif "password" in str(s).lower():
                                    auth_count += 1
                                    break
                        elif "email" in str(selector).lower():
                            auth_count += 1
                        elif "password" in str(selector).lower():
                            auth_count += 1
                
                has_auth = auth_count >= 2  # Both email and password
            
            # Add auth steps if needed and missing
            if needs_auth and not has_auth:
                print(f"⚠️ Adding missing authentication steps to test: {test['name']}")
                
                # Find first navigate step
                first_step_index = 0
                for i, step in enumerate(test["steps"]):
                    if step["action"] == "navigate":
                        first_step_index = i
                        break
                
                # Create auth steps with multiple selectors
                auth_steps = [
                    {
                        "action": "navigate",
                        "selector": [],
                        "value": "/auth"
                    },
                    {
                        "action": "wait",
                        "selector": [
                            "input[type=\"email\"]",
                            "#email",
                            "input[name=\"email\"]",
                            "//input[@type='email']",
                            "//input[@id='email']"
                        ],
                        "value": "visible"
                    },
                    {
                        "action": "type",
                        "selector": [
                            "#email",
                            "input[type=\"email\"]",
                            "input[name=\"email\"]",
                            "//input[@id='email']",
                            "//input[@type='email']"
                        ],
                        "value": "farmer@gmail.com"
                    },
                    {
                        "action": "type",
                        "selector": [
                            "#password",
                            "input[type=\"password\"]",
                            "input[name=\"password\"]",
                            "//input[@id='password']",
                            "//input[@type='password']"
                        ],
                        "value": "123456"
                    },
                    {
                        "action": "wait",
                        "selector": [
                            "text=Sign In",
                            "button:has-text('Sign In')",
                            "button.login-button",
                            "//button[contains(text(), 'Sign In')]",
                            "input[type=\"submit\"]"
                        ],
                        "value": "visible"
                    },
                    {
                        "action": "click",
                        "selector": [
                            "text=Sign In",
                            "button:has-text('Sign In')",
                            "button.login-button",
                            "//button[contains(text(), 'Sign In')]",
                            "input[type=\"submit\"]"
                        ],
                        "value": "null"
                    },
                    {
                        "action": "expect",
                        "selector": "url",
                        "value": "/shop"
                    }
                ]
                
                # Insert auth steps at the beginning
                test["steps"] = auth_steps + test["steps"][first_step_index+1:]
            
            # Use the new helper function to intelligently enhance selectors
            test["steps"] = enhance_selectors_intelligently(test["steps"])
            
            validated_tests.append(test)

        playwright_data["tests"] = validated_tests
        
        # Save Playwright test cases as JSON
        playwright_path = os.path.join(output_dir, "playwright_tests.json")
        with open(playwright_path, "w", encoding="utf-8") as f:
            json.dump(playwright_data, f, indent=4, ensure_ascii=False)
        
        print(f"✅ Playwright test cases JSON generated: {playwright_path}")
        return playwright_path
    
    except Exception as e:
        print(f"❌ Error generating Playwright test cases: {e}")
        return None

def run_test_generation_pipeline(doc_path, output_dir=".", gemini_key=None):
    """Run the test generation pipeline."""
    if not gemini_key:
        print("❌ Error: Gemini API key is required")
        return False
    
    try:
        print("\n🚀 Starting test generation pipeline...")
        print(f"📄 Input document: {doc_path}")
        print(f"📁 Output directory: {output_dir}")
        
        # Step 1: Parse requirements from Word doc to JSON
        print("\n--- STEP 1: Parse Requirements ---")
        requirements_path = parse_requirements(doc_path, output_dir)
        if not requirements_path:
            return False
        
        # Step 2: Generate test plan from requirements JSON
        print("\n--- STEP 2: Generate Test Plan ---")
        test_plan_path = generate_functionality_testplan(requirements_path, output_dir, gemini_key)
        if not test_plan_path:
            return False
        
        # Step 3: Generate Playwright test cases from test plan
        print("\n--- STEP 3: Generate Playwright Tests ---")
        playwright_path = generate_playwright_testcases(test_plan_path, output_dir, gemini_key)
        if not playwright_path:
            return False
        
        # Print summary
        print("\n✅ Test generation pipeline completed!")
        print(f"📁 Requirements JSON: {requirements_path}")
        print(f"📁 Test Plan JSON: {test_plan_path}")
        print(f"📁 Playwright Tests JSON: {playwright_path}")
        
        # Display test count if available
        try:
            with open(playwright_path, "r", encoding="utf-8") as f:
                test_data = json.load(f)
                test_count = len(test_data.get("tests", []))
                print(f"📋 Generated {test_count} Playwright test cases")
        except Exception as e:
            print(f"⚠️ Could not count test cases: {e}")
            
        import argparse
        parser = argparse.ArgumentParser(description="Run automated Playwright tests")
        parser.add_argument("--test-file", default=playwright_path, help="Path to test cases JSON file")
        parser.add_argument("--headless", action="store_true", default=True, help="Run in headless mode")
        parser.add_argument("--timeout", type=int, default=5000, help="Timeout in milliseconds")
        parser.add_argument("--retries", type=int, default=2, help="Number of retries for failed tests")
        parser.add_argument("--base-url", default="https://krishi-mitra-front.vercel.app/", help="Base URL for tests")
        args = parser.parse_args()
        
        # Load and execute test cases
        print(f"🚀 Starting automated test execution")
        print(f"📋 Loading test cases from: {args.test_file}")
        test_cases = load_test_cases(args.test_file)
        
        # Add base URL to test cases if needed
        if test_cases and args.base_url:
            print(f"🌐 Base URL: {args.base_url}")
            for test in test_cases.get("tests", []):
                # If the first step isn't navigate, add it
                if not test["steps"] or test["steps"][0]["action"] != "navigate":
                    test["steps"].insert(0, {
                        "action": "navigate",
                        "value": args.base_url
                    })
                # If the first step is navigate but has no value or needs to be prefixed
                elif test["steps"][0]["action"] == "navigate":
                    # If value is empty or a relative path
                    if not test["steps"][0].get("value") or not test["steps"][0]["value"].startswith(("http://", "https://")):
                        # For empty value, use base URL directly
                        if not test["steps"][0].get("value"):
                            test["steps"][0]["value"] = args.base_url
                        # For relative paths, combine with base URL
                        else:
                            relative_path = test["steps"][0]["value"]
                            base = args.base_url.rstrip('/')
                            test["steps"][0]["value"] = f"{base}/{relative_path.lstrip('/')}"
        
        if test_cases:
            remote_file = execute_test_cases(
                test_cases, 
                headless=args.headless, 
                timeout=args.timeout,
                retries=args.retries
            )
                
            return remote_file
    except Exception as e:
        print(f"❌ Error in test generation pipeline: {e}")
        return False

def main():
    # Configuration parameters
    DOC_PATH = "C:/Users/dange/OneDrive/Desktop/Work/6th sem/test.docx"
    OUTPUT_DIR = "C:/Users/dange/OneDrive/Desktop/Work/6th sem/"
    GEMINI_KEY = "Your API Key Here"
    
    # Parse command line arguments
    import argparse
    
    parser = argparse.ArgumentParser(description='Test Generation Pipeline')
    parser.add_argument('--generate', action='store_true', help='Generate test cases')
    parser.add_argument('--doc_path', type=str, default=DOC_PATH, help='Path to the requirements document')
    parser.add_argument('--output_dir', type=str, default=OUTPUT_DIR, help='Output directory for generated files')
    
    args = parser.parse_args()
    
    # If no action specified, default to generate
    if not args.generate:
        args.generate = True
    
    # Run the test generation pipeline
    success = run_test_generation_pipeline(
        args.doc_path, 
        args.output_dir, 
        GEMINI_KEY
    )
    
    if success:
        print("\n🎉 Test generation completed successfully!")
    else:
        print("\n⚠️ Test generation completed with errors. Check the logs above for details.")
            
if __name__ == "__main__":
    main()
