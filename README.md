# 🏥 MediPredict AI — AI-Based Medical Disease Prediction System

MediPredict AI is a machine learning and deep learning-based medical disease prediction project designed to explore how artificial intelligence can assist in preliminary disease risk assessment.

The project combines a web-based interface with predictive models to demonstrate AI-assisted medical analysis using symptom-based and medical image-based inputs.

> **Disclaimer:** MediPredict AI is an academic project and is not a substitute for professional medical advice, diagnosis, or treatment. Predictions must not be used as the sole basis for medical decisions.

## 📌 Project Overview

Healthcare applications can use machine learning to identify patterns in medical data and support preliminary analysis.

MediPredict AI demonstrates the integration of machine learning, deep learning, and web development to build an interactive medical prediction application.

### 🎯 Objectives

* Develop a web-based medical prediction application.
* Apply machine learning techniques to symptom-based prediction.
* Explore deep learning for medical image classification.
* Integrate trained models with a Flask backend.
* Generate an interactive interface for users.
* Demonstrate the application of AI in healthcare-related projects.

## ✨ Key Features

* **Symptom-Based Prediction:** Uses a machine learning model to analyze supported symptom inputs.
* **Medical Image Analysis:** Explores deep learning techniques for medical image classification.
* **Web-Based Interface:** Provides an interface for interacting with the prediction system.
* **Python Backend:** Uses Flask to connect the interface with the prediction logic.
* **Prediction Reports:** The project includes the ReportLab dependency for PDF generation; available reporting functionality depends on the implemented application.
* **User Authentication Components:** The project includes authentication-related dependencies such as bcrypt and PyJWT.

*Features depend on the models, routes, and components implemented in the current version of the application.*

## 🛠️ Technologies Used

| Technology   | Purpose                                       |
| ------------ | --------------------------------------------- |
| Python       | Core programming language                     |
| Flask        | Web application backend                       |
| TensorFlow   | Deep learning model development and inference |
| Scikit-learn | Machine learning algorithms                   |
| NumPy        | Numerical computation                         |
| Pandas       | Data processing and analysis                  |
| HTML         | Web page structure                            |
| CSS          | Interface styling                             |
| JavaScript   | Frontend interactions                         |
| Pillow       | Image processing                              |
| ReportLab    | PDF generation                                |
| bcrypt       | Password hashing functionality                |
| PyJWT        | JSON Web Token functionality                  |

## 🏗️ System Architecture

The application follows a web-based machine learning architecture.

```text
              USER
                |
                v
       Web User Interface
        HTML / CSS / JS
                |
                v
        Flask Application
                |
          +-----+-----+
          |           |
          v           v
   Symptom-Based   Image-Based
    Prediction     Prediction
          |           |
          v           v
    ML Prediction   DL Model
          |           |
          +-----+-----+
                |
                v
       Prediction Results
                |
                v
        Results Interface
```

*This diagram illustrates the intended high-level workflow. The exact execution flow depends on the current implementation.*

## 📂 Project Structure

The repository contains Python scripts, backend application files, frontend resources, model-related code, and supporting utilities.

```text
Disease Prediction/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── retrain_full_pipeline.py
│
├── project/
│   └── backend/
│       ├── app.py
│       ├── requirements.txt
│       ├── models/
│       ├── static/
│       └── templates/
│
├── check_dataset.py
├── count_images.py
├── debug_dataset.py
├── organize_dataset.py
├── predict.py
├── test_app_import.py
├── test_image_prediction.py
├── test_tensorflow.py
├── train.py
└── README.md
```

*The structure above reflects the project folders identified during development. Some files and folders may be excluded from GitHub.*

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the application:

* Python
* Git
* Visual Studio Code
* A web browser

### Step 1: Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/tanvitrp/MediPredict--AI.git
```

Navigate into the repository:

```bash
cd MediPredict--AI
```

### Step 2: Create a Virtual Environment

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### Step 3: Install Dependencies

Navigate to the backend folder containing the `requirements.txt` file for the application you intend to run.

For example, if using `project/backend`:

```powershell
cd project/backend
pip install -r requirements.txt
```

### Step 4: Configure Required Files

The repository may not contain datasets, trained model files, or local databases.

Before running the application:

1. Obtain the required datasets from their authorized sources.
2. Train the models or obtain compatible trained model files.
3. Place the model files in the locations expected by the application.
4. Configure any required environment variables.
5. Follow the application's expected directory structure.

Do not commit private medical reports, credentials, or personal user data.

### Step 5: Run the Application

From the selected backend directory, run:

```bash
python app.py
```

Open the local address printed in the terminal in your web browser.

*The application may require additional configuration or model files before it can run successfully.*

## 🧠 Machine Learning and Deep Learning

The project explores two prediction approaches:

### 1. Symptom-Based Prediction

A machine learning model processes supported symptom inputs and generates a prediction based on patterns learned from its training data.

### 2. Medical Image Classification

A deep learning model processes supported medical images to perform image classification.

The quality of predictions depends on the training dataset, preprocessing pipeline, model architecture, and validation performance.

## 🔒 Security Considerations

* Passwords should be stored using secure password hashing.
* Authentication tokens should be validated correctly.
* Secret keys and credentials should be stored outside source code.
* User-submitted files should be validated before processing.
* Medical reports and personal information should not be exposed publicly.
* Prediction results should be presented with appropriate limitations.

## 🚧 Limitations

* Model predictions depend on the quality and coverage of the training data.
* Results may be inaccurate for images or symptoms outside the supported dataset.
* The application is intended for academic demonstration.
* Clinical validation and professional medical evaluation are required before any real-world healthcare use.
* Model files and datasets may need to be obtained separately.

## 🔮 Future Enhancements

* Improve model performance through additional training and validation.
* Add comprehensive model evaluation metrics.
* Improve interface accessibility and responsiveness.
* Strengthen authentication and input validation.
* Add automated testing and deployment.
* Improve documentation and reproducibility.

## 👩‍💻 Author

**Tanvi Palankar**

B.Tech Computer Science and Engineering

GitHub: [@tanvitrp](https://github.com/tanvitrp)

## 📄 License

This project is intended for academic and educational purposes.

A formal open-source license has not yet been specified. Until one is added, all rights remain with the respective copyright holders.

## ⚕️ Medical Disclaimer

MediPredict AI is an educational project and is not a clinically validated medical diagnostic system. It must not replace a qualified healthcare professional's judgment, diagnosis, or treatment recommendations.
