import numpy as np
from sklearn.linear_model import ElasticNetCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler


rng = np.random.default_rng(42)
x_primary = rng.normal(size=(120, 4))
x_correlated = x_primary[:, :2] + rng.normal(scale=0.08, size=(120, 2))
X = np.column_stack([x_primary, x_correlated])
y = 1.5 * X[:, 0] - 0.8 * X[:, 2] + rng.normal(scale=0.35, size=120)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42
)
model = make_pipeline(
    StandardScaler(),
    ElasticNetCV(
        l1_ratio=[0.1, 0.5, 0.9, 1.0],
        alphas=100,
        cv=5,
        max_iter=20000,
    ),
)
model.fit(X_train, y_train)
prediction = model.predict(X_test)

print("MAE", mean_absolute_error(y_test, prediction))
print("RMSE", mean_squared_error(y_test, prediction) ** 0.5)
print("R2", r2_score(y_test, prediction))
