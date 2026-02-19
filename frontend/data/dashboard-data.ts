export interface Complexity {
    implementation: number;
    computation: number;
    tuning: number;
    interpretability: number;
}

export interface Metrics {
    accuracy: string;
    speed: string;
    interpretability: string;
    complexity: string;
}

export interface Model {
    id: string;
    name: string;
    tag: string;
    fullName: string;
    overview: string;
    complexity: Complexity;
    useFor: string[];
    pros: string[];
    cons: string[];
    params: string[][];
    metrics: Metrics;
    color: string;
    bg: string;
    tags: string[];
}

export interface Category {
    id: string;
    label: string;
    icon: string;
    short: string;
    models: Model[];
}

export const CATEGORIES: Category[] = [
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
                params: [['p (AR order)', 'Lag terms — typically 1–3 for daily data'], ['d (Difference)', '1 for prices, 0 for returns'], ['q (MA order)', 'Error lag terms'], ['P,D,Q,s', 'Seasonal counterparts; s=5 for weekly, 252 for annual'], ['AIC/BIC', 'Use for automatic order selection'],],
                metrics: { accuracy: '★★★☆☆', speed: '★★★★★', interpretability: '★★★★★', complexity: 'LOW' },
                color: 'var(--cyan)', bg: 'rgba(0,229,255,.1)',
                tags: ['UNIVARIATE', 'STATIONARY', 'LINEAR'],
            },
            {
                id: 'garch', name: 'GARCH', tag: 'VOL',
                fullName: 'Generalized AutoRegressive Conditional Heteroskedasticity',
                overview: 'GARCH models the time-varying variance (volatility) of financial returns. Markets don\'t have constant volatility — calm periods are followed by turbulent ones (volatility clustering). GARCH(1,1) is the workhorse: it captures this clustering, making it essential for options pricing, VaR calculation, and risk management in Indian markets. EGARCH and GJR-GARCH add asymmetry for the leverage effect.',
                complexity: { implementation: 3, computation: 3, tuning: 3, interpretability: 4 },
                useFor: ['Volatility Forecasting', 'Options Pricing', 'VaR / Risk Management', 'Portfolio Optimization', 'Regime Detection'],
                pros: ['Captures volatility clustering perfectly', 'EGARCH handles leverage effect', 'Fast estimation via MLE', 'Widely used in regulatory frameworks', 'Excellent for options Greeks'],
                cons: ['Models variance only, not price direction', 'Requires ARCH-LM test for applicability', 'Tail risk can be underestimated', 'Parameter instability in regime shifts'],
                params: [['ω (omega)', 'Long-run variance term'], ['α (alpha)', 'Weight on past squared residuals'], ['β (beta)', 'Weight on past variance'], ['p, q', 'ARCH and GARCH lags'], ['Distribution', 'Normal, t, GED for fat tails']],
                metrics: { accuracy: '★★★★☆', speed: '★★★★★', interpretability: '★★★★☆', complexity: 'LOW-MED' },
                color: 'var(--cyan)', bg: 'rgba(0,229,255,.1)',
                tags: ['VOLATILITY', 'UNIVARIATE', 'MLE'],
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
                color: 'var(--cyan)', bg: 'rgba(0,229,255,.1)',
                tags: ['MULTIVARIATE', 'LINEAR', 'GRANGER'],
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
                color: 'var(--green)', bg: 'rgba(0,255,140,.1)',
                tags: ['ENSEMBLE', 'NON-LINEAR', 'TABULAR'],
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
                color: 'var(--green)', bg: 'rgba(0,255,140,.1)',
                tags: ['KERNEL', 'SMALL-DATA', 'REGRESSION'],
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
                color: 'var(--green)', bg: 'rgba(0,255,140,.1)',
                tags: ['LINEAR', 'REGULARIZED', 'INTERPRETABLE'],
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
                color: 'var(--gold)', bg: 'rgba(255,209,102,.1)',
                tags: ['RECURRENT', 'SEQUENTIAL', 'DEEP'],
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
                color: 'var(--gold)', bg: 'rgba(255,209,102,.1)',
                tags: ['CONVOLUTIONAL', 'CAUSAL', 'PARALLEL'],
            },
            {
                id: 'transformer', name: 'Transformer / TFT', tag: 'ATTN',
                fullName: 'Temporal Fusion Transformer (Attention-based Forecasting)',
                overview: 'The Temporal Fusion Transformer (TFT) by Google DeepMind is the current state of the art for multi-horizon probabilistic forecasting. It combines multi-head attention, gated residual networks, and variable selection networks to handle static metadata, known future inputs (like holidays, expiry dates), and historical covariates simultaneously. For NIFTY options expiry cycles and derivative rollover patterns, TFT is extremely powerful.',
                complexity: { implementation: 5, computation: 5, tuning: 5, interpretability: 3 },
                useFor: ['Multi-Horizon Probabilistic Forecasting', 'Options Expiry Patterns', 'Multi-asset Joint Forecasting', 'Attention-based Feature Attribution', 'Production Forecasting Systems'],
                pros: ['State-of-the-art benchmark performance', 'Interpretable attention weights', 'Handles mixed-type inputs (static + temporal)', 'Quantile forecasting out of the box', 'Variable importance via gating networks'],
                cons: ['Computationally very demanding', 'Requires large datasets (5K+ samples)', 'Complex architecture — many hyperparameters', 'Slow to converge', 'Needs PyTorch Lightning or specialized libraries'],
                params: [['d_model', '32–256 embedding dimension'], ['n_heads', '4–8 attention heads'], ['hidden_size', '16–128'], ['attention_head_size', '4'], ['dropout', '0.1–0.2'], ['learning_rate', '0.001–0.01 with scheduler']],
                metrics: { accuracy: '★★★★★', speed: '★☆☆☆☆', interpretability: '★★★☆☆', complexity: 'VERY HIGH' },
                color: 'var(--gold)', bg: 'rgba(255,209,102,.1)',
                tags: ['ATTENTION', 'SOTA', 'PROBABILISTIC'],
            },
            {
                id: 'nbeats', name: 'N-BEATS / N-HiTS', tag: 'NEURAL',
                fullName: 'Neural Basis Expansion Analysis for Time Series (Nixtla)',
                overview: 'N-BEATS is a pure deep learning forecasting architecture that requires no feature engineering, no domain knowledge, and no time series preprocessing. It uses backward and forward residual links with basis expansion blocks to decompose the series into trend and seasonality components interpretably. N-HiTS extends this with hierarchical interpolation for better multi-horizon forecasting. Both are from Nixtla, available in their neuralforecast library.',
                complexity: { implementation: 3, computation: 3, tuning: 3, interpretability: 3 },
                useFor: ['Zero-Feature-Engineering Forecasting', 'Trend + Seasonality Decomposition', 'Multivariate Index Forecasting', 'Ensemble Base Learner', 'Production Deployment'],
                pros: ['No feature engineering required', 'Interpretable decomposition (N-BEATS-I)', 'Outperforms LSTM in many benchmarks', 'Clean API via Nixtla neuralforecast', 'N-HiTS is faster with better long-horizon perf'],
                cons: ['Still requires sufficient training data', 'Less flexible for custom features', 'N-HiTS can miss sharp turning points', 'Interpretability is limited to trend/seasonality split'],
                params: [['stack_types', 'generic or interpretable (trend+seasonality)'], ['n_blocks', 'Number of blocks per stack: 3–5'], ['mlp_units', '256–512'], ['n_harmonics', 'For seasonality stack'], ['input_size', 'Lookback window']],
                metrics: { accuracy: '★★★★☆', speed: '★★★☆☆', interpretability: '★★★☆☆', complexity: 'MEDIUM-HIGH' },
                color: 'var(--gold)', bg: 'rgba(255,209,102,.1)',
                tags: ['BASIS-EXPANSION', 'NO-FEATURE-ENG', 'NIXTLA'],
            },
        ]
    },
    {
        id: 'hybrid', label: 'Hybrid / Ensemble', icon: '⚡', short: 'HYBRID',
        models: [
            {
                id: 'arima_lstm', name: 'ARIMA + LSTM', tag: 'HYBRID',
                fullName: 'Linear-Nonlinear Hybrid Architecture',
                overview: 'The most practical hybrid in quantitative finance: ARIMA captures the linear, stationary structure of the series while LSTM models the residuals (non-linear remainder). The insight is that ARIMA residuals, while white noise statistically, still contain exploitable non-linear patterns — and LSTMs excel at finding these. This architecture consistently outperforms either model alone on equity price series.',
                complexity: { implementation: 4, computation: 4, tuning: 4, interpretability: 2 },
                useFor: ['NIFTY Price Level Forecasting', 'Residual Pattern Exploitation', 'Production Alpha Signals', 'Benchmark-Beating Models', 'Linear + Non-linear Decomposition'],
                pros: ['Best of both worlds — linear + non-linear', 'ARIMA residuals provide clean LSTM input', 'Statistically grounded pipeline', 'Commonly used in academic research', 'Can be extended to SARIMA + LSTM'],
                cons: ['Two-stage training complexity', 'ARIMA errors can propagate to LSTM', 'More hyperparameters to tune', 'Requires careful stationarity analysis'],
                params: [['Stage 1', 'Fit ARIMA(p,d,q) → extract residuals'], ['Stage 2', 'Train LSTM on residuals'], ['Combination', 'ŷ = ARIMA_forecast + LSTM_residual_forecast'], ['Residual window', 'Use 30–60 day LSTM lookback on residuals']],
                metrics: { accuracy: '★★★★★', speed: '★★★☆☆', interpretability: '★★☆☆☆', complexity: 'HIGH' },
                color: 'var(--orange)', bg: 'rgba(255,127,81,.1)',
                tags: ['LINEAR+DL', 'TWO-STAGE', 'RESEARCH'],
            },
            {
                id: 'stacking', name: 'Statistical + ML Stacking', tag: 'STACK',
                fullName: 'Multi-Model Stacking with Meta-Learner',
                overview: 'Stacking combines multiple diverse base models (ARIMA, XGBoost, LSTM, SVR) whose predictions are fed as features to a meta-learner (typically Ridge or LightGBM). The meta-learner learns which base model to trust in which market regime. Walk-forward stacking is essential — the meta-learner must be trained on out-of-sample base model predictions only to avoid look-ahead bias.',
                complexity: { implementation: 5, computation: 4, tuning: 4, interpretability: 2 },
                useFor: ['Competition-Grade Forecasting', 'Multi-Regime Markets', 'Robust Production Models', 'Alpha Signal Combination', 'Diverse Model Aggregation'],
                pros: ['Consistently outperforms any single model', 'Model diversity reduces variance', 'Meta-learner learns regime-switching implicitly', 'Robust to individual model failure', 'Winner of M4/M5 forecasting competitions'],
                cons: ['Training time multiplied by number of base models', 'Walk-forward stacking is complex to implement', 'Risk of overfitting meta-learner', 'Requires large enough test set for meta training'],
                params: [['Base models', 'ARIMA, XGBoost, LSTM, SVR at minimum'], ['Meta-learner', 'Ridge or LightGBM'], ['CV strategy', 'Nested walk-forward CV mandatory'], ['Diversity', 'Ensure base models use different feature sets']],
                metrics: { accuracy: '★★★★★', speed: '★★☆☆☆', interpretability: '★☆☆☆☆', complexity: 'VERY HIGH' },
                color: 'var(--orange)', bg: 'rgba(255,127,81,.1)',
                tags: ['ENSEMBLE', 'META-LEARNER', 'MULTI-MODEL'],
            },
            {
                id: 'prophet_ml', name: 'Prophet + ML', tag: 'DECOMP',
                fullName: 'Facebook Prophet for Seasonality + ML for Residuals',
                overview: 'Facebook Prophet decomposes the time series into trend, yearly/weekly seasonality, and holiday effects. The residuals from this decomposition — which represent the "unexplained" variance — are then modeled by XGBoost or LSTM. This is particularly valuable for Indian markets where there are strong Diwali/budget seasonality effects that Prophet can model, leaving a cleaner signal for ML models.',
                complexity: { implementation: 3, computation: 3, tuning: 3, interpretability: 4 },
                useFor: ['Seasonal Market Decomposition', 'Holiday Effect Modeling (Diwali, Budget)', 'Trend Extraction + ML Residuals', 'Explainable Pipeline', 'Business-Level Forecasting'],
                pros: ['Prophet handles irregular seasonality elegantly', 'Indian market holidays easily configurable', 'Interpretable trend + seasonality components', 'XGBoost residuals add non-linear power', 'Prophet is robust to missing data'],
                cons: ['Prophet is not designed for financial returns', 'Over-smoothing of trend can lose signal', 'Two-stage training pipeline complexity', 'Less competitive on ultra-high-frequency data'],
                params: [['Prophet params', 'changepoint_prior_scale, seasonality_mode'], ['Indian holidays', 'Add NSE holidays to Prophet holiday frame'], ['Residual model', 'XGBoost with lag features on Prophet residuals'], ['Output', 'Prophet_forecast + residual_forecast']],
                metrics: { accuracy: '★★★★☆', speed: '★★★☆☆', interpretability: '★★★★☆', complexity: 'MEDIUM-HIGH' },
                color: 'var(--orange)', bg: 'rgba(255,127,81,.1)',
                tags: ['DECOMPOSITION', 'HOLIDAY-AWARE', 'EXPLAINABLE'],
            },
        ]
    },
    {
        id: 'bayes', label: 'Probabilistic / Bayesian', icon: '🔮', short: 'BAYES',
        models: [
            {
                id: 'gp', name: 'Gaussian Processes (GP)', tag: 'PROB',
                fullName: 'Gaussian Process Regression for Time Series',
                overview: 'GPs define a prior over functions and update it using data to give a full posterior distribution over predictions. Every prediction comes with a calibrated uncertainty estimate. For options traders and risk managers, this uncertainty is gold — you get not just a point forecast but a distribution. GP with a Matérn kernel works beautifully for financial series with smooth but non-differentiable paths.',
                complexity: { implementation: 4, computation: 4, tuning: 3, interpretability: 3 },
                useFor: ['Options Pricing with Uncertainty', 'Small Dataset High-Stakes Forecasting', 'Hyperparameter Optimization (Bayesian Opt)', 'Active Learning for Data Collection', 'Confidence-Interval Trading Signals'],
                pros: ['Full uncertainty quantification — posterior distribution', 'Principled Bayesian framework', 'Works excellently on small data', 'Kernel choice encodes domain knowledge', 'Non-parametric — extremely flexible'],
                cons: ['O(n³) computational complexity — slow for large data', 'Kernel selection can be arbitrary', 'Struggles with non-stationarity', 'Memory intensive (n×n covariance matrix)'],
                params: [['kernel', 'Matérn 5/2 for financial data; RBF for smooth series'], ['noise', 'WhiteKernel for observation noise'], ['optimizer', 'L-BFGS-B for hyperparameter optimization'], ['normalization', 'Normalize target to zero mean, unit variance']],
                metrics: { accuracy: '★★★☆☆', speed: '★★☆☆☆', interpretability: '★★★★☆', complexity: 'MEDIUM-HIGH' },
                color: '#c88cff', bg: 'rgba(200,140,255,.1)',
                tags: ['PROBABILISTIC', 'UNCERTAINTY', 'BAYESIAN'],
            },
            {
                id: 'bsts', name: 'BSTS', tag: 'STRUCT',
                fullName: 'Bayesian Structural Time Series',
                overview: 'BSTS decomposes a time series into local level, local trend, regression components, and seasonal effects within a state-space framework. All parameters have posterior distributions, giving calibrated uncertainty. Google uses BSTS for causal impact analysis — measuring the effect of policy changes or events (like RBI rate decisions) on market series. The R package CausalImpact is built on BSTS.',
                complexity: { implementation: 4, computation: 3, tuning: 3, interpretability: 5 },
                useFor: ['Causal Impact Analysis (RBI Events, Budget)', 'Interpretable Decomposition with Uncertainty', 'Structural Break Detection', 'Intervention Analysis', 'Nowcasting with Mixed-Frequency Data'],
                pros: ['Full interpretability with uncertainty bounds', 'Spike-and-slab prior for variable selection', 'Handles irregular time series naturally', 'Causal inference framework built in', 'Excellent for event-study analysis in Indian markets'],
                cons: ['MCMC sampling is slow', 'R is primary language (rstan/CausalImpact)', 'Python options (orbit) less mature', 'Requires careful prior specification'],
                params: [['Local level', 'Random walk on mean'], ['Local trend', 'Random walk on slope'], ['Seasonal', 'Dummy seasonality or trigonometric'], ['Regression', 'Spike-and-slab for predictor selection']],
                metrics: { accuracy: '★★★☆☆', speed: '★★☆☆☆', interpretability: '★★★★★', complexity: 'MEDIUM' },
                color: '#c88cff', bg: 'rgba(200,140,255,.1)',
                tags: ['STATE-SPACE', 'CAUSAL', 'INTERPRETABLE'],
            },
            {
                id: 'deepar', name: 'DeepAR', tag: 'PROB-DL',
                fullName: "Amazon's Probabilistic Forecasting with Autoregressive RNNs",
                overview: "DeepAR is Amazon's production forecasting model — it trains a single LSTM across thousands of related time series simultaneously, learning global patterns. Crucially, it outputs full probability distributions (e.g., quantiles 10%, 50%, 90%) rather than point estimates. This makes it ideal for portfolio-level forecasting where you need distributions over hundreds of stocks simultaneously. Available via AWS Forecast and GluonTS.",
                complexity: { implementation: 4, computation: 4, tuning: 4, interpretability: 2 },
                useFor: ['Portfolio-Level Probabilistic Forecasting', 'P10/P50/P90 Quantile Signals', 'Multi-Series Global Models', 'Risk-Adjusted Position Sizing', 'Production Forecasting at Scale'],
                pros: ['Single model for entire portfolio of assets', 'Full predictive distribution output', 'Learns cross-series patterns', 'Available via AWS SageMaker out of the box', 'Handles cold-start for new securities'],
                cons: ['Requires many related series for best performance', 'Complex training setup (GluonTS/MXNet)', 'Black box — minimal interpretability', 'Needs GPU for reasonable training time'],
                params: [['context_length', 'Lookback window: 30–120 periods'], ['prediction_length', 'Forecast horizon'], ['likelihood', 'Gaussian, Student-t, NegBinomial'], ['num_layers', '2–3 LSTM layers'], ['num_cells', '40–200']],
                metrics: { accuracy: '★★★★☆', speed: '★★☆☆☆', interpretability: '★☆☆☆☆', complexity: 'HIGH' },
                color: '#c88cff', bg: 'rgba(200,140,255,.1)',
                tags: ['GLOBAL-MODEL', 'QUANTILE', 'AWS'],
            },
        ]
    },
    {
        id: 'rl', label: 'Reinforcement Learning', icon: '🤖', short: 'RL',
        models: [
            {
                id: 'ppo_dqn', name: 'RL Agents (PPO / DQN)', tag: 'AGENT',
                fullName: 'Proximal Policy Optimization & Deep Q-Network for Trading',
                overview: 'RL agents learn trading policies by directly optimizing a reward function (Sharpe ratio, P&L) through market environment interaction. PPO is the gold standard for continuous action spaces (position sizing), while DQN suits discrete actions (buy/sell/hold). The key advantage: you never explicitly define the forecast — the agent learns when to act by itself. For NIFTY F&O trading, RL agents can optimize entry/exit timing directly.',
                complexity: { implementation: 5, computation: 5, tuning: 5, interpretability: 1 },
                useFor: ['Direct Trading Policy Optimization', 'Dynamic Position Sizing', 'Multi-Asset Portfolio Management', 'Options Strategy Learning', 'High-Frequency Execution Optimization'],
                pros: ['No forecasting required — directly optimizes P&L', 'Adapts to changing market dynamics', 'Can incorporate transaction costs in reward', 'PPO handles continuous action (position size)', 'End-to-end learning of strategy'],
                cons: ['Extremely difficult to train (unstable)', 'Requires realistic market simulator', 'Overfitting to noise is very easy', 'Slow inference if network is large'],
                params: [['Gamma (discount)', '0.99 for long horizon'], ['Entropy coeff', 'Encourage exploration'], ['Reward function', 'Sharpe Ratio or Log Returns'], ['Network arch', 'LSTM/CNN actor-critic']],
                metrics: { accuracy: 'N/A', speed: '★★☆☆☆', interpretability: '★☆☆☆☆', complexity: 'EXTREME' },
                color: 'var(--red)', bg: 'rgba(255,77,109,.1)',
                tags: ['AGENT-BASED', 'POLICY-GRADIENT', 'F&O'],
            },
        ]
    }
];
