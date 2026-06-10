from services.parser import parse_order
import json

# Test 1 — typical cake order
result = parse_order("hey can I get a 1kg black forest for Sunday with fondant please")
print("Test 1:")
print(json.dumps(result, indent=2))

# Test 2 — multiple items with price query
result2 = parse_order("hi I want 2 dozen chocolate cupcakes and a 500g red velvet, how much will it cost?")
print("\nTest 2:")
print(json.dumps(result2, indent=2))

# Test 3 — not an order
result3 = parse_order("hi are you open tomorrow?")
print("\nTest 3:")
print(json.dumps(result3, indent=2))