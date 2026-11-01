# 🛡️ Armor (Protection Hub) - Project Vision & Conversation Summary

**Project Title**: Armor / Protection Hub (Cybersecurity Toolkit)  
**Context**: College Minor Project for Computer Engineering  
**Project Path**: `D:\Projects\cybersecurity-toolkit`  
**Date**: August 5, 2026  

---

## 🎯 Executive Summary & Concept

**Armor** is a modern, web-based **Cybersecurity Toolkit** designed for real-world utility and practical everyday use. 

Inspired by the intuitive user interface model of **iLovePDF**, Armor presents a clean, grid-based dashboard where each cybersecurity utility is represented as a dedicated, interactive card/tile. Users can click on any tile to open a focused workspace for that security tool.

---

## 🚀 Key Highlights & Architectural Decisions

### 1. The "iLovePDF" Layout Model
- **Grid Dashboard**: Clean grid of clickable tool tiles on the homepage.
- **Dedicated Workspaces**: Clicking a tool tile opens a dedicated workspace with input fields, live visualization, instant analysis, and conceptual explanation tabs for college evaluation.

### 2. Real-World Practical Utility
The toolkit emphasizes tools that solve actual day-to-day security and privacy challenges for everyday users.

#### Key Featured Flow: End-to-End Encrypted File Vault & Sharing
1. **Account / Session**: User logs into their Armor account.
2. **Client-Side Encryption**: User uploads a file (document/photo/data). The app encrypts the file on the user's browser using AES-256-GCM.
3. **Secret Key & File Export**: A unique decryption key is generated for the user to copy, and the encrypted file is saved/shared.
4. **Secure Recipient Decryption**: The recipient uploads the encrypted file into Armor, inputs the Secret Key, and decrypts the file safely back to its original form.

### 3. Dual-Purpose College Submission Strategy
- **Web Dashboard**: High-tech UI built with HTML5, CSS3 (Glassmorphism & Dark Mode), and JavaScript (Web Crypto API).
- **Python CLI Backend Tools**: Command-line python scripts (`python_cli/toolkit.py`) providing terminal-based scanning and cryptography features, appealing directly to Computer Engineering professors and evaluators.

---

## 📑 Planned Feature Categories

1. **Identity & Credentials**:
   - Password Entropy Meter, GPU Crack-Time Estimator, & Secure Passphrase Generator.
2. **Web Security & Vulnerabilities**:
   - Phishing URL Risk Analyzer & Suspicious Link Inspector.
   - SQL Injection (SQLi) Payload Tester & Parameterized Fix Visualizer.
   - XSS & Command Injection Input Sanitizer.
   - HTTP Security Header Auditor (HSTS, CSP, CORS).
3. **Cryptography Workbench**:
   - AES-256 Vault (Symmetric Encryption/Decryption).
   - RSA Key Generator & Asymmetric Encryption Lab.
   - Multi-Hash Generator & Automatic Hash Type Identifier.
   - Caesar & Classical Cipher Workbench with Auto-Cracker.
4. **Privacy & Digital Forensics**:
   - Image Steganography Studio (LSB message embedding/extraction).
   - EXIF Metadata Inspector & Stripper.

---

## 📌 Current Status & Next Steps

- [x] Environment configured on D: Drive (`D:\Projects\cybersecurity-toolkit`).
- [x] High-level architecture & user workflow defined.
- [ ] User pasting personal feature research list for item-by-item evaluation.
- [ ] Finalizing the feature set and UI design mockups.
- [ ] Step-by-step build of the Web Dashboard and Python CLI suite.
