#!/usr/bin/env python3
"""
Backend API Tests for ApexSoftworks Inquiry System
Tests the Next.js App Router catch-all API at /app/app/api/[[...path]]/route.js
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from .env NEXT_PUBLIC_BASE_URL
BASE_URL = "https://nexus-craft-5.preview.emergentagent.com/api"

def test_post_inquiry_valid():
    """Test 1: POST /api/inquiries with valid data"""
    print("\n" + "="*80)
    print("TEST 1: POST /api/inquiries with valid data")
    print("="*80)
    
    url = f"{BASE_URL}/inquiries"
    payload = {
        "name": "Ada Lovelace",
        "email": "ada@apex.dev",
        "brief": "A real-time analytics platform"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {json.dumps(response.json(), indent=2)}")
        
        # Assertions
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        
        data = response.json()
        assert "ok" in data, "Response missing 'ok' field"
        assert data["ok"] is True, f"Expected ok=true, got {data['ok']}"
        assert "inquiry" in data, "Response missing 'inquiry' field"
        
        inquiry = data["inquiry"]
        assert "id" in inquiry, "Inquiry missing 'id' field"
        assert isinstance(inquiry["id"], str), "Inquiry 'id' should be a string (UUID)"
        assert len(inquiry["id"]) == 36, f"UUID should be 36 chars, got {len(inquiry['id'])}"
        
        assert inquiry["name"] == "Ada Lovelace", f"Name mismatch: {inquiry['name']}"
        assert inquiry["email"] == "ada@apex.dev", f"Email mismatch: {inquiry['email']}"
        assert inquiry["brief"] == "A real-time analytics platform", f"Brief mismatch: {inquiry['brief']}"
        
        assert "created_at" in inquiry, "Inquiry missing 'created_at' field"
        # Verify ISO format
        datetime.fromisoformat(inquiry["created_at"].replace('Z', '+00:00'))
        
        # Verify no Mongo _id field
        assert "_id" not in inquiry, "Inquiry should NOT contain Mongo '_id' field"
        
        print("✅ TEST 1 PASSED: Valid inquiry created successfully")
        return True, inquiry["id"]
        
    except AssertionError as e:
        print(f"❌ TEST 1 FAILED: {e}")
        return False, None
    except Exception as e:
        print(f"❌ TEST 1 FAILED with exception: {e}")
        return False, None


def test_post_inquiry_missing_email():
    """Test 2: POST /api/inquiries with missing email"""
    print("\n" + "="*80)
    print("TEST 2: POST /api/inquiries with missing email")
    print("="*80)
    
    url = f"{BASE_URL}/inquiries"
    payload = {
        "name": "NoEmail"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {json.dumps(response.json(), indent=2)}")
        
        # Assertions
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        
        data = response.json()
        assert "error" in data, "Response missing 'error' field"
        
        print("✅ TEST 2 PASSED: Missing email correctly rejected with 400")
        return True
        
    except AssertionError as e:
        print(f"❌ TEST 2 FAILED: {e}")
        return False
    except Exception as e:
        print(f"❌ TEST 2 FAILED with exception: {e}")
        return False


def test_post_inquiry_missing_name():
    """Test 3: POST /api/inquiries with missing name"""
    print("\n" + "="*80)
    print("TEST 3: POST /api/inquiries with missing name")
    print("="*80)
    
    url = f"{BASE_URL}/inquiries"
    payload = {
        "email": "test@test.com"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {json.dumps(response.json(), indent=2)}")
        
        # Assertions
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        
        data = response.json()
        assert "error" in data, "Response missing 'error' field"
        
        print("✅ TEST 3 PASSED: Missing name correctly rejected with 400")
        return True
        
    except AssertionError as e:
        print(f"❌ TEST 3 FAILED: {e}")
        return False
    except Exception as e:
        print(f"❌ TEST 3 FAILED with exception: {e}")
        return False


def test_get_inquiries(expected_inquiry_id):
    """Test 4: GET /api/inquiries"""
    print("\n" + "="*80)
    print("TEST 4: GET /api/inquiries")
    print("="*80)
    
    url = f"{BASE_URL}/inquiries"
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        # Assertions
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), f"Expected array, got {type(data)}"
        
        print(f"Response: Array with {len(data)} inquiries")
        
        # Find the inquiry we created
        found = False
        for inquiry in data:
            print(f"  - Inquiry ID: {inquiry.get('id')}, Name: {inquiry.get('name')}, Email: {inquiry.get('email')}")
            
            # Verify no _id field
            assert "_id" not in inquiry, f"Inquiry should NOT contain Mongo '_id' field"
            
            if inquiry.get("id") == expected_inquiry_id:
                found = True
                assert inquiry["name"] == "Ada Lovelace", f"Name mismatch: {inquiry['name']}"
                assert inquiry["email"] == "ada@apex.dev", f"Email mismatch: {inquiry['email']}"
                assert inquiry["brief"] == "A real-time analytics platform", f"Brief mismatch: {inquiry['brief']}"
        
        if expected_inquiry_id:
            assert found, f"Created inquiry with ID {expected_inquiry_id} not found in list"
        
        # Verify sorted by created_at desc (most recent first)
        if len(data) > 1:
            for i in range(len(data) - 1):
                current_time = datetime.fromisoformat(data[i]["created_at"].replace('Z', '+00:00'))
                next_time = datetime.fromisoformat(data[i+1]["created_at"].replace('Z', '+00:00'))
                assert current_time >= next_time, "Inquiries not sorted by created_at desc"
        
        print("✅ TEST 4 PASSED: GET inquiries returned correct data")
        return True
        
    except AssertionError as e:
        print(f"❌ TEST 4 FAILED: {e}")
        return False
    except Exception as e:
        print(f"❌ TEST 4 FAILED with exception: {e}")
        return False


def test_get_root():
    """Test 5: GET /api/root"""
    print("\n" + "="*80)
    print("TEST 5: GET /api/root")
    print("="*80)
    
    url = f"{BASE_URL}/root"
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {json.dumps(response.json(), indent=2)}")
        
        # Assertions
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "message" in data, "Response missing 'message' field"
        
        print("✅ TEST 5 PASSED: GET /api/root returned message")
        return True
        
    except AssertionError as e:
        print(f"❌ TEST 5 FAILED: {e}")
        return False
    except Exception as e:
        print(f"❌ TEST 5 FAILED with exception: {e}")
        return False


def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("APEXSOFTWORKS INQUIRY API BACKEND TESTS")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    
    results = []
    
    # Test 1: POST with valid data
    test1_passed, inquiry_id = test_post_inquiry_valid()
    results.append(("POST /api/inquiries (valid)", test1_passed))
    
    # Test 2: POST with missing email
    test2_passed = test_post_inquiry_missing_email()
    results.append(("POST /api/inquiries (missing email)", test2_passed))
    
    # Test 3: POST with missing name
    test3_passed = test_post_inquiry_missing_name()
    results.append(("POST /api/inquiries (missing name)", test3_passed))
    
    # Test 4: GET inquiries
    test4_passed = test_get_inquiries(inquiry_id)
    results.append(("GET /api/inquiries", test4_passed))
    
    # Test 5: GET root
    test5_passed = test_get_root()
    results.append(("GET /api/root", test5_passed))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
