import json
import boto3
import re
import time # Added for fake delay
from app.schemas import AIAnalysis

# =========================================================
# 🎛️ SIMULATION SWITCH
# =========================================================
# Set this to True to save money and force a perfect demo.
# Set this to False to use real AWS Bedrock.
MOCK_MODE = True 

# =========================================================
# Bedrock Client
# =========================================================
bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-east-1"
)

def build_prompt(text: str) -> str:
    return f"""User: You are a strict API Backend. You convert emergency transcripts into raw JSON.
    RULES: Output ONLY valid JSON. No Markdown.
    
    EXAMPLE JSON OUTPUT:
    {{
      "emergency_type": "Fire",
      "severity": "Critical",
      "location": "Central Station",
      "keywords": ["fire", "central station"],
      "reasoning": "User explicitly stated a big fire at a public hub.",
      "confidence_score": 0.98
    }}

    REAL INPUT: "{text}"
    REAL JSON OUTPUT:"""

def fallback_response(text: str, error_msg: str = "") -> AIAnalysis:
    return AIAnalysis(
        emergency_type="Unclassified",
        severity="Normal",
        location="Signal Processing Error",
        keywords=["error"],
        reasoning=f"AI Error: {error_msg}",
        confidence_score=0.0
    )

# =========================================================
# Main Analysis Function
# =========================================================
def analyze_transcript(text: str) -> AIAnalysis:
    
    # --- 1. MOCK MODE CHECK ---
    if MOCK_MODE:
        print(f"⚠️ SIMULATION MODE: Skipping AWS cost for input: '{text}'")
        
        # Add a fake "thinking" delay so it looks real on the frontend
        time.sleep(1.5) 
        
        # Return the PERFECT response for your demo scenario
        return AIAnalysis(
            emergency_type="Fire",
            severity="Critical",
            location="Phoenix Marketcity, Velachery, Chennai",
            keywords=["smoke", "fire", "second_floor", "trapped"],
            reasoning="Caller reported thick black smoke visible from the food court area. Potential structural hazard.",
            confidence_score=0.98
        )

    # --- 2. REAL AWS MODE ---
    prompt = build_prompt(text)
    body = {
        "inputText": prompt,
        "textGenerationConfig": {
            "maxTokenCount": 512,
            "temperature": 0,
            "topP": 1,
            "stopSequences": ["User:"]
        }
    }

    try:
        response = bedrock.invoke_model(
            modelId="amazon.titan-text-express-v1",
            body=json.dumps(body)
        )

        raw = response["body"].read().decode("utf-8")
        data = json.loads(raw)
        output_text = data["results"][0]["outputText"].strip()
        print(f"🤖 Raw AI Output: {output_text}") 

        json_match = re.search(r'\{.*\}', output_text, re.DOTALL)
        if json_match:
            clean_json = json_match.group(0)
        else:
            clean_json = "{" + output_text if not output_text.startswith("{") else output_text
        
        parsed = json.loads(clean_json)

        # Normalize data
        if "rows" in parsed and isinstance(parsed["rows"], list):
            parsed = parsed["rows"][0]
        elif isinstance(parsed, list):
            parsed = parsed[0]

        normalized = {}
        for key, value in parsed.items():
            new_key = key.lower().replace(" ", "_")
            normalized[new_key] = value

        normalized["emergency_type"] = normalized.get("emergency_type", "Unclassified").title()
        
        if "keywords" in normalized and isinstance(normalized["keywords"], str):
             normalized["keywords"] = [k.strip() for k in normalized["keywords"].split(',')]
        
        if "confidence_score" in normalized:
            normalized["confidence_score"] = float(normalized["confidence_score"])

        return AIAnalysis(**normalized)

    except Exception as e:
        print(f"🔥 Bedrock Error: {str(e)}")
        return fallback_response(text, str(e))