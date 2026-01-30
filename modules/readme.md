# Modules — AROGYA-X

## Overview

The modules directory contains the core functional components of the AROGYA-X system. Each module handles a specific healthcare service and operates independently while communicating with the backend.

This modular architecture improves scalability, maintainability, and future expansion.

---

## Core Modules

### chatbot.js
- Manages chatbot conversation flow
- Handles user intents
- Routes queries to appropriate modules

---

### symptom-assessment.js
- Analyzes symptoms provided by users
- Matches symptoms with known diseases
- Calculates severity and risk level

---

### emergency-detection.js
- Identifies critical health conditions
- Triggers emergency alerts
- Provides emergency guidance

---

### medication-reminder.js
- Schedules medication reminders
- Sends alerts and notifications
- Supports dosage tracking

---

### voice-interaction.js
- Converts speech to text
- Enables hands-free interaction
- Improves accessibility

---

### multilingual-support.js
- Translates user input
- Supports regional languages
- Returns localized responses

---

### gps-hospital-locator.js
- Fetches user location
- Identifies nearby hospitals
- Provides navigation assistance

---

## Design Principles

- Modular architecture
- Loose coupling
- High reusability
- Easy testing and debugging

---

## Project

**AROGYA-X — Intelligent Healthcare System**
