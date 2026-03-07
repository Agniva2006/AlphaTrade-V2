import yfinance as yf
import pandas as pd
import numpy as np
import os

# ===============================
# CONFIG
# ===============================

STOCKS = [
"RELIANCE.NS","TCS.NS","INFY.NS","HDFCBANK.NS","ICICIBANK.NS",
"SBIN.NS","LT.NS","KOTAKBANK.NS","AXISBANK.NS","ITC.NS",
"BHARTIARTL.NS","ASIANPAINT.NS","MARUTI.NS","BAJFINANCE.NS",
"HCLTECH.NS","WIPRO.NS","TITAN.NS","ULTRACEMCO.NS","ONGC.NS",
"POWERGRID.NS","ADANIENT.NS","ADANIPORTS.NS","DRREDDY.NS",
"CIPLA.NS","GRASIM.NS"
]

INDICES = {
"NIFTY50": "^NSEI",
"BANKNIFTY": "^NSEBANK"
}

PERIOD = "730d"
INTERVAL = "5m"

# ===============================
# CREATE FOLDERS
# ===============================

os.makedirs("../data/stocks", exist_ok=True)
os.makedirs("../data/indices", exist_ok=True)
os.makedirs("../data/market", exist_ok=True)

# ===============================
# HELPER FUNCTION
# ===============================

def clean_market_hours(df):

    df["Datetime"] = pd.to_datetime(df["Datetime"])

    # Convert to IST
    df["Datetime"] = df["Datetime"].dt.tz_localize(None)

    df["hour"] = df["Datetime"].dt.hour
    df["minute"] = df["Datetime"].dt.minute

    df = df[
        ((df["hour"] > 9) | ((df["hour"] == 9) & (df["minute"] >= 15)))
        &
        ((df["hour"] < 15) | ((df["hour"] == 15) & (df["minute"] <= 30)))
    ]

    df.drop(columns=["hour","minute"], inplace=True)

    return df


# ===============================
# DOWNLOAD STOCK DATA
# ===============================

print("\nDownloading stock data...\n")

for stock in STOCKS:

    try:

        print("Downloading:", stock)

        df = yf.download(
            stock,
            period=PERIOD,
            interval=INTERVAL,
            progress=False
        )

        df.dropna(inplace=True)
        df.reset_index(inplace=True)

        df = clean_market_hours(df)

        filename = stock.replace(".NS","")

        df.to_csv(f"../data/stocks/{filename}.csv", index=False)

    except Exception as e:

        print("Failed:", stock, e)

print("\nStock data download complete\n")

# ===============================
# DOWNLOAD INDEX DATA
# ===============================

print("Downloading indices...\n")

index_data = []

for name, ticker in INDICES.items():

    try:

        df = yf.download(
            ticker,
            period=PERIOD,
            interval=INTERVAL,
            progress=False
        )

        df.dropna(inplace=True)
        df.reset_index(inplace=True)

        df = clean_market_hours(df)

        df["return"] = df["Close"].pct_change()

        df = df[["Datetime","return"]]

        df.rename(columns={"return":name+"_return"}, inplace=True)

        df.to_csv(f"../data/indices/{name}.csv", index=False)

        index_data.append(df)

        print(name,"downloaded")

    except Exception as e:

        print("Index download failed:", name, e)

print("\nIndices downloaded\n")

# ===============================
# BUILD CROSS STOCK MATRIX
# ===============================

print("Building cross-stock dataset...\n")

stock_returns = []

for stock in STOCKS:

    filename = stock.replace(".NS","")
    path = f"../data/stocks/{filename}.csv"

    df = pd.read_csv(path)

    df["Datetime"] = pd.to_datetime(df["Datetime"])

    numeric_cols = ["Open","High","Low","Close","Volume"]

    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df["return"] = df["Close"].pct_change()

    df = df[["Datetime","return"]]

    df.rename(columns={"return":filename}, inplace=True)

    stock_returns.append(df)


# Merge safely using concat
market_matrix = stock_returns[0]

for df in stock_returns[1:]:

    market_matrix = pd.merge(
        market_matrix,
        df,
        on="Datetime",
        how="outer"
    )


# ==========================
# CROSS STOCK MOMENTUM
# ==========================

market_matrix["cross_stock_momentum"] = market_matrix.drop(
    columns=["Datetime"]
).mean(axis=1)


# ==========================
# MARKET VOLATILITY
# ==========================

market_matrix["market_volatility"] = market_matrix.drop(
    columns=["Datetime"]
).std(axis=1)

market_matrix.dropna(inplace=True)

# Save dataset
market_matrix.to_csv(
    "../data/market/market_context.csv",
    index=False
)

print("Cross-stock signals built")
print("\nData pipeline completed successfully.")