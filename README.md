# TRT Clinic Management System

## Overview
The TRT Clinic Management System is a modern, comprehensive web application designed specifically for Testosterone Replacement Therapy (TRT) and hormone optimization clinics. It provides clinic administrators and medical providers with a centralized dashboard to manage patients, track treatment protocols, monitor lab results, and handle prescription renewals.

## The Idea
Managing a TRT clinic involves tracking complex, time-sensitive medical data. Patients require regular lab work, strict adherence to medication protocols, and timely prescription renewals. Traditional EHRs (Electronic Health Records) are often bloated and not tailored to the specific needs of hormone therapy clinics. 

This system was built to solve that problem by offering a streamlined, specialized workflow that focuses on:
- **Patient Intake & Consent:** Easy onboarding with tracking for HIPAA acknowledgments and treatment agreements.
- **Protocol Management:** Tracking specific compounds (e.g., Testosterone Cypionate, HCG, Anastrozole), dosages, and frequencies.
- **Lab Tracking:** Monitoring critical biomarkers (Total/Free T, Estradiol, Hematocrit, PSA) with automatic flagging for out-of-range values.
- **Rx Renewals:** Keeping track of prescription statuses, due dates, and dispensing records.
- **Alerts & Reminders:** Automatically surfacing patients who are overdue for a dose, need lab work, or have pending renewals.

## Tech Stack
- **Frontend & Backend:** Next.js 14 (App Router)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js
- **Deployment:** Docker & Docker Compose

## Features
- **Provider Dashboard:** A high-level overview of clinic operations, highlighting urgent alerts for patient care.
- **Patient Directory:** A searchable database of all active and inactive patients.
- **Detailed Patient Profiles:** Individual views showing intake history, current protocol, recent lab trends, and billing status.
- **Automated Health Checks:** The system intelligently calculates days until next dose or renewal and flags them accordingly (Warning/Overdue).
- **Seeded Demo Environment:** Includes a rich set of dummy data (20 realistic patient scenarios) to demonstrate the system's capabilities immediately upon setup.

## Getting Started (Docker Workflow)
This project is fully containerized for easy setup and consistent environments.

### Prerequisites
- Docker and Docker Compose installed
- Windows PowerShell (if running locally on Windows)

### Running the App
1. **Build and start the application:**
   Run the provided PowerShell script from the project root:
   ```powershell
   .\run.ps1
   ```
   This script will:
   - Start the PostgreSQL database container.
   - Wait for the database to be healthy.
   - Run Prisma migrations and seed the database with sample data.
   - Build and start the Next.js application container.

2. **Access the application:**
   - Web App: [http://localhost:3000](http://localhost:3000)
   - pgAdmin (Database Management): [http://localhost:5050](http://localhost:5050)

### Demo Credentials
To explore the application, use the seeded admin account:
- **Email:** `admin@clinic.com`
- **Password:** `admin123`

## Disclaimer
*This software is currently designed for demonstration and operational management purposes. It is NOT a certified EHR (Electronic Health Record) system and does not independently guarantee HIPAA compliance without proper infrastructure and auditing implementations in a production environment.*
