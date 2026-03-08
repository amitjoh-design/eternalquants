import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { notebookContent, modelId } = await req.json()

    const modelLabels: Record<string, string> = {
      arima: 'ARIMA/SARIMA time series forecasting',
      garch: 'GARCH volatility modeling',
      var: 'Vector AutoRegression (VAR)',
      xgboost: 'XGBoost/LightGBM gradient boosting',
      svr: 'Support Vector Regression',
      elasticnet: 'ElasticNet/Ridge/Lasso regression',
      'lstm-gru': 'LSTM/GRU recurrent neural networks',
      tcn: 'Temporal Convolutional Network',
      'transformer-tft': 'Transformer/TFT attention models',
      'nbeats-nhits': 'N-BEATS/N-HiTS neural forecasting',
      'arima-lstm': 'ARIMA+LSTM hybrid model',
      stacking: 'Model stacking / ensemble methods',
      'prophet-ml': 'Prophet + ML decomposition',
      kalman: 'Kalman Filter',
      hmm: 'Hidden Markov Model',
      bayesian: 'Bayesian Structural Time Series',
      drl: 'Deep Reinforcement Learning',
      portfolio: 'Portfolio Optimization',
      regime: 'Regime Detection',
    }
    const modelDesc = modelLabels[modelId] || modelId

    const prompt = `You are a content validator for EternalQuants, a quantitative finance education platform.

A user wants to upload a Jupyter notebook to the "${modelDesc}" section.

Review the notebook and answer TWO questions:
1. RELEVANCE: Is this notebook related to "${modelDesc}" in a finance, data science, or quantitative analysis context? Be lenient — general Python finance/ML work qualifies.
2. SAFETY: Does this notebook contain harmful code? (os.system file deletion, network attacks, crypto mining, malware, completely non-educational content)

Notebook excerpt (first 25 cells):
${notebookContent}

Respond ONLY with this exact JSON (no extra text):
{
  "relevant": true,
  "safe": true,
  "relevance_reason": "1-2 sentence explanation",
  "safety_reason": "1-2 sentence explanation"
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || ''
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Unexpected validation response from Claude')

    return new Response(JSON.stringify(JSON.parse(match[0])), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
