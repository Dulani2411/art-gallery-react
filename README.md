# Art Gallery MERN Stack & Data Engineering Project

## Overview
This project demonstrates a complete **Data Engineering pipeline** for an Art Gallery Management System.  
It extracts data from MongoDB, transforms it into a structured format, builds a **star schema**, performs analytics, and generates reports for decision-making.

The project is ideal for showcasing **ETL, data transformation, data warehouse design, and analytics skills**.

---

## Features
- Extract data from **MongoDB Atlas** collections (`arts`, `payments`)
- Transform and clean data:
  - Handle missing values
  - Standardize artist names and artwork types
  - Create derived fields (e.g., artwork count per payment)
- Build **star schema** tables:
  - Fact Table: `fact_sales`
  - Dimension Tables: `dim_art`, `dim_customer`, `dim_date`
- Perform **analytics**:
  - Total revenue
  - Payment status breakdown
  - Average order value
  - Monthly revenue trends
  - Top artists and most viewed artworks
  - Art type distribution
  - Payment success rate
- Save **transformed data** to CSV
- Generate **Excel and optional PDF analytics reports**
- Fully scripted in **Python** using `pandas` and `fpdf`

---

## Technologies Used
- **Python** (pandas, fpdf)
- **MongoDB Atlas** (NoSQL database)
- **CSV/Excel** output
- Optional: **Power BI** for dashboards
- VS Code for development

---

## Project Structure
Project final/
│
├─ etl/
│ └─ extract_mongo.py # ETL + analytics pipeline
│
├─ data/ # Raw extracted CSV files
│ ├─ arts.csv
│ └─ payments.csv
│
├─ output/ # Transformed and analytics CSV/PDF
│ ├─ fact_sales.csv
│ ├─ dim_art.csv
│ ├─ dim_customer.csv
│ ├─ dim_date.csv
│ └─ analytics_report.xlsx/pdf
│
└─ README.md



---

## How to Run
1. Clone the repository
2. Install required packages:

```bash
pip install pandas pymongo fpdf
Update MongoDB connection string in etl/extract_mongo.py:

python
Copy code
MONGO_URI = "your_mongodb_atlas_connection_string"
Run the ETL script:

bash
Copy code
python etl/extract_mongo.py
Check data/ for raw files, output/ for transformed data and analytics reports.

Next Steps / Extensions
Load star schema into PostgreSQL/MySQL

Build Power BI dashboards for visual analytics

Automate ETL using Airflow / cron jobs

Integrate additional analytics: top-selling artworks, seasonal trends, customer behavior

Project Outcome
This project demonstrates hands-on experience in:

ETL process

Data cleaning and transformation

Star schema design

Analytics and reporting

Python + Pandas + MongoDB

Preparing real-world data for business insights
