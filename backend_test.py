#!/usr/bin/env python3
"""
Backend API Test for ApexSoftworks
Tests POST /api/inquiries endpoint to verify no _id leak after fix
"""

import requests
import json
import sys

# Base URL from .env
BASE_URL = "https://nexus-craft-5.preview.emergentagent.com/api"

def test_post_inquiries_no_id_leak():
    """
    Test POST /api/inquiries endpoint
    Verify:
    1. Returns HTTP 201
    2. Returns JSON with ok:true
    3. Returns inquiry object with UUID id, name, email, brief, created_at
    4. CRITICAL: inquiry object does NOT contain MongoDB _id field
    """
    print("\n" + "="*80)
    print("TEST: POST /api/inquiries - Verify no _id leak")
    print("="*80)
    
    url = f"{BASE_URL}/inquiries"
    payload = {
        "name": "Grace Hopper",
        "email": "grace@apex.dev",
        "brief": "Verify no _id leak"
    }
    
    print(f"\n📤 Request URL: {url}")
    print(f"📤 Request Method: POST")
    print(f"📤 Request Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        
        print(f"\n📥 Response Status: {response.status_code}")
        print(f"📥 Response Headers: {dict(response.headers)}")
        
        # Try to parse JSON
        try:
            response_json = response.json()
            print(f"📥 Response Body (formatted):")
            print(json.dumps(response_json, indent=2))
        except Exception as e:
            print(f"❌ Failed to parse JSON response: {e}")
            print(f"📥 Raw Response Body: {response.text}")
            return False
        
        # Check 1: HTTP 201
        if response.status_code != 201:
            print(f"\n❌ FAILED: Expected status 201, got {response.status_code}")
            return False
        print(f"✅ PASSED: Status code is 201")
        
        # Check 2: ok:true
        if not response_json.get('ok'):
            print(f"\n❌ FAILED: Expected 'ok: true', got {response_json.get('ok')}")
            return False
        print(f"✅ PASSED: Response contains 'ok: true'")
        
        # Check 3: inquiry object exists
        inquiry = response_json.get('inquiry')
        if not inquiry:
            print(f"\n❌ FAILED: No 'inquiry' object in response")
            return False
        print(f"✅ PASSED: Response contains 'inquiry' object")
        
        # Check 4: CRITICAL - No _id field
        if '_id' in inquiry:
            print(f"\n❌ CRITICAL FAILURE: MongoDB '_id' field found in inquiry object!")
            print(f"   Leaked _id value: {inquiry['_id']}")
            print(f"   This indicates the fix did not work correctly.")
            return False
        print(f"✅ PASSED: No MongoDB '_id' field in inquiry object")
        
        # Check 5: Has UUID id field
        if 'id' not in inquiry:
            print(f"\n❌ FAILED: No 'id' field in inquiry object")
            return False
        
        # Verify it looks like a UUID (basic check)
        inquiry_id = inquiry['id']
        if not isinstance(inquiry_id, str) or len(inquiry_id) < 32:
            print(f"\n❌ FAILED: 'id' field doesn't look like a UUID: {inquiry_id}")
            return False
        print(f"✅ PASSED: inquiry contains UUID 'id': {inquiry_id}")
        
        # Check 6: Has required fields
        required_fields = ['name', 'email', 'brief', 'created_at']
        missing_fields = [f for f in required_fields if f not in inquiry]
        if missing_fields:
            print(f"\n❌ FAILED: Missing required fields: {missing_fields}")
            return False
        print(f"✅ PASSED: inquiry contains all required fields: {required_fields}")
        
        # Check 7: Verify field values
        if inquiry['name'] != payload['name']:
            print(f"\n❌ FAILED: name mismatch. Expected '{payload['name']}', got '{inquiry['name']}'")
            return False
        if inquiry['email'] != payload['email']:
            print(f"\n❌ FAILED: email mismatch. Expected '{payload['email']}', got '{inquiry['email']}'")
            return False
        if inquiry['brief'] != payload['brief']:
            print(f"\n❌ FAILED: brief mismatch. Expected '{payload['brief']}', got '{inquiry['brief']}'")
            return False
        print(f"✅ PASSED: All field values match the request payload")
        
        # Check 8: created_at is ISO format
        created_at = inquiry['created_at']
        if not isinstance(created_at, str) or 'T' not in created_at:
            print(f"\n❌ FAILED: created_at is not in ISO format: {created_at}")
            return False
        print(f"✅ PASSED: created_at is in ISO format: {created_at}")
        
        print("\n" + "="*80)
        print("🎉 ALL CHECKS PASSED!")
        print("="*80)
        print("\n📋 EXACT RESPONSE BODY:")
        print(json.dumps(response_json, indent=2))
        print("\n📋 INQUIRY OBJECT FIELDS:")
        for key, value in inquiry.items():
            print(f"   • {key}: {value}")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("\n🚀 Starting ApexSoftworks Backend API Test")
    print(f"🌐 Base URL: {BASE_URL}")
    
    success = test_post_inquiries_no_id_leak()
    
    if success:
        print("\n✅ TEST SUITE PASSED")
        sys.exit(0)
    else:
        print("\n❌ TEST SUITE FAILED")
        sys.exit(1)
