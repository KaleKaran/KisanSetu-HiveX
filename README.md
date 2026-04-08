# KisanSetu-HiveX
Offline-first smart agriculture system using ML and IoT concepts to provide fertilizer and irrigation recommendations based on soil and environmental data.

# Smart Fertilizer Recommendation System (ML Module)

## Overview
This repository contains the initial version of our Smart Agriculture Project, focused on building a machine learning model for fertilizer recommendation.

The goal of this module is to analyze soil nutrient levels and environmental conditions to predict the most suitable fertilizer for a given crop scenario.

This version represents the **core intelligence layer** of the system.

---

## What This Version Includes

- Data preprocessing and cleaning  
- Feature selection based on soil and environmental parameters  
- Model training using Random Forest  
- Model evaluation  
- Model serialization for future integration  

---

## Dataset Description

The model is trained on a dataset containing the following features:

- **Nitrogen (N)**
- **Phosphorus (P)**
- **Potassium (K)**
- **Soil Moisture**
- **Temperature**
- **Humidity**
- **pH Level**

**Target Output:**
- Recommended Fertilizer Type

---

## Model Details

- **Algorithm Used:** Random Forest Classifier  
- **Reason for Selection:**
  - Handles non-linear relationships effectively  
  - Robust against overfitting  
  - Performs well on structured agricultural data  

- The model is trained using standard train-test split and evaluated on prediction accuracy.

---

## Outputs Generated

- Trained model file (`.pkl`)  
- Jupyter Notebook (`.ipynb`) containing full pipeline:
  - Data preprocessing  
  - Model training  
  - Evaluation  

---

## Current Limitations

This version is limited to the machine learning component only.

- No frontend interface  
- No backend/API integration  
- No real-time data input  
- Works only on static dataset  

---

## Next Steps

Future versions of this project will include:

- Backend integration (Flask API)  
- Frontend user interface  
- Data storage (history tracking)  
- Sensor data integration (real or simulated)  
- Irrigation recommendation logic  

---

## Note

This is the initial development stage of the project and focuses only on building a reliable machine learning model. Further system integration will be developed in subsequent versions.
