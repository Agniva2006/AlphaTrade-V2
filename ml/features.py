import pandas as pd
import numpy as np


# ===================================
# TREND SLOPE HELPER
# ===================================

def compute_slope(series):

    y = series.values
    x = np.arange(len(y))

    if len(y) < 2:
        return 0

    slope = np.polyfit(x, y, 1)[0]
    return slope


# ===================================
# LOAD MARKET CONTEXT
# ===================================

def load_market_context():

    market = pd.read_csv("../data/market/market_context.csv")

    market["Datetime"] = pd.to_datetime(market["Datetime"]).dt.tz_localize(None).astype("datetime64[ns]")

    market = market.sort_values("Datetime")

    return market


# ===================================
# FEATURE GENERATION
# ===================================

def create_features(df):

    df = df.copy()

    # ===================================
    # CLEAN DATA
    # ===================================

    df["Datetime"] = pd.to_datetime(df["Datetime"]).dt.tz_localize(None).astype("datetime64[ns]")

    numeric_cols = ["Open","High","Low","Close","Volume"]

    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.sort_values("Datetime")

    # ===================================
    # MERGE MARKET CONTEXT (FIXED)
    # ===================================

    market = load_market_context()

    df = pd.merge_asof(
        df.sort_values("Datetime"),
        market.sort_values("Datetime"),
        on="Datetime",
        direction="backward"
    )

    # Fill market signals
    if "cross_stock_momentum" in df.columns:
        df["cross_stock_momentum"] = df["cross_stock_momentum"].ffill()

    if "market_volatility" in df.columns:
        df["market_volatility"] = df["market_volatility"].ffill()

    # ===================================
    # RETURNS
    # ===================================

    df["return"] = df["Close"].pct_change()

    df["lag1"] = df["return"].shift(1)
    df["lag2"] = df["return"].shift(2)
    df["lag3"] = df["return"].shift(3)

    # ===================================
    # MOMENTUM
    # ===================================

    df["momentum_5"] = df["Close"] - df["Close"].shift(5)
    df["momentum_10"] = df["Close"] - df["Close"].shift(10)

    # ===================================
    # MOVING AVERAGES
    # ===================================

    df["sma10"] = df["Close"].rolling(10).mean()
    df["sma20"] = df["Close"].rolling(20).mean()

    df["ema10"] = df["Close"].ewm(span=10).mean()
    df["ema20"] = df["Close"].ewm(span=20).mean()

    # ===================================
    # VOLATILITY
    # ===================================

    df["volatility_10"] = df["return"].rolling(10).std()
    df["volatility_20"] = df["return"].rolling(20).std()

    # ===================================
    # RSI
    # ===================================

    delta = df["Close"].diff()

    gain = delta.clip(lower=0).rolling(14).mean()
    loss = (-delta.clip(upper=0)).rolling(14).mean()

    rs = gain / loss

    df["rsi"] = 100 - (100 / (1 + rs))

    # ===================================
    # ATR
    # ===================================

    high_low = df["High"] - df["Low"]
    high_close = (df["High"] - df["Close"].shift()).abs()
    low_close = (df["Low"] - df["Close"].shift()).abs()

    tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)

    df["atr"] = tr.rolling(14).mean()

    # ===================================
    # PRICE STRUCTURE
    # ===================================

    df["candle_range"] = df["High"] - df["Low"]
    df["body_size"] = (df["Close"] - df["Open"]).abs()

    # ===================================
    # VWAP
    # ===================================

    typical_price = (df["High"] + df["Low"] + df["Close"]) / 3

    df["vwap"] = (typical_price * df["Volume"]).cumsum() / df["Volume"].cumsum()

    df["vwap_distance"] = (df["Close"] - df["vwap"]) / df["vwap"]

    # ===================================
    # VOLUME SIGNALS
    # ===================================

    df["volume_ma10"] = df["Volume"].rolling(10).mean()

    df["volume_spike"] = df["Volume"] / df["volume_ma10"]

    df["volume_momentum"] = df["Volume"] / df["Volume"].rolling(20).mean()

    # ===================================
    # TIME FEATURES
    # ===================================

    df["hour"] = df["Datetime"].dt.hour
    df["minute"] = df["Datetime"].dt.minute

    df["minute_of_day"] = df["hour"] * 60 + df["minute"]

    df["market_open_flag"] = ((df["hour"] == 9) & (df["minute"] >= 15)).astype(int)

    # ===================================
    # TREND FEATURES
    # ===================================

    df["ema_cross"] = df["ema10"] - df["ema20"]

    df["trend_strength"] = df["Close"] - df["Close"].rolling(20).mean()

    df["trend_slope"] = df["Close"].rolling(20).apply(compute_slope)

    # ===================================
    # Z-SCORE
    # ===================================

    rolling_mean = df["return"].rolling(20).mean()
    rolling_std = df["return"].rolling(20).std()

    df["zscore_return"] = (df["return"] - rolling_mean) / rolling_std

    # ===================================
    # VOLATILITY REGIME
    # ===================================

    df["volatility_regime"] = np.where(
        df["volatility_20"] > df["volatility_20"].rolling(50).mean(),
        1,
        0
    )

    # ===================================
    # MARKET RELATIONSHIP
    # ===================================

    if "cross_stock_momentum" in df.columns:
        df["corr_market_20"] = df["return"].rolling(20).corr(df["cross_stock_momentum"])
    else:
        df["corr_market_20"] = 0

    # ===================================
    # MEAN REVERSION
    # ===================================

    df["mean_reversion"] = (df["Close"] - df["sma20"]) / df["sma20"]

    # ===================================
    # TARGET
    # ===================================

    df["target"] = df["Close"].shift(-1)

    # ===================================
    # CLEAN DATA SAFELY
    # ===================================

    df = df.replace([np.inf, -np.inf], np.nan)

    # Only drop critical rows
    df = df.dropna(subset=["ema10","ema20","return"])

    return df