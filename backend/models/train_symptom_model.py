import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, matthews_corrcoef
import urllib.request

def train_and_evaluate():
    file_path = os.path.join(os.path.dirname(__file__), '..', 'datasets', 'archive', 'Training.csv')
    
    if os.path.exists(file_path):
        print("Loading Real Dataset...")
        df = pd.read_csv(file_path)
        # The dataset might have an extra 'Unnamed' column at the end
        if df.columns[-1].startswith('Unnamed'):
            df = df.drop(df.columns[-1], axis=1)
    else:
        print(f"Fatal error: Dataset failed to load at {file_path}.")
        return
    
    X = df.drop('prognosis', axis=1)
    y = df['prognosis']
    
    # Store dynamic symptom list based on CSV columns
    symptoms_list = list(X.columns)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    models = {
        "Logistic Regression": LogisticRegression(max_iter=500, random_state=42),
        "Naive Bayes": GaussianNB(),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    }
    
    best_model = None
    best_acc = 0
    best_name = ""
    
    print("\nModel Evaluation (Real Dataset):")
    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        acc = accuracy_score(y_test, preds)
        mcc = matthews_corrcoef(y_test, preds)
        print(f"{name} Accuracy: {acc:.4f} | Matthews Correlation Coefficient (MCC): {mcc:.4f}")
        
        if acc > best_acc:
            best_acc = acc
            best_model = model
            best_name = name
            
    print(f"\nBest Model: {best_name} with Accuracy ~ {best_acc:.4f}")
    
    # Save the model
    model_path = os.path.join(os.path.dirname(__file__), 'symptom_model.pkl')
    joblib.dump(best_model, model_path)
    print(f"Model saved to {model_path}")

    # Save symptom list for API
    symptom_path = os.path.join(os.path.dirname(__file__), 'symptoms_list.pkl')
    joblib.dump(symptoms_list, symptom_path)
    print("Symptoms list saved successfully!")

if __name__ == "__main__":
    train_and_evaluate()
