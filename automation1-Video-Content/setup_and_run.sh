#!/usr/bin/env bash
# ==============================================================================
# Automation 1: Daily Video Content Autopilot Engine (Wiredvibeapp)
# Voxstar Ltd • Gene Da Rocha
# ==============================================================================

set -e

echo "=========================================================="
echo "⚡ Voxstar Automation 1: Daily Video Content Engine"
echo "=========================================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "🔄 Activating virtual environment..."
source venv/bin/activate

echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Ensure config.env exists
if [ ! -f "config.env" ] && [ -f "config.env.example" ]; then
    echo "⚙️ Creating config.env from template..."
    cp config.env.example config.env
fi

echo ""
echo "Choose which AI Engine to run for today's video loop:"
echo "1) Google Gemini (Veo + Gemini 2.5)"
echo "2) Anthropic Claude (Claude 3.7 Sonnet)"
echo "3) OpenAI ChatGPT (GPT-4o + Sora format)"
echo "4) xAI Grok (Grok 2 / 3)"
echo "5) Run Batch Loop for ALL pending CSV ideas"
read -p "Select option [1-5] (default 1): " choice
choice=${choice:-1}

case $choice in
    1)
        echo "🚀 Running Gemini Engine..."
        python automation_gemini.py
        ;;
    2)
        echo "🚀 Running Claude Engine..."
        python automation_claude.py
        ;;
    3)
        echo "🚀 Running ChatGPT Engine..."
        python automation_chatgpt.py
        ;;
    4)
        echo "🚀 Running Grok Engine..."
        python automation_grok.py
        ;;
    5)
        echo "🚀 Running Continuous Batch Loop for CSV queue..."
        python -c "from loop_engine import LoopEngine; from automation_gemini import gemini_synthesizer; engine = LoopEngine('Batch Multi-Model', gemini_synthesizer); engine.run_continuous_daily_loop(max_items=10)"
        ;;
    *)
        echo "Invalid selection. Defaulting to Gemini..."
        python automation_gemini.py
        ;;
esac

echo ""
echo "✅ Execution finished! Check automation_videos.db and social channels."
