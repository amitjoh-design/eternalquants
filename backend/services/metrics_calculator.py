try:
    import pandas as pd
    import numpy as np
except ImportError:
    pd = None
    np = None

def calculate_metrics(trades: list, risk_free_rate=0.06):
    """
    Calculate performance metrics from a list of trades.
    """
    if not trades:
        return _empty_metrics()

    if pd is None or np is None:
        print("Warning: Pandas/Numpy not available. Returning empty metrics.")
        return _empty_metrics()

    try:
        # Convert trades to DataFrame
        df_trades = pd.DataFrame(trades)
        
        # Ensure required columns exist
        required_cols = ['exit_price', 'entry_price', 'direction', 'size'] # Adjust based on actual trade structure
        if not all(col in df_trades.columns for col in required_cols):
             # Try simple PnL based if 'pnl' exists
             if 'pnl' in df_trades.columns:
                 df_trades['net_pnl'] = df_trades['pnl']
             else:
                 return _empty_metrics()
        else:
             # Calculate PnL: (Exit - Entry) * Size * Direction (1 for Long, -1 for Short)
             df_trades['net_pnl'] = (df_trades['exit_price'] - df_trades['entry_price']) * df_trades['size'] * df_trades['direction']

        total_trades = len(df_trades)
        winning_trades = df_trades[df_trades['net_pnl'] > 0]
        losing_trades = df_trades[df_trades['net_pnl'] <= 0]
        
        win_rate = (len(winning_trades) / total_trades) * 100 if total_trades > 0 else 0
        
        gross_profit = winning_trades['net_pnl'].sum()
        gross_loss = abs(losing_trades['net_pnl'].sum())
        
        profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else float('inf')
        
        total_pnl = df_trades['net_pnl'].sum()
        
        # Simple equity curve assumption (starting capital not tracked per se, but we can assume percentage returns if we had capital)
        # For now, just absolute PnL stats
        
        # To calculate Sharpe/Sortino properly we need a time series of returns. 
        # Approximating from trade PnL is inaccurate without time duration context.
        # This is a placeholder for the advanced logic.
        
        return {
            "total_return": float(round(total_pnl, 2)), 
            "annualized_return": 0.0, # Requires time period
            "sharpe_ratio": 0.0,      # Requires daily returns
            "sortino_ratio": 0.0,
            "max_drawdown": 0.0,      # Requires equity curve
            "win_rate": float(round(win_rate, 2)),
            "profit_factor": float(round(profit_factor, 2)),
            "total_trades": total_trades,
            "avg_trade_duration": 0.0,
            "calmar_ratio": 0.0
        }
    except Exception as e:
        print(f"Error calculating metrics: {e}")
        return _empty_metrics()

def _empty_metrics():
    return {
        "total_return": 0.0,
        "annualized_return": 0.0,
        "sharpe_ratio": 0.0,
        "sortino_ratio": 0.0,
        "max_drawdown": 0.0,
        "win_rate": 0.0,
        "profit_factor": 0.0,
        "total_trades": 0,
        "avg_trade_duration": 0.0,
        "calmar_ratio": 0.0
    }
