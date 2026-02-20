import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Google Fonts ── */
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600&family=Share+Tech+Mono&display=swap';
function injectFonts() {
  if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = FONT_HREF;
    document.head.appendChild(l);
  }
}

/* ── Model Data ── */
const CATEGORIES = [
  {
    id: 'classical', label: 'Classical Statistical', icon: '📐', short: 'STAT',
    models: [
      {
        id: 'arima', name: 'ARIMA / SARIMA', tag: 'CLASSIC',
        fullName: 'AutoRegressive Integrated Moving Average',
        overview: 'ARIMA is the bedrock of time series forecasting. It combines autoregression (AR), differencing for stationarity (I), and moving average (MA) components. SARIMA extends it with seasonal terms, making it extremely powerful for cyclic financial data like indices, commodity prices, and currency pairs. For NIFTY 50 and similar series, SARIMA remains the best baseline you can build against.',
        complexity: { implementation: 3, computation: 2, tuning: 3, interpretability: 5 },
        useFor: ['Trend Forecasting', 'Mean Reversion', 'Seasonality Capture', 'Price Level Prediction', 'Volatility Baseline'],
        pros: ['Highly interpretable coefficients', 'Strong statistical foundation — AIC/BIC/Ljung-Box', 'Works well on stationary financial returns', 'SARIMA handles quarterly/monthly seasonality', 'Well-understood confidence intervals'],
        cons: ['Assumes linear structure — misses non-linearity', 'Requires manual order selection (p,d,q)', 'Struggles with structural breaks', 'Single-step forecast degrades quickly'],
        params: [['p (AR order)', 'Lag terms — typically 1–3 for daily data'], ['d (Difference)', '1 for prices, 0 for returns'], ['q (MA order)', 'Error lag terms'], ['P,D,Q,s', 'Seasonal counterparts; s=5 for weekly, 252 for annual'], ['AIC/BIC', 'Use for automatic order selection']],
        metrics: { accuracy: '★★★☆☆', speed: '★★★★★', interpretability: '★★★★★', complexity: 'LOW' },
        color: 'var(--eq-cyan)', bg: 'rgba(0,229,255,.1)', tags: ['UNIVARIATE', 'STATIONARY', 'LINEAR'],
      },
      {
        id: 'garch', name: 'GARCH', tag: 'VOL',
        fullName: 'Generalized AutoRegressive Conditional Heteroskedasticity',
        overview: "GARCH models the time-varying variance (volatility) of financial returns. Markets don't have constant volatility — calm periods are followed by turbulent ones (volatility clustering). GARCH(1,1) is the workhorse: it captures this clustering, making it essential for options pricing, VaR calculation, and risk management in Indian markets. EGARCH and GJR-GARCH add asymmetry for the leverage effect.",
        complexity: { implementation: 3, computation: 3, tuning: 3, interpretability: 4 },
        useFor: ['Volatility Forecasting', 'Options Pricing', 'VaR / Risk Management', 'Portfolio Optimization', 'Regime Detection'],
        pros: ['Captures volatility clustering perfectly', 'EGARCH handles leverage effect', 'Fast estimation via MLE', 'Widely used in regulatory frameworks', 'Excellent for options Greeks'],
        cons: ['Models variance only, not price direction', 'Requires ARCH-LM test for applicability', 'Tail risk can be underestimated', 'Parameter instability in regime shifts'],
        params: [['ω (omega)', 'Long-run variance term'], ['α (alpha)', 'Weight on past squared residuals'], ['β (beta)', 'Weight on past variance'], ['p, q', 'ARCH and GARCH lags'], ['Distribution', 'Normal, t, GED for fat tails']],
        metrics: { accuracy: '★★★★☆', speed: '★★★★★', interpretability: '★★★★☆', complexity: 'LOW-MED' },
        color: 'var(--eq-cyan)', bg: 'rgba(0,229,255,.1)', tags: ['VOLATILITY', 'UNIVARIATE', 'MLE'],
      },
      {
        id: 'var', name: 'VAR', tag: 'MULTI',
        fullName: 'Vector AutoRegression',
        overview: 'VAR extends ARIMA to multiple time series, allowing each variable to be modeled as a linear function of its own past and the past of all other variables. Essential for cross-asset analysis — e.g., modeling NIFTY50, Bank Nifty, and INR/USD jointly to capture spillover effects. Granger causality tests reveal which series "causes" others, giving genuine predictive insight.',
        complexity: { implementation: 3, computation: 3, tuning: 3, interpretability: 4 },
        useFor: ['Cross-Asset Relationships', 'Macro-Financial Linkages', 'Impulse Response Analysis', 'Granger Causality', 'Index Basket Modeling'],
        pros: ['No need to distinguish endogenous/exogenous', 'Granger causality testing built in', 'Impulse response functions for shock analysis', 'Structural VAR (SVAR) adds economic constraints'],
        cons: ['Parameter explosion with many variables', 'Stationarity required for all series', 'Out-of-sample performance can degrade', 'Colinearity between assets causes issues'],
        params: [['p (lag order)', 'Number of lags; use AIC/BIC to select'], ['Variables', 'Choose correlated assets or indices'], ['Deterministic', 'Include trend, constant, or seasonal dummies'], ['Restrictions', 'Impose via SVAR for economic identification']],
        metrics: { accuracy: '★★★☆☆', speed: '★★★★☆', interpretability: '★★★★☆', complexity: 'MEDIUM' },
        color: 'var(--eq-cyan)', bg: 'rgba(0,229,255,.1)', tags: ['MULTIVARIATE', 'LINEAR', 'GRANGER'],
      },
    ]
  },
  {
    id: 'ml', label: 'Machine Learning', icon: '🌲', short: 'ML',
    models: [
      {
        id: 'xgb', name: 'XGBoost / LightGBM', tag: 'BOOST',
        fullName: 'Gradient Boosted Decision Trees for Time Series',
        overview: 'XGBoost and LightGBM are gradient boosted tree ensembles that dominate tabular ML competitions. For time series, you engineer lag features (Yt-1, Yt-5, rolling means/stds, RSI, MACD) and treat it as a supervised regression problem. Surprisingly powerful for Indian equity data — they capture non-linear patterns that ARIMA misses, and LightGBM is blazing fast for large feature sets.',
        complexity: { implementation: 4, computation: 3, tuning: 4, interpretability: 3 },
        useFor: ['Return Prediction', 'Feature-Rich Forecasting', 'Multi-step Recursive Forecast', 'Technical Indicator Modeling', 'Intraday Pattern Recognition'],
        pros: ['Handles non-linearity and interactions naturally', 'SHAP values for feature attribution', 'Built-in regularization (L1/L2)', 'Handles missing values natively', 'Very fast with LightGBM'],
        cons: ['Requires careful feature engineering', 'No inherent temporal ordering — must encode', 'Overfitting risk without proper CV strategy', 'Struggles with extrapolation beyond training range'],
        params: [['n_estimators', '100–1000; use early stopping'], ['max_depth', '3–7; lower = less overfitting'], ['learning_rate', '0.01–0.1'], ['Lag window', 'Feature lags: 1,2,3,5,10,21,63 days'], ['CV Strategy', 'Walk-forward validation, never random split']],
        metrics: { accuracy: '★★★★☆', speed: '★★★★☆', interpretability: '★★★☆☆', complexity: 'MEDIUM' },
        color: 'var(--eq-green)', bg: 'rgba(0,255,140,.1)', tags: ['ENSEMBLE', 'NON-LINEAR', 'TABULAR'],
      },
      {
        id: 'svr', name: 'SVR', tag: 'KERNEL',
        fullName: 'Support Vector Regression',
        overview: 'SVR finds a hyperplane in a high-dimensional feature space that best fits the data within an epsilon-insensitive tube. The kernel trick (RBF, polynomial) allows capturing non-linear patterns without explicit feature transformation. Best suited for smaller datasets (< 10K samples) with clear, repeating patterns. SVR is relatively robust to outliers compared to neural networks.',
        complexity: { implementation: 3, computation: 3, tuning: 3, interpretability: 2 },
        useFor: ['Small Dataset Forecasting', 'Options Premium Estimation', 'Pattern Matching', 'Regime-Specific Models'],
        pros: ['Robust to outliers via epsilon-insensitive loss', 'Kernel trick captures non-linearity', 'Good generalization on small data', 'Only support vectors matter — sparse solution'],
        cons: ['Slow training on large datasets (O(n³))', 'Kernel and hyperparameter selection is tricky', 'Lacks probabilistic output', 'Feature scaling is mandatory'],
        params: [['C (regularization)', 'Trade-off between margin and error'], ['ε (epsilon)', 'Width of insensitive tube'], ['kernel', 'rbf for most cases; poly for cyclical'], ['γ (gamma)', 'Kernel width; auto or scale recommended']],
        metrics: { accuracy: '★★★☆☆', speed: '★★★☆☆', interpretability: '★★☆☆☆', complexity: 'MEDIUM' },
        color: 'var(--eq-green)', bg: 'rgba(0,255,140,.1)', tags: ['KERNEL', 'SMALL-DATA', 'REGRESSION'],
      },
      {
        id: 'elastic', name: 'ElasticNet / Ridge / Lasso', tag: 'LINEAR',
        fullName: 'Regularized Linear Regression for Time Series',
        overview: 'Linear models with L1 (Lasso), L2 (Ridge), or combined (ElasticNet) regularization. Often overlooked but remarkably effective as baselines and for interpretable factor models. Lasso performs automatic feature selection — essential when you have hundreds of technical indicators. ElasticNet is preferred for correlated features (as financial indicators tend to be).',
        complexity: { implementation: 2, computation: 1, tuning: 2, interpretability: 5 },
        useFor: ['Factor Model Construction', 'Feature Selection (Lasso)', 'Interpretable Baselines', 'Alpha Research', 'Multi-factor Models'],
        pros: ['Extremely fast — fits in milliseconds', 'Coefficients are directly interpretable', 'Lasso gives automatic sparsity', 'Excellent for high-dimensional feature sets', 'Works as meta-learner in ensembles'],
        cons: ['Inherently linear — misses complex patterns', 'Requires stationarity of features', 'Sensitive to multicollinearity (use ElasticNet)', 'Limited forecasting horizon'],
        params: [['α (alpha)', 'Regularization strength'], ['l1_ratio', '0=Ridge, 1=Lasso, 0.5=ElasticNet'], ['Features', 'Lag returns, RSI, MAs, volume ratios'], ['Normalization', 'StandardScaler mandatory']],
        metrics: { accuracy: '★★☆☆☆', speed: '★★★★★', interpretability: '★★★★★', complexity: 'LOW' },
        color: 'var(--eq-green)', bg: 'rgba(0,255,140,.1)', tags: ['LINEAR', 'REGULARIZED', 'INTERPRETABLE'],
      },
    ]
  },
  {
    id: 'dl', label: 'Deep Learning', icon: '🧠', short: 'DL',
    models: [
      {
        id: 'lstm', name: 'LSTM / GRU', tag: 'RNN',
        fullName: 'Long Short-Term Memory / Gated Recurrent Unit',
        overview: 'LSTMs were purpose-built for sequential data. The gating mechanism (input, forget, output gates) allows them to selectively remember or forget information across hundreds of time steps — exactly what markets need for long-term dependency modeling. GRUs are a lighter, faster variant with similar performance. Stacked LSTMs with dropout are a strong baseline for multi-horizon NIFTY forecasting.',
        complexity: { implementation: 4, computation: 4, tuning: 5, interpretability: 1 },
        useFor: ['Multi-step Price Forecasting', 'Sequence Pattern Recognition', 'Long-term Dependency Capture', 'Multivariate Time Series', 'Return Distribution Modeling'],
        pros: ['Learns complex temporal dependencies', 'Handles variable-length sequences', 'Multi-step forecasting natively', 'GRU trains 30% faster than LSTM', 'Strong with multivariate input (OHLCV)'],
        cons: ['Prone to overfitting on small financial datasets', 'Training is slow on CPU', 'Hyperparameter sensitivity is high', 'Hard to interpret (black box)', 'Vanishing gradient still possible at very long sequences'],
        params: [['units', '64–256 per layer'], ['layers', '2–3 stacked layers'], ['dropout', '0.2–0.4 for recurrent dropout'], ['sequence_length', '20–60 trading days'], ['batch_size', '16–64; smaller = more regularization']],
        metrics: { accuracy: '★★★★☆', speed: '★★☆☆☆', interpretability: '★☆☆☆☆', complexity: 'HIGH' },
        color: 'var(--eq-gold)', bg: 'rgba(255,209,102,.1)', tags: ['RECURRENT', 'SEQUENTIAL', 'DEEP'],
      },
      {
        id: 'tcn', name: 'Temporal CNN (TCN)', tag: 'CONV',
        fullName: 'Temporal Convolutional Network with Dilated Causal Convolutions',
        overview: 'TCNs use dilated causal convolutions to capture long-range dependencies without the sequential bottleneck of RNNs. Dilation allows exponentially large receptive fields — a TCN with 8 layers and dilation 1,2,4,8,16,32,64,128 covers 255 time steps. Crucially, TCNs can be fully parallelized during training, making them 5–10× faster than LSTMs. Excellent for high-frequency and intraday data.',
        complexity: { implementation: 4, computation: 3, tuning: 4, interpretability: 1 },
        useFor: ['High-Frequency Data', 'Intraday Pattern Capture', 'Long Lookback Forecasting', 'Parallel Training Pipelines', 'Feature Extraction Backbone'],
        pros: ['Parallelizable — much faster training than LSTMs', 'Stable gradients — no vanishing gradient issue', 'Flexible receptive field via dilation', 'Causal padding ensures no data leakage', 'Can replace LSTM in most architectures'],
        cons: ['Less intuitive than LSTMs for practitioners', 'Receptive field is fixed at design time', 'Requires careful dilation factor choice', 'Not as widely implemented as LSTM in libraries'],
        params: [['filters', '32–128 per layer'], ['kernel_size', '3–7; smaller for fine-grained patterns'], ['dilation_factor', 'Powers of 2: 1,2,4,8,16...'], ['n_blocks', '4–8 blocks'], ['dropout', '0.1–0.3 within residual blocks']],
        metrics: { accuracy: '★★★★☆', speed: '★★★★☆', interpretability: '★☆☆☆☆', complexity: 'HIGH' },
        color: 'var(--eq-gold)', bg: 'rgba(255,209,102,.1)', tags: ['CONVOLUTIONAL', 'CAUSAL', 'PARALLEL'],
      },
      {
        id: 'transformer', name: 'Transformer / TFT', tag: 'ATTN',
        fullName: 'Temporal Fusion Transformer (Attention-based Forecasting)',
        overview: 'The Temporal Fusion Transformer (TFT) by Google DeepMind is the current state of the art for multi-horizon probabilistic forecasting. It combines multi-head attention, gated residual networks, and variable selection networks to handle static metadata, known future inputs (like holidays, expiry dates), and historical covariates simultaneously.',
        complexity: { implementation: 5, computation: 5, tuning: 5, interpretability: 3 },
        useFor: ['Multi-Horizon Probabilistic Forecasting', 'Options Expiry Patterns', 'Multi-asset Joint Forecasting', 'Attention-based Feature Attribution', 'Production Forecasting Systems'],
        pros: ['State-of-the-art benchmark performance', 'Interpretable attention weights', 'Handles mixed-type inputs (static + temporal)', 'Quantile forecasting out of the box', 'Variable importance via gating networks'],
        cons: ['Computationally very demanding', 'Requires large datasets (5K+ samples)', 'Complex architecture — many hyperparameters', 'Slow to converge', 'Needs PyTorch Lightning or specialized libraries'],
        params: [['d_model', '32–256 embedding dimension'], ['n_heads', '4–8 attention heads'], ['hidden_size', '16–128'], ['attention_head_size', '4'], ['dropout', '0.1–0.2'], ['learning_rate', '0.001–0.01 with scheduler']],
        metrics: { accuracy: '★★★★★', speed: '★☆☆☆☆', interpretability: '★★★☆☆', complexity: 'VERY HIGH' },
        color: 'var(--eq-gold)', bg: 'rgba(255,209,102,.1)', tags: ['ATTENTION', 'SOTA', 'PROBABILISTIC'],
      },
      {
        id: 'nbeats', name: 'N-BEATS / N-HiTS', tag: 'NEURAL',
        fullName: 'Neural Basis Expansion Analysis for Time Series (Nixtla)',
        overview: 'N-BEATS is a pure deep learning forecasting architecture that requires no feature engineering, no domain knowledge, and no time series preprocessing. It uses backward and forward residual links with basis expansion blocks to decompose the series into trend and seasonality components interpretably.',
        complexity: { implementation: 3, computation: 3, tuning: 3, interpretability: 3 },
        useFor: ['Zero-Feature-Engineering Forecasting', 'Trend + Seasonality Decomposition', 'Multivariate Index Forecasting', 'Ensemble Base Learner', 'Production Deployment'],
        pros: ['No feature engineering required', 'Interpretable decomposition (N-BEATS-I)', 'Outperforms LSTM in many benchmarks', 'Clean API via Nixtla neuralforecast', 'N-HiTS is faster with better long-horizon perf'],
        cons: ['Still requires sufficient training data', 'Less flexible for custom features', 'N-HiTS can miss sharp turning points', 'Interpretability is limited to trend/seasonality split'],
        params: [['stack_types', 'generic or interpretable (trend+seasonality)'], ['n_blocks', 'Number of blocks per stack: 3–5'], ['mlp_units', '256–512'], ['n_harmonics', 'For seasonality stack'], ['input_size', 'Lookback window']],
        metrics: { accuracy: '★★★★☆', speed: '★★★☆☆', interpretability: '★★★☆☆', complexity: 'MEDIUM-HIGH' },
        color: 'var(--eq-gold)', bg: 'rgba(255,209,102,.1)', tags: ['BASIS-EXPANSION', 'NO-FEATURE-ENG', 'NIXTLA'],
      },
    ]
  },
  {
    id: 'hybrid', label: 'Hybrid / Ensemble', icon: '⚡', short: 'HYBRID',
    models: [
      {
        id: 'arima_lstm', name: 'ARIMA + LSTM', tag: 'HYBRID',
        fullName: 'Linear-Nonlinear Hybrid Architecture',
        overview: 'The most practical hybrid in quantitative finance: ARIMA captures the linear, stationary structure of the series while LSTM models the residuals (non-linear remainder). The insight is that ARIMA residuals, while white noise statistically, still contain exploitable non-linear patterns — and LSTMs excel at finding these.',
        complexity: { implementation: 4, computation: 4, tuning: 4, interpretability: 2 },
        useFor: ['NIFTY Price Level Forecasting', 'Residual Pattern Exploitation', 'Production Alpha Signals', 'Benchmark-Beating Models', 'Linear + Non-linear Decomposition'],
        pros: ['Best of both worlds — linear + non-linear', 'ARIMA residuals provide clean LSTM input', 'Statistically grounded pipeline', 'Commonly used in academic research', 'Can be extended to SARIMA + LSTM'],
        cons: ['Two-stage training complexity', 'ARIMA errors can propagate to LSTM', 'More hyperparameters to tune', 'Requires careful stationarity analysis'],
        params: [['Stage 1', 'Fit ARIMA(p,d,q) → extract residuals'], ['Stage 2', 'Train LSTM on residuals'], ['Combination', 'ŷ = ARIMA_forecast + LSTM_residual_forecast'], ['Residual window', 'Use 30–60 day LSTM lookback on residuals']],
        metrics: { accuracy: '★★★★★', speed: '★★★☆☆', interpretability: '★★☆☆☆', complexity: 'HIGH' },
        color: 'var(--eq-orange)', bg: 'rgba(255,127,81,.1)', tags: ['LINEAR+DL', 'TWO-STAGE', 'RESEARCH'],
      },
      {
        id: 'stacking', name: 'Statistical + ML Stacking', tag: 'STACK',
        fullName: 'Multi-Model Stacking with Meta-Learner',
        overview: 'Stacking combines multiple diverse base models (ARIMA, XGBoost, LSTM, SVR) whose predictions are fed as features to a meta-learner (typically Ridge or LightGBM). The meta-learner learns which base model to trust in which market regime.',
        complexity: { implementation: 5, computation: 4, tuning: 4, interpretability: 2 },
        useFor: ['Competition-Grade Forecasting', 'Multi-Regime Markets', 'Robust Production Models', 'Alpha Signal Combination', 'Diverse Model Aggregation'],
        pros: ['Consistently outperforms any single model', 'Model diversity reduces variance', 'Meta-learner learns regime-switching implicitly', 'Robust to individual model failure', 'Winner of M4/M5 forecasting competitions'],
        cons: ['Training time multiplied by number of base models', 'Walk-forward stacking is complex to implement', 'Risk of overfitting meta-learner', 'Requires large enough test set for meta training'],
        params: [['Base models', 'ARIMA, XGBoost, LSTM, SVR at minimum'], ['Meta-learner', 'Ridge or LightGBM'], ['CV strategy', 'Nested walk-forward CV mandatory'], ['Diversity', 'Ensure base models use different feature sets']],
        metrics: { accuracy: '★★★★★', speed: '★★☆☆☆', interpretability: '★☆☆☆☆', complexity: 'VERY HIGH' },
        color: 'var(--eq-orange)', bg: 'rgba(255,127,81,.1)', tags: ['ENSEMBLE', 'META-LEARNER', 'MULTI-MODEL'],
      },
      {
        id: 'prophet_ml', name: 'Prophet + ML', tag: 'DECOMP',
        fullName: 'Facebook Prophet for Seasonality + ML for Residuals',
        overview: 'Facebook Prophet decomposes the time series into trend, yearly/weekly seasonality, and holiday effects. The residuals from this decomposition are then modeled by XGBoost or LSTM. Particularly valuable for Indian markets where there are strong Diwali/budget seasonality effects that Prophet can model.',
        complexity: { implementation: 3, computation: 3, tuning: 3, interpretability: 4 },
        useFor: ['Seasonal Market Decomposition', 'Holiday Effect Modeling (Diwali, Budget)', 'Trend Extraction + ML Residuals', 'Explainable Pipeline', 'Business-Level Forecasting'],
        pros: ['Prophet handles irregular seasonality elegantly', 'Indian market holidays easily configurable', 'Interpretable trend + seasonality components', 'XGBoost residuals add non-linear power', 'Prophet is robust to missing data'],
        cons: ['Prophet is not designed for financial returns', 'Over-smoothing of trend can lose signal', 'Two-stage training pipeline complexity', 'Less competitive on ultra-high-frequency data'],
        params: [['Prophet params', 'changepoint_prior_scale, seasonality_mode'], ['Indian holidays', 'Add NSE holidays to Prophet holiday frame'], ['Residual model', 'XGBoost with lag features on Prophet residuals'], ['Output', 'Prophet_forecast + residual_forecast']],
        metrics: { accuracy: '★★★★☆', speed: '★★★☆☆', interpretability: '★★★★☆', complexity: 'MEDIUM-HIGH' },
        color: 'var(--eq-orange)', bg: 'rgba(255,127,81,.1)', tags: ['DECOMPOSITION', 'HOLIDAY-AWARE', 'EXPLAINABLE'],
      },
    ]
  },
  {
    id: 'bayes', label: 'Probabilistic / Bayesian', icon: '🔮', short: 'BAYES',
    models: [
      {
        id: 'gp', name: 'Gaussian Processes (GP)', tag: 'PROB',
        fullName: 'Gaussian Process Regression for Time Series',
        overview: 'GPs define a prior over functions and update it using data to give a full posterior distribution over predictions. Every prediction comes with a calibrated uncertainty estimate. For options traders and risk managers, this uncertainty is gold — you get not just a point forecast but a distribution.',
        complexity: { implementation: 4, computation: 4, tuning: 3, interpretability: 3 },
        useFor: ['Options Pricing with Uncertainty', 'Small Dataset High-Stakes Forecasting', 'Hyperparameter Optimization (Bayesian Opt)', 'Active Learning for Data Collection', 'Confidence-Interval Trading Signals'],
        pros: ['Full uncertainty quantification — posterior distribution', 'Principled Bayesian framework', 'Works excellently on small data', 'Kernel choice encodes domain knowledge', 'Non-parametric — extremely flexible'],
        cons: ['O(n³) computational complexity — slow for large data', 'Kernel selection can be arbitrary', 'Struggles with non-stationarity', 'Memory intensive (n×n covariance matrix)'],
        params: [['kernel', 'Matérn 5/2 for financial data; RBF for smooth series'], ['noise', 'WhiteKernel for observation noise'], ['optimizer', 'L-BFGS-B for hyperparameter optimization'], ['normalization', 'Normalize target to zero mean, unit variance']],
        metrics: { accuracy: '★★★☆☆', speed: '★★☆☆☆', interpretability: '★★★★☆', complexity: 'MEDIUM-HIGH' },
        color: '#c88cff', bg: 'rgba(200,140,255,.1)', tags: ['PROBABILISTIC', 'UNCERTAINTY', 'BAYESIAN'],
      },
      {
        id: 'bsts', name: 'BSTS', tag: 'STRUCT',
        fullName: 'Bayesian Structural Time Series',
        overview: 'BSTS decomposes a time series into local level, local trend, regression components, and seasonal effects within a state-space framework. Google uses BSTS for causal impact analysis — measuring the effect of policy changes or events (like RBI rate decisions) on market series.',
        complexity: { implementation: 4, computation: 3, tuning: 3, interpretability: 5 },
        useFor: ['Causal Impact Analysis (RBI Events, Budget)', 'Interpretable Decomposition with Uncertainty', 'Structural Break Detection', 'Intervention Analysis', 'Nowcasting with Mixed-Frequency Data'],
        pros: ['Full interpretability with uncertainty bounds', 'Spike-and-slab prior for variable selection', 'Handles irregular time series naturally', 'Causal inference framework built in', 'Excellent for event-study analysis in Indian markets'],
        cons: ['MCMC sampling is slow', 'R is primary language (rstan/CausalImpact)', 'Python options (orbit) less mature', 'Requires careful prior specification'],
        params: [['Local level', 'Random walk on mean'], ['Local trend', 'Random walk on slope'], ['Seasonal', 'Dummy seasonality or trigonometric'], ['Regression', 'Spike-and-slab for predictor selection']],
        metrics: { accuracy: '★★★☆☆', speed: '★★☆☆☆', interpretability: '★★★★★', complexity: 'MEDIUM' },
        color: '#c88cff', bg: 'rgba(200,140,255,.1)', tags: ['STATE-SPACE', 'CAUSAL', 'INTERPRETABLE'],
      },
      {
        id: 'deepar', name: 'DeepAR', tag: 'PROB-DL',
        fullName: "Amazon's Probabilistic Forecasting with Autoregressive RNNs",
        overview: "DeepAR is Amazon's production forecasting model — it trains a single LSTM across thousands of related time series simultaneously, learning global patterns. Crucially, it outputs full probability distributions (e.g., quantiles 10%, 50%, 90%) rather than point estimates.",
        complexity: { implementation: 4, computation: 4, tuning: 4, interpretability: 2 },
        useFor: ['Portfolio-Level Probabilistic Forecasting', 'P10/P50/P90 Quantile Signals', 'Multi-Series Global Models', 'Risk-Adjusted Position Sizing', 'Production Forecasting at Scale'],
        pros: ['Single model for entire portfolio of assets', 'Full predictive distribution output', 'Learns cross-series patterns', 'Available via AWS SageMaker out of the box', 'Handles cold-start for new securities'],
        cons: ['Requires many related series for best performance', 'Complex training setup (GluonTS/MXNet)', 'Black box — minimal interpretability', 'Needs GPU for reasonable training time'],
        params: [['context_length', 'Lookback window: 30–120 periods'], ['prediction_length', 'Forecast horizon'], ['likelihood', 'Gaussian, Student-t, NegBinomial'], ['num_layers', '2–3 LSTM layers'], ['num_cells', '40–200']],
        metrics: { accuracy: '★★★★☆', speed: '★★☆☆☆', interpretability: '★☆☆☆☆', complexity: 'HIGH' },
        color: '#c88cff', bg: 'rgba(200,140,255,.1)', tags: ['GLOBAL-MODEL', 'QUANTILE', 'AWS'],
      },
    ]
  },
  {
    id: 'rl', label: 'Reinforcement Learning', icon: '🤖', short: 'RL',
    models: [
      {
        id: 'ppo_dqn', name: 'RL Agents (PPO / DQN)', tag: 'AGENT',
        fullName: 'Proximal Policy Optimization & Deep Q-Network for Trading',
        overview: 'RL agents learn trading policies by directly optimizing a reward function (Sharpe ratio, P&L) through market environment interaction. PPO is the gold standard for continuous action spaces (position sizing), while DQN suits discrete actions (buy/sell/hold).',
        complexity: { implementation: 5, computation: 5, tuning: 5, interpretability: 1 },
        useFor: ['Direct Trading Policy Optimization', 'Dynamic Position Sizing', 'Multi-Asset Portfolio Management', 'Options Strategy Learning', 'High-Frequency Execution Optimization'],
        pros: ['No forecasting required — directly optimizes P&L', 'Adapts to changing market dynamics', 'Can incorporate transaction costs in reward', 'PPO handles continuous action (position size)', 'End-to-end learning of strategy'],
        cons: ['Extremely difficult to train stably', 'Reward shaping errors can create erratic policies', 'Requires massive simulation data', 'Overfitting to historical regimes is common', 'Interpretability is nearly zero'],
        params: [['Reward', 'Sharpe ratio or risk-adjusted P&L recommended'], ['State', 'OHLCV + technical indicators + position info'], ['Action space', 'Discrete (DQN) or continuous (PPO)'], ['Env', 'OpenAI Gym-compatible market environment'], ['Clipping (PPO)', 'ε=0.2; prevents too-large policy updates']],
        metrics: { accuracy: '★★★☆☆', speed: '★☆☆☆☆', interpretability: '★☆☆☆☆', complexity: 'VERY HIGH' },
        color: 'var(--eq-red)', bg: 'rgba(255,77,109,.1)', tags: ['POLICY-GRADIENT', 'END-TO-END', 'ADVANCED'],
      },
      {
        id: 'marl', name: 'Multi-Agent RL', tag: 'MARL',
        fullName: 'Multi-Agent Reinforcement Learning for Market Simulation',
        overview: 'MARL places multiple RL agents in the same market environment, forcing them to compete and adapt. This creates emergent market dynamics — bid-ask spread formation, momentum, mean-reversion — that single-agent RL misses. Researchers use MARL for market microstructure simulation.',
        complexity: { implementation: 5, computation: 5, tuning: 5, interpretability: 1 },
        useFor: ['Market Microstructure Simulation', 'Adversarial Strategy Testing', 'Limit Order Book Dynamics', 'Market Impact Modeling', 'Academic Research & Strategy Stress-Testing'],
        pros: ['Models emergent market behavior realistically', 'Enables adversarial robustness testing of strategies', 'Captures market impact of large orders', 'Research frontier — competitive advantage if mastered', 'MARL papers win top AI/finance conferences'],
        cons: ['Extreme computational requirements', 'Non-stationarity: each agent adapts to others', 'No convergence guarantees in competitive settings', 'Very limited practical deployment history', 'Requires specialized MARL frameworks (RLlib, MADDPG)'],
        params: [['N agents', '2–100 agents depending on scenario'], ['Agent type', 'Heterogeneous: market makers + momentum + arbitrageurs'], ['Shared env', 'Limit order book simulator'], ['MADDPG', 'Multi-agent DDPG with centralized critic'], ['Observation', 'Each agent sees partial market state']],
        metrics: { accuracy: '★★☆☆☆', speed: '★☆☆☆☆', interpretability: '★☆☆☆☆', complexity: 'EXTREME' },
        color: 'var(--eq-red)', bg: 'rgba(255,77,109,.1)', tags: ['MULTI-AGENT', 'SIMULATION', 'RESEARCH'],
      },
    ]
  },
];

/* flat model lookup */
const modelMap = {};
CATEGORIES.forEach(cat => cat.models.forEach(m => { modelMap[m.id] = { ...m, catId: cat.id }; }));
const TOTAL_MODELS = CATEGORIES.reduce((s, c) => s + c.models.length, 0);

/* mini chart helper */
function drawMiniChart(svgEl, color) {
  const w = 500, h = 90, n = 50;
  const data = [];
  let v = h * 0.5;
  for (let i = 0; i < n; i++) { v = Math.max(8, Math.min(h - 8, v + (Math.random() - 0.48) * 8)); data.push(v); }
  const mn = Math.min(...data), mx = Math.max(...data);
  const pts = data.map((d, i) => `${(i / (n - 1)) * w},${h - (d - mn) / (mx - mn + 1) * (h - 16) + 8}`);
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p}`).join(' ');
  const areaD = pathD + `L${w},${h} L0,${h}Z`;
  const id = 'mg' + Math.random().toString(36).slice(2);
  svgEl.innerHTML = `
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity=".25"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${areaD}" fill="url(#${id})" stroke="none"/>
    <path d="${pathD}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  `;
}

/* CSS Variables resolved */
const COL = {
  'var(--eq-cyan)': '#00e5ff',
  'var(--eq-green)': '#00ff8c',
  'var(--eq-gold)': '#ffd166',
  'var(--eq-orange)': '#ff7f51',
  'var(--eq-red)': '#ff4d6d',
};
function resolveColor(c) { return COL[c] || c; }

export default function ContentPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const [openCats, setOpenCats] = useState(() => Object.fromEntries(CATEGORIES.map(c => [c.id, true])));
  const [activeModel, setActiveModel] = useState(null);
  const [search, setSearch] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  /* derive display name / avatar initial from Supabase user */
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'USER';
  const avatarLetter = displayName[0].toUpperCase();

  /* particle background */
  useEffect(() => {
    injectFonts();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    const PNODES = 55;
    const nodes = Array.from({ length: PNODES }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.2 + 0.3,
    }));
    let raf;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < PNODES; i++) for (let j = i + 1; j < PNODES; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) { ctx.beginPath(); ctx.strokeStyle = `rgba(0,255,140,${0.15 * (1 - d / 130)})`; ctx.lineWidth = 0.5; ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke(); }
      }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,255,140,.35)'; ctx.fill();
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  /* draw mini chart when model changes */
  useEffect(() => {
    if (!activeModel || !chartRef.current) return;
    setTimeout(() => {
      if (chartRef.current) drawMiniChart(chartRef.current, resolveColor(activeModel.color));
    }, 60);
  }, [activeModel]);

  /* filtered model list */
  const q = search.toLowerCase();
  const filtered = CATEGORIES.map(cat => ({
    ...cat,
    models: q ? cat.models.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.fullName.toLowerCase().includes(q) ||
      m.overview.toLowerCase().includes(q)
    ) : cat.models,
  })).filter(cat => cat.models.length > 0);
  const visibleCount = filtered.reduce((s, c) => s + c.models.length, 0);

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  /* ── CSS-in-JS styles ── */
  const css = `
    :root {
      --eq-bg: #030a06; --eq-bg2: #060f09; --eq-bg3: #0a1a0f;
      --eq-border: rgba(0,255,140,.12); --eq-border2: rgba(0,255,140,.22);
      --eq-green: #00ff8c; --eq-cyan: #00e5ff; --eq-gold: #ffd166;
      --eq-orange: #ff7f51; --eq-red: #ff4d6d; --eq-white: #e8f4ed;
      --eq-muted: rgba(232,244,237,.35);
      --eq-mono: 'Share Tech Mono', monospace;
      --eq-display: 'Orbitron', monospace;
      --eq-body: 'Rajdhani', sans-serif;
    }
    .eq-page { background: var(--eq-bg); color: var(--eq-white); font-family: var(--eq-body); }
    .eq-scanlines {
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.04) 2px,rgba(0,0,0,.04) 4px);
    }
    /* scrollbar */
    .eq-scroll::-webkit-scrollbar { width: 4px; }
    .eq-scroll::-webkit-scrollbar-track { background: transparent; }
    .eq-scroll::-webkit-scrollbar-thumb { background: rgba(0,255,140,.2); border-radius: 4px; }
    /* topbar */
    .eq-topbar {
      height: 58px; display: flex; align-items: center; justify-content: space-between;
      padding: 0 28px; background: rgba(3,10,6,.9);
      border-bottom: 1px solid var(--eq-border2); backdrop-filter: blur(12px);
      flex-shrink: 0; position: relative; z-index: 10;
    }
    .eq-brand { font-family: var(--eq-display); font-size: 18px; font-weight: 700; letter-spacing: 2px; background: linear-gradient(90deg, var(--eq-green), var(--eq-cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .eq-brand span { opacity: .5; font-weight: 400; }
    .eq-logo-mark {
      width: 32px; height: 32px; background: linear-gradient(135deg, var(--eq-green), var(--eq-cyan));
      clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
      animation: eq-rotateGlow 6s ease-in-out infinite;
    }
    @keyframes eq-rotateGlow { 0%,100%{filter:drop-shadow(0 0 6px var(--eq-green))} 50%{filter:drop-shadow(0 0 14px var(--eq-cyan))} }
    .eq-center-label { position: absolute; left: 50%; transform: translateX(-50%); font-family: var(--eq-mono); font-size: 11px; letter-spacing: 4px; color: rgba(0,255,140,.45); text-transform: uppercase; }
    .eq-nav-pill { font-family: var(--eq-mono); font-size: 10px; letter-spacing: 2px; color: var(--eq-muted); cursor: pointer; padding: 5px 12px; border-radius: 2px; border: 1px solid transparent; transition: .2s; }
    .eq-nav-pill:hover, .eq-nav-pill.active { color: var(--eq-green); border-color: var(--eq-border2); background: rgba(0,255,140,.06); }
    .eq-user-chip { display: flex; align-items: center; gap: 8px; padding: 5px 14px; background: rgba(0,255,140,.06); border: 1px solid var(--eq-border2); border-radius: 2px; cursor: pointer; position: relative; }
    .eq-avatar { width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg,var(--eq-green),var(--eq-cyan)); display: flex; align-items: center; justify-content: center; font-family: var(--eq-mono); font-size: 10px; color: #000; font-weight: 700; }
    .eq-user-name { font-family: var(--eq-mono); font-size: 10px; color: var(--eq-green); letter-spacing: 1px; }
    .eq-dropdown { position: absolute; top: calc(100% + 6px); right: 0; background: rgba(3,10,6,.95); border: 1px solid var(--eq-border2); border-radius: 2px; min-width: 140px; z-index: 100; backdrop-filter: blur(12px); }
    .eq-dropdown-item { padding: 10px 16px; font-family: var(--eq-mono); font-size: 10px; letter-spacing: 2px; color: var(--eq-muted); cursor: pointer; transition: .15s; display: block; width: 100%; background: none; border: none; text-align: left; text-transform: uppercase; }
    .eq-dropdown-item:hover { color: var(--eq-red); background: rgba(255,77,109,.06); }
    /* hero */
    .eq-hero { padding: 28px 28px 18px; text-align: center; position: relative; flex-shrink: 0; }
    .eq-hero::after { content:''; position:absolute; bottom:0; left:10%; width:80%; height:1px; background:linear-gradient(90deg,transparent,var(--eq-border2),transparent); }
    .eq-hero-eyebrow { font-family: var(--eq-mono); font-size: 10px; letter-spacing: 6px; color: rgba(0,255,140,.5); text-transform: uppercase; margin-bottom: 10px; }
    .eq-hero-title { font-family: var(--eq-display); font-size: 36px; font-weight: 900; letter-spacing: -1px; line-height: 1; background: linear-gradient(135deg, var(--eq-green) 0%, var(--eq-cyan) 40%, var(--eq-white) 70%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: eq-titlePulse 4s ease-in-out infinite; }
    @keyframes eq-titlePulse { 0%,100%{filter:drop-shadow(0 0 8px rgba(0,255,140,.2))} 50%{filter:drop-shadow(0 0 20px rgba(0,255,140,.4))} }
    .eq-hero-sub { margin-top: 6px; font-size: 13px; color: var(--eq-muted); letter-spacing: 3px; font-weight: 300; font-family: var(--eq-mono); }
    /* left panel */
    .eq-left-panel { width: 360px; flex-shrink: 0; display: flex; flex-direction: column; background: rgba(6,15,9,.7); border: 1px solid var(--eq-border); border-radius: 4px; overflow: hidden; margin-right: 16px; }
    .eq-panel-header { padding: 12px 16px; border-bottom: 1px solid var(--eq-border); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
    .eq-panel-title { font-family: var(--eq-mono); font-size: 10px; letter-spacing: 4px; color: rgba(0,255,140,.6); text-transform: uppercase; }
    .eq-model-count { font-family: var(--eq-mono); font-size: 10px; color: var(--eq-muted); letter-spacing: 2px; }
    .eq-search-bar { padding: 10px 14px; border-bottom: 1px solid var(--eq-border); flex-shrink: 0; }
    .eq-search-input { width: 100%; background: rgba(0,255,140,.04); border: 1px solid var(--eq-border); border-radius: 2px; padding: 7px 12px; color: var(--eq-white); font-family: var(--eq-mono); font-size: 11px; letter-spacing: 1px; outline: none; transition: .2s; }
    .eq-search-input::placeholder { color: var(--eq-muted); }
    .eq-search-input:focus { border-color: var(--eq-border2); background: rgba(0,255,140,.07); }
    /* category */
    .eq-cat-header { padding: 8px 16px; display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; transition: .15s; }
    .eq-cat-header:hover { background: rgba(0,255,140,.04); }
    .eq-cat-icon { width: 20px; height: 20px; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0; }
    .eq-cat-name { font-family: var(--eq-mono); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; flex: 1; }
    .eq-cat-badge { font-family: var(--eq-mono); font-size: 9px; letter-spacing: 1px; padding: 2px 7px; border-radius: 10px; }
    .eq-cat-chevron { font-size: 9px; color: var(--eq-muted); transition: transform .2s; }
    .eq-cat-chevron.open { transform: rotate(90deg); }
    /* model item */
    .eq-model-item { padding: 8px 16px 8px 46px; cursor: pointer; transition: .15s; border-left: 2px solid transparent; display: flex; align-items: center; gap: 10px; }
    .eq-model-item:hover { background: rgba(0,255,140,.05); border-left-color: rgba(0,255,140,.3); }
    .eq-model-item.active { background: rgba(0,255,140,.09); border-left-color: var(--eq-green); }
    .eq-model-name { font-family: var(--eq-body); font-size: 13px; font-weight: 500; color: var(--eq-white); flex: 1; transition: .15s; }
    .eq-model-item:hover .eq-model-name, .eq-model-item.active .eq-model-name { color: var(--eq-green); }
    .eq-model-tag { font-family: var(--eq-mono); font-size: 8px; letter-spacing: 1px; padding: 2px 6px; border-radius: 1px; background: rgba(255,255,255,.05); color: var(--eq-muted); flex-shrink: 0; }
    .eq-model-item.active .eq-model-tag { background: rgba(0,255,140,.1); color: rgba(0,255,140,.6); }
    /* right panel */
    .eq-right-panel { flex: 1; display: flex; flex-direction: column; background: rgba(6,15,9,.7); border: 1px solid var(--eq-border); border-radius: 4px; overflow: hidden; min-width: 0; }
    .eq-placeholder { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; opacity: .4; }
    .eq-placeholder-icon { font-size: 48px; opacity: .3; }
    .eq-placeholder p { font-family: var(--eq-mono); font-size: 11px; letter-spacing: 4px; color: var(--eq-muted); text-transform: uppercase; }
    /* detail */
    .eq-detail-topbar { padding: 14px 22px; border-bottom: 1px solid var(--eq-border); display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
    .eq-detail-icon { width: 38px; height: 38px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
    .eq-detail-name { font-family: var(--eq-display); font-size: 18px; font-weight: 700; letter-spacing: 1px; line-height: 1.1; }
    .eq-detail-fullname { font-family: var(--eq-mono); font-size: 10px; color: var(--eq-muted); letter-spacing: 2px; margin-top: 2px; }
    .eq-dchip { font-family: var(--eq-mono); font-size: 9px; letter-spacing: 1.5px; padding: 3px 10px; border-radius: 1px; border: 1px solid; text-transform: uppercase; }
    .eq-stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
    .eq-stat-card { background: rgba(0,255,140,.03); border: 1px solid var(--eq-border); border-radius: 3px; padding: 12px 14px; text-align: center; }
    .eq-stat-val { font-family: var(--eq-display); font-size: 16px; font-weight: 700; line-height: 1; }
    .eq-stat-label { font-family: var(--eq-mono); font-size: 9px; letter-spacing: 2px; color: var(--eq-muted); margin-top: 5px; text-transform: uppercase; }
    .eq-section { background: rgba(0,0,0,.25); border: 1px solid var(--eq-border); border-radius: 3px; padding: 16px 18px; }
    .eq-section-head { font-family: var(--eq-mono); font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: rgba(0,255,140,.5); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .eq-section-head::after { content:''; flex:1; height:1px; background: var(--eq-border); }
    .eq-use-cases { display: flex; flex-wrap: wrap; gap: 8px; }
    .eq-use-chip { padding: 5px 12px; border: 1px solid var(--eq-border); font-family: var(--eq-mono); font-size: 10px; letter-spacing: 1px; color: var(--eq-muted); border-radius: 2px; background: rgba(255,255,255,.02); }
    .eq-pros-cons { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .eq-pros h4 { font-family: var(--eq-mono); font-size: 9px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; color: var(--eq-green); }
    .eq-cons h4 { font-family: var(--eq-mono); font-size: 9px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; color: var(--eq-red); }
    .eq-pros ul, .eq-cons ul { list-style: none; display: flex; flex-direction: column; gap: 5px; }
    .eq-pros li, .eq-cons li { font-size: 12px; color: rgba(232,244,237,.65); padding-left: 16px; position: relative; line-height: 1.5; }
    .eq-pros li::before { content:'✓'; position: absolute; left: 0; color: var(--eq-green); font-size: 10px; }
    .eq-cons li::before { content:'✗'; position: absolute; left: 0; color: var(--eq-red); font-size: 10px; }
    .eq-param-table { width: 100%; border-collapse: collapse; }
    .eq-param-table tr { border-bottom: 1px solid rgba(0,255,140,.06); }
    .eq-param-table tr:last-child { border-bottom: none; }
    .eq-param-table td { padding: 7px 10px; font-family: var(--eq-mono); font-size: 11px; vertical-align: top; }
    .eq-param-table td:first-child { color: var(--eq-green); width: 38%; }
    .eq-param-table td:last-child { color: var(--eq-muted); }
    .eq-complexity-row { display: flex; align-items: center; gap: 12px; margin-top: 6px; }
    .eq-complexity-label { font-family: var(--eq-mono); font-size: 10px; color: var(--eq-muted); width: 110px; letter-spacing: 1px; }
    .eq-complexity-bar { flex: 1; height: 5px; background: rgba(255,255,255,.06); border-radius: 3px; overflow: hidden; }
    .eq-complexity-fill { height: 100%; border-radius: 3px; transition: width .8s cubic-bezier(.4,0,.2,1); }
    .eq-mini-chart { width: 100%; height: 90px; background: rgba(0,0,0,.2); border-radius: 2px; overflow: hidden; }
    .eq-mini-chart svg { width: 100%; height: 100%; }
    .eq-overview { font-size: 14px; line-height: 1.75; color: rgba(232,244,237,.75); font-weight: 400; letter-spacing: .3px; }
  `;

  const catColors = {
    classical: { icon: 'rgba(0,229,255,.1)', name: '#00e5ff', badge: 'rgba(0,229,255,.1)', badgeText: '#00e5ff', badgeBorder: 'rgba(0,229,255,.2)' },
    ml:        { icon: 'rgba(0,255,140,.1)', name: '#00ff8c', badge: 'rgba(0,255,140,.1)', badgeText: '#00ff8c', badgeBorder: 'rgba(0,255,140,.2)' },
    dl:        { icon: 'rgba(255,209,102,.1)', name: '#ffd166', badge: 'rgba(255,209,102,.1)', badgeText: '#ffd166', badgeBorder: 'rgba(255,209,102,.2)' },
    hybrid:    { icon: 'rgba(255,127,81,.1)', name: '#ff7f51', badge: 'rgba(255,127,81,.1)', badgeText: '#ff7f51', badgeBorder: 'rgba(255,127,81,.2)' },
    bayes:     { icon: 'rgba(200,140,255,.1)', name: '#c88cff', badge: 'rgba(200,140,255,.1)', badgeText: '#c88cff', badgeBorder: 'rgba(200,140,255,.2)' },
    rl:        { icon: 'rgba(255,77,109,.1)', name: '#ff4d6d', badge: 'rgba(255,77,109,.1)', badgeText: '#ff4d6d', badgeBorder: 'rgba(255,77,109,.2)' },
  };

  return (
    <>
      <style>{css}</style>
      <div className="eq-page" style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
        <div className="eq-scanlines" />

        {/* ── TOPBAR ── */}
        <header className="eq-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="eq-logo-mark" />
            <div className="eq-brand">ETERNAL<span>QUANTS</span></div>
          </div>
          <div className="eq-center-label">// Quantitative Research Terminal</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div className="eq-nav-pill active">MODELS</div>
            <div className="eq-nav-pill">BACKTESTER</div>
            <div className="eq-nav-pill">REPORTS</div>
            <div className="eq-nav-pill">SIGNALS</div>
            {/* User chip + dropdown */}
            <div className="eq-user-chip" onClick={() => setShowUserMenu(v => !v)}>
              <div className="eq-avatar">{avatarLetter}</div>
              <span className="eq-user-name">{displayName.toUpperCase().slice(0, 10)}</span>
              <span style={{ fontSize: 8, color: 'rgba(0,255,140,.5)', marginLeft: 2 }}>▾</span>
              {showUserMenu && (
                <div className="eq-dropdown">
                  <button className="eq-dropdown-item" onClick={handleSignOut}>⏻ Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <div className="eq-hero">
          <div className="eq-hero-eyebrow">// Welcome Back, {displayName} · Session Active</div>
          <div className="eq-hero-title">EternalQuants</div>
          <div className="eq-hero-sub">Select a quantitative model to explore its architecture, parameters &amp; applications</div>
        </div>

        {/* ── MAIN BODY ── */}
        <div style={{ flex: 1, display: 'flex', gap: 0, padding: '18px 20px', overflow: 'hidden', minHeight: 0, position: 'relative', zIndex: 1 }}>

          {/* LEFT PANEL */}
          <div className="eq-left-panel">
            <div className="eq-panel-header">
              <div className="eq-panel-title">Model Library</div>
              <div className="eq-model-count">{visibleCount} MODELS</div>
            </div>
            <div className="eq-search-bar">
              <input
                className="eq-search-input"
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="eq-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {filtered.map(cat => {
                const cc = catColors[cat.id] || catColors.ml;
                const isOpen = openCats[cat.id] !== false;
                return (
                  <div key={cat.id}>
                    <div className="eq-cat-header" onClick={() => setOpenCats(o => ({ ...o, [cat.id]: !isOpen }))}>
                      <div className="eq-cat-icon" style={{ background: cc.icon }}>{cat.icon}</div>
                      <div className="eq-cat-name" style={{ color: cc.name }}>{cat.label}</div>
                      <div className="eq-cat-badge" style={{ background: cc.badge, color: cc.badgeText, border: `1px solid ${cc.badgeBorder}` }}>{cat.short}</div>
                      <div className={`eq-cat-chevron${isOpen ? ' open' : ''}`}>›</div>
                    </div>
                    {isOpen && cat.models.map(m => (
                      <div
                        key={m.id}
                        className={`eq-model-item${activeModel?.id === m.id ? ' active' : ''}`}
                        onClick={() => setActiveModel(modelMap[m.id])}
                      >
                        <div className="eq-model-name">{m.name}</div>
                        <div className="eq-model-tag">{m.tag}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="eq-right-panel">
            {!activeModel ? (
              <div className="eq-placeholder">
                <div className="eq-placeholder-icon">⟨/⟩</div>
                <p>Select a model to view details</p>
                <p style={{ fontSize: 9, marginTop: -8, opacity: .6, letterSpacing: 3, fontFamily: 'var(--eq-mono)', textTransform: 'uppercase' }}>← Browse the Library</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                {/* Detail top bar */}
                <div className="eq-detail-topbar">
                  <div className="eq-detail-icon" style={{ background: activeModel.bg, fontSize: 22 }}>
                    {CATEGORIES.find(c => c.id === activeModel.catId)?.icon || '📊'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="eq-detail-name" style={{ color: resolveColor(activeModel.color) }}>{activeModel.name}</div>
                    <div className="eq-detail-fullname">{activeModel.fullName}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {activeModel.tags.map(t => (
                      <div key={t} className="eq-dchip" style={{ color: resolveColor(activeModel.color), borderColor: `${resolveColor(activeModel.color)}40` }}>{t}</div>
                    ))}
                    <div className="eq-dchip" style={{ color: 'rgba(232,244,237,.35)', borderColor: 'rgba(255,255,255,.1)' }}>{activeModel.metrics.complexity}</div>
                  </div>
                </div>

                {/* Detail body */}
                <div className="eq-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <p className="eq-overview">{activeModel.overview}</p>

                  {/* Stats */}
                  <div className="eq-stats-row">
                    {[
                      ['ACCURACY', activeModel.metrics.accuracy, resolveColor(activeModel.color)],
                      ['SPEED', activeModel.metrics.speed, '#00e5ff'],
                      ['INTERPRET.', activeModel.metrics.interpretability, '#ffd166'],
                      ['COMPLEXITY', activeModel.metrics.complexity, '#ff7f51'],
                    ].map(([label, val, col]) => (
                      <div key={label} className="eq-stat-card">
                        <div className="eq-stat-val" style={{ color: col }}>{val}</div>
                        <div className="eq-stat-label">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Complexity bars */}
                  <div className="eq-section">
                    <div className="eq-section-head">Complexity Profile</div>
                    {Object.entries(activeModel.complexity).map(([k, v]) => (
                      <div key={k} className="eq-complexity-row">
                        <div className="eq-complexity-label">{k.toUpperCase()}</div>
                        <div className="eq-complexity-bar">
                          <div className="eq-complexity-fill" style={{ width: `${v / 5 * 100}%`, background: `linear-gradient(90deg,${resolveColor(activeModel.color)},#00e5ff)` }} />
                        </div>
                        <div style={{ fontFamily: 'var(--eq-mono)', fontSize: 10, color: 'var(--eq-muted)', width: 28, textAlign: 'right' }}>{v}/5</div>
                      </div>
                    ))}
                  </div>

                  {/* Use cases */}
                  <div className="eq-section">
                    <div className="eq-section-head">Use Cases for NIFTY / Indian Markets</div>
                    <div className="eq-use-cases">
                      {activeModel.useFor.map(u => <div key={u} className="eq-use-chip">{u}</div>)}
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  <div className="eq-section">
                    <div className="eq-section-head">Strengths &amp; Limitations</div>
                    <div className="eq-pros-cons">
                      <div className="eq-pros"><h4>Strengths</h4><ul>{activeModel.pros.map(p => <li key={p}>{p}</li>)}</ul></div>
                      <div className="eq-cons"><h4>Limitations</h4><ul>{activeModel.cons.map(c => <li key={c}>{c}</li>)}</ul></div>
                    </div>
                  </div>

                  {/* Parameters */}
                  <div className="eq-section">
                    <div className="eq-section-head">Key Parameters</div>
                    <table className="eq-param-table">
                      <tbody>
                        {activeModel.params.map(([k, v]) => (
                          <tr key={k}><td>{k}</td><td>{v}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mini chart */}
                  <div className="eq-section">
                    <div className="eq-section-head">Illustrative Forecast Pattern</div>
                    <div className="eq-mini-chart">
                      <svg ref={chartRef} viewBox="0 0 500 90" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
