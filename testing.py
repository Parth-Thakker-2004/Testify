import json
import os
import sys
import time
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

def load_test_cases(filename="test_cases.json"):
    """Load test cases from a JSON file."""
    try:
        with open(filename, "r") as f:
            data = json.load(f)
            if "tests" not in data:
                print(f"⚠️ Warning: No 'tests' array found in {filename}")
                print(f"⚠️ File structure: {list(data.keys())}")
                return None
            if len(data["tests"]) == 0:
                print(f"⚠️ Warning: Empty 'tests' array in {filename}")
                return None
            print(f"✅ Successfully loaded {len(data['tests'])} tests from {filename}")
            return data
    except FileNotFoundError:
        print(f"❌ Test case file '{filename}' not found.")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in test case file '{filename}': {e}")
        return None

def check_text_content(page, selector, expected_text):
    """Check if text is present in element and raise AssertionError if not."""
    content = page.text_content(selector)
    if expected_text not in content:
        raise AssertionError(f"Text '{expected_text}' not found in '{content}'")
    return True

def check_visibility(page, selector):
    """Check if element is visible and raise AssertionError if not."""
    if not page.is_visible(selector):
        raise AssertionError(f"Element '{selector}' is not visible")
    return True

def try_selectors(page, action_fn, selectors):
    """Try an action with multiple selectors until one works."""
    if not isinstance(selectors, list):
        selectors = [selectors]
    
    selectors = [s for s in selectors if s]
    
    if not selectors:
        raise ValueError("No valid selectors provided")
    
    last_error = None
    for selector in selectors:
        try:
            print(f"    🔍 Trying with selector: '{selector}'")
            action_fn(selector)
            print(f"    ✅ Selector worked: '{selector}'")
            return True
        except Exception as e:
            last_error = e
            print(f"    ⚠️ Failed with selector: '{selector}' - {str(e)}")
    
    if last_error:
        raise last_error
    else:
        raise ValueError("No valid selectors provided")

def execute_test_cases(test_cases, headless=False, timeout=5000, retries=2):
    """Execute Playwright test cases with proper error handling and retries."""
    if not test_cases:
        print("❌ No test cases to execute.")
        return False
    
    results = {
        "total": 0,
        "passed": 0,
        "failed": 0,
        "skipped": 0,
        "details": []
    }
    
    start_time = time.time()
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=headless)
            browser_context = browser.new_context(
                viewport={"width": 1280, "height": 720},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/90.0.4430.212 Safari/537.36"
            )
            
            for test in test_cases["tests"]:
                test_name = test["name"]
                results["total"] += 1
                test_result = {
                    "name": test_name,
                    "status": "pending",
                    "steps_executed": 0,
                    "total_steps": len(test["steps"]),
                    "error": None,
                    "retry_count": 0
                }
                
                for retry in range(retries + 1):
                    if retry > 0:
                        print(f"🔄 Retry {retry}/{retries} for test: {test_name}")
                        test_result["retry_count"] = retry
                    
                    try:
                        page = browser_context.new_page()
                        page.set_default_timeout(timeout)
                        
                        print(f"⏱️ Running: {test_name}")
                        steps_executed = 0
                        
                        for step in test["steps"]:
                            action = step["action"]
                            selector = step.get("selector", "")
                            value = step.get("value", "")
                            
                            step_desc = f"  Step {steps_executed + 1}: {action}"
                            if selector:
                                if isinstance(selector, list):
                                    step_desc += f" with {len(selector)} selectors"
                                else:
                                    step_desc += f" on '{selector}'"
                            if value:
                                step_desc += f" with value '{value}'"
                            print(step_desc)
                            
                            if action == "navigate":
                                page.goto(value)
                            elif action == "click":
                                is_form_submit = False
                                if isinstance(selector, list):
                                    for s in selector:
                                        if any(keyword in str(s).lower() for keyword in ["sign in", "login", "submit", "button"]):
                                            is_form_submit = True
                                            break
                                else:
                                    is_form_submit = any(keyword in str(selector).lower() for keyword in ["sign in", "login", "submit", "button"])
                                
                                try_selectors(page, lambda s: page.click(s), selector)
                                
                                if is_form_submit:
                                    print("    🔄 Waiting for navigation after form submission...")
                                    try:
                                        with page.expect_navigation(timeout=5000, wait_until='networkidle'):
                                            pass
                                        print(f"    ✓ Navigation completed. Current URL: {page.url}")
                                    except PlaywrightTimeoutError:
                                        print(f"    ⚠️ No navigation occurred after form submission. URL: {page.url}")
                                        
                                        if "auth" in page.url:
                                            print("    🔍 Debugging authentication failure:")
                                            try:
                                                debug_path = f"auth_debug_{test_name.replace(' ', '_')}.png" 
                                                page.screenshot(path=debug_path)
                                                print(f"    📸 Auth debug screenshot: {debug_path}")
                                                
                                                error_selectors = [".error", ".alert", "[role='alert']", ".form-error", ".message"]
                                                for selector in error_selectors:
                                                    if page.is_visible(selector):
                                                        print(f"    ❌ Found error element: {selector}: {page.text_content(selector)}")
                                            except Exception as debug_err:
                                                print(f"    ⚠️ Error during debugging: {debug_err}")
                                    
                                    page.wait_for_timeout(2000)
                            elif action == "type":
                                try_selectors(page, lambda s: page.fill(s, value), selector)
                            elif action == "wait":
                                if value == "visible" and selector:
                                    try_selectors(
                                        page, 
                                        lambda s: page.wait_for_selector(s, state="visible"), 
                                        selector
                                    )
                                else:
                                    wait_time = int(value) if value.isdigit() else 1000
                                    page.wait_for_timeout(wait_time)
                            elif action == "assert":
                                try_selectors(
                                    page, 
                                    lambda s: check_text_content(page, s, value), 
                                    selector
                                )
                            elif action == "assert_visible":
                                try_selectors(
                                    page, 
                                    lambda s: check_visibility(page, s), 
                                    selector
                                )
                            elif action == "expect" and selector == "url":
                                assert value in page.url, f"Expected URL to contain '{value}', but got '{page.url}'"
                            
                            steps_executed += 1
                            test_result["steps_executed"] = steps_executed
                        
                        print(f"✅ {test_name} passed!")
                        test_result["status"] = "passed"
                        results["passed"] += 1
                        page.close()
                        break 
                        
                    except PlaywrightTimeoutError as e:
                        error_msg = f"Timeout: {str(e)}"
                        print(f"⚠️ {error_msg}")
                        
                        try:
                            screenshot_path = f"error_{test_name.replace(' ', '_')}_{retry}.png"
                            page.screenshot(path=screenshot_path)
                            print(f"📸 Screenshot saved: {screenshot_path}")
                        except:
                            pass
                            
                        test_result["error"] = error_msg
                        if retry == retries:  
                            test_result["status"] = "failed"
                            results["failed"] += 1
                        page.close()
                    
                    except Exception as e:
                        error_msg = f"Error: {str(e)}"
                        print(f"❌ {error_msg}")
                        
                        try:
                            screenshot_path = f"error_{test_name.replace(' ', '_')}_{retry}.png"
                            page.screenshot(path=screenshot_path)
                            print(f"📸 Screenshot saved: {screenshot_path}")
                        except:
                            pass
                            
                        test_result["error"] = error_msg
                        if retry == retries:  
                            test_result["status"] = "failed"
                            results["failed"] += 1
                        page.close()
                
                results["details"].append(test_result)
            
            browser.close()
    
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        return False
    
    execution_time = time.time() - start_time
    
    print("\n" + "=" * 50)
    print(f"TEST EXECUTION SUMMARY")
    print("=" * 50)
    print(f"Total Tests: {results['total']}")
    print(f"Passed: {results['passed']}")
    print(f"Failed: {results['failed']}")
    print(f"Skipped: {results['skipped']}")
    print(f"Execution Time: {execution_time:.2f} seconds")
    print("=" * 50)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = f"test_report_{timestamp}.json"
    with open(report_file, "w") as f:
        json.dump({
            "summary": {
                "timestamp": timestamp,
                "execution_time": execution_time,
                "total": results["total"],
                "passed": results["passed"],
                "failed": results["failed"],
                "skipped": results["skipped"]
            },
            "tests": results["details"]
        }, f, indent=2)
    
    print(f"📝 Report saved: {report_file}")
    return report_file

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run automated Playwright tests")
    parser.add_argument("--test-file", default=r"C:/Users/dange/OneDrive/Desktop/Work/6th sem/playwright_tests.json", help="Path to test cases JSON file")
    parser.add_argument("--headless", action="store_true", default=False, help="Run in headless mode")
    parser.add_argument("--timeout", type=int, default=5000, help="Timeout in milliseconds")
    parser.add_argument("--retries", type=int, default=2, help="Number of retries for failed tests")
    parser.add_argument("--base-url", default="https://krishi-mitra-front.vercel.app/", help="Base URL for tests")
    args = parser.parse_args()
    
    print(f"🚀 Starting automated test execution")
    print(f"📋 Loading test cases from: {args.test_file}")
    test_cases = load_test_cases(args.test_file)
    
    if test_cases and args.base_url:
        print(f"🌐 Base URL: {args.base_url}")
        for test in test_cases.get("tests", []):
            if not test["steps"] or test["steps"][0]["action"] != "navigate":
                test["steps"].insert(0, {
                    "action": "navigate",
                    "value": args.base_url
                })
            elif test["steps"][0]["action"] == "navigate":
                if not test["steps"][0].get("value") or not test["steps"][0]["value"].startswith(("http://", "https://")):
                    if not test["steps"][0].get("value"):
                        test["steps"][0]["value"] = args.base_url
                    else:
                        relative_path = test["steps"][0]["value"]
                        base = args.base_url.rstrip('/')
                        test["steps"][0]["value"] = f"{base}/{relative_path.lstrip('/')}"
    
    if test_cases:
        success = execute_test_cases(
            test_cases, 
            headless=args.headless, 
            timeout=args.timeout,
            retries=args.retries
        )
        sys.exit(0 if success else 1)
    else:
        sys.exit(1)