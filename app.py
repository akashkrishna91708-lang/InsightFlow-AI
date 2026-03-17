import os
import json
import random
import re
import pandas as pd
import google.generativeai as genai
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__, template_folder='.') 
CORS(app)

# --- CONFIGURATION ---
# 1. Sabse pehle apni sahi API Key yahan dalo
YOUR_API_KEY = "AIzaSyB-APKI-REAL-KEY-YAHAN" 
genai.configure(api_key=YOUR_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# --- SYSTEM PROMPT ---
SYSTEM_PROMPT = """
You are a Business Intelligence Analyst. 
Return ONLY a pure JSON object. NO markdown, NO text.
Structure: {"type": "bar"|"line"|"pie", "title": "Title", "labels": [], "values": [], "summary": "1-sentence insight"}
"""

@app.route('/')
def auth_page():
    return render_template('auth.html')

@app.route('/home')
def index_page():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard_page():
    return render_template('dashboard.html')

@app.route('/query', methods=['POST'])
def process_query():
    try:
        data = request.json
        if not data or 'query' not in data:
            return jsonify({"error": "Query missing"}), 400
            
        query = data.get('query', '')
        prompt = f"{SYSTEM_PROMPT}\nUser Business Query: {query}"
        
        # Gemini se response lena
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            raise ValueError("AI ne response nahi diya")

        # --- CLEANING LOGIC (Bug Fixer) ---
        raw_text = response.text.strip()
        
        # Regex: Ye sirf { ... } ke beech ka part nikalega
        json_match = re.search(r'(\{.*\})', raw_text, re.DOTALL)
        
        if json_match:
            clean_json = json_match.group(1)
            chart_data = json.loads(clean_json)
            return jsonify(chart_data)
        else:
            # Agar Gemini ne JSON nahi bheja, toh manual parse koshish karo
            raise ValueError("JSON format nahi mila")

    except Exception as e:
        print(f"DEBUG ERROR: {str(e)}")
        # Fallback Data: Taki dashboard khali na dikhe
        return jsonify({
            "type": "bar",
            "title": "Analysis Result (Sample)",
            "labels": ["Metric A", "Metric B", "Metric C"],
            "values": [65, 45, 85],
            "summary": "AI is processing your request. Showing sample business data for now."
        })

if __name__ == '__main__':
    # Flask ko debug mode mein chalayenge taki errors console pe dikhein
    app.run(debug=True, port=5000)