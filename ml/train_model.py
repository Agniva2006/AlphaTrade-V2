import pandas as pd
import numpy as np
import glob
import joblib
import xgboost as xgb

from sklearn.metrics import mean_absolute_error, mean_squared_error
from features import create_features


# ======================================
# LOAD ALL STOCK DATA
# ======================================

print("\nLoading stock datasets...\n")

files = glob.glob("../data/stocks/*.csv")

dataframes = []

for file in files:

    print("Processing:", file)

    df = pd.read_csv(file)

    # Feature engineering
    df_features = create_features(df)

    dataframes.append(df_features)


# Combine all stocks
dataset = pd.concat(dataframes)

# Sort by time
dataset.sort_values("Datetime", inplace=True)

dataset.reset_index(drop=True, inplace=True)

print("\nTotal rows in dataset:", len(dataset))


# ======================================
# FEATURE LIST
# ======================================

features = [

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
# FEATURE VALIDATION
# ======================================

missing = [f for f in features if f not in dataset.columns]

if missing:

    print("\nERROR: Missing features detected")

    print(missing)

    raise ValueError("Feature generation failed")


# ======================================
# PREPARE DATA
# ======================================

X = dataset[features]

y = dataset["target"]


# ======================================
# TIME SERIES SPLIT
# ======================================

split_index = int(len(dataset) * 0.8)

X_train = X.iloc[:split_index]
X_test = X.iloc[split_index:]

y_train = y.iloc[:split_index]
y_test = y.iloc[split_index:]

print("\nTraining rows:", len(X_train))
print("Testing rows:", len(X_test))


# ======================================
# MODEL CONFIGURATION
# ======================================

model = xgb.XGBRegressor(

    n_estimators=1000,
    learning_rate=0.03,
    max_depth=8,

    subsample=0.9,
    colsample_bytree=0.9,

    gamma=0.1,

    reg_lambda=1.0,
    reg_alpha=0.1,

    random_state=42,

    n_jobs=-1
)


# ======================================
# TRAIN MODEL
# ======================================

print("\nTraining XGBoost model...\n")

model.fit(

    X_train,
    y_train,

    eval_set=[(X_test, y_test)],



    verbose=False
)


# ======================================
# MAKE PREDICTIONS
# ======================================

pred = model.predict(X_test)


# ======================================
# MODEL EVALUATION
# ======================================

mae = mean_absolute_error(y_test, pred)

rmse = np.sqrt(mean_squared_error(y_test, pred))

print("\nReturn Prediction Performance")

print("MAE :", mae)

print("RMSE:", rmse)


# ======================================
# FEATURE IMPORTANCE
# ======================================

importance = pd.DataFrame({

    "feature": features,

    "importance": model.feature_importances_

})

importance.sort_values(

    by="importance",

    ascending=False,

    inplace=True

)

print("\nTop 10 Most Important Features\n")

print(importance.head(10))


# ======================================
# SAVE FEATURE IMPORTANCE
# ======================================

importance.to_csv(

    "feature_importance.csv",

    index=False

)


# ======================================
# SAVE MODEL
# ======================================

joblib.dump(model, "model.pkl")

print("\nModel saved successfully → model.pkl")

print("\nTraining pipeline completed.\n")