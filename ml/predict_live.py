import pandas as pd
import numpy as np
import joblib
import yfinance as yf

from features import create_features


# ======================================
# LOAD MODEL
# ======================================

MODEL_PATH = r"C:\Users\User\Desktop\end-to-end_ml_project\AlphaTrade\AlphaTrade-V2\ml\model.pkl"
model = joblib.load(MODEL_PATH)


# ======================================
# MODEL FEATURES (same as training)
# ======================================

MODEL_FEATURES = [
    "return",
    "momentum_5",
    "momentum_10",
    "ema10",
    "ema20",
    "volatility_20",
    "rsi",
    "atr",
    "volume_spike",
    "volume_momentum",
    "vwap_distance",
    "minute_of_day",
    "trend_slope",
    "zscore_return",
    "mean_reversion",
    "cross_stock_momentum",
    "market_volatility"
]


# ======================================
# FETCH LIVE DATA
# ======================================

def fetch_live_data(symbol: str) -> pd.DataFrame:

    df = yf.download(
        symbol,
        period="60d",
        interval="5m",
        progress=False
    )

    # Fix multi-index columns from yfinance
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df = df.reset_index()

    # Normalize timezone
    df["Datetime"] = pd.to_datetime(df["Datetime"]).dt.tz_localize(None)

    return df


# ======================================
# CLEAN NUMERIC DATA
# ======================================

def clean_numeric(df: pd.DataFrame) -> pd.DataFrame:

    numeric_cols = ["Open", "High", "Low", "Close", "Volume"]

    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


# ======================================
# PREPARE MODEL INPUT
# ======================================

def prepare_features(df):

    df_features = create_features(df)

    if df_features.empty:
        raise ValueError("Feature generation failed")

    latest = df_features.iloc[-1:].copy()

    # Ensure feature consistency
    for feature in MODEL_FEATURES:
        if feature not in latest.columns:
            latest[feature] = 0

    X = latest[MODEL_FEATURES]

    return X, latest


# ======================================
# SINGLE STEP PREDICTION
# ======================================

def predict(symbol: str) -> dict:

    df = fetch_live_data(symbol)

    df = clean_numeric(df)

    # Reduce size to stabilize rolling features
    df = df.tail(300)

    X, latest = prepare_features(df)

    pred = model.predict(X)

    predicted_price = float(pred[0])
    current_price = float(latest["Close"].values[0])

    return {
        "symbol": symbol,
        "current_price": current_price,
        "predicted_price": predicted_price,
        "difference": predicted_price - current_price
    }


# ======================================
# MULTI-STEP FORECAST (future candles)
# ======================================

def predict_future(symbol: str, steps: int = 20):

    df = fetch_live_data(symbol)

    df = clean_numeric(df)

    future_prices = []

    temp_df = df.copy()

    for _ in range(steps):

        temp_df = temp_df.tail(300)

        X, latest = prepare_features(temp_df)

        pred_return = model.predict(X)[0]

        pred_return = np.clip(pred_return, -0.01, 0.01)

        last_price = latest["Close"].values[0]

        pred_price = last_price * (1 + pred_return)

        future_prices.append(float(pred_price))

        new_row = temp_df.iloc[-1:].copy()

        new_row["Close"] = pred_price
        new_row["Datetime"] = new_row["Datetime"] + pd.Timedelta(minutes=5)

        temp_df = pd.concat([temp_df, new_row], ignore_index=True)

    return future_prices


import sys
import json


# ======================================
# API OUTPUT (for Node backend)
# ======================================

if __name__ == "__main__":

    # symbol passed from Node
    symbol = sys.argv[1] if len(sys.argv) > 1 else "RELIANCE.NS"

    result = predict(symbol)
    future = predict_future(symbol, steps=20)

    output = {
        "prediction": result,
        "forecast": future
    }

    print(json.dumps(output))