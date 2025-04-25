# Project Setup Instructions

##  1. Installation and Setup: 
The following needs to be installed:
- [Node.js](https://nodejs.org/en/download) (LTS version recommended)
- In the backend directory, execute the following 2 commands: 
    - npm install
    - npm init -y
    - npm install bcrypt express pg express-session body-parser cors ajv multer @google/generative-ai
    - nvm install --lts
    - nvm use --lts
- In the frontend1 directory, run the command:
    - npm install react-router
    - npm install @monaco-editor/react

---

## 2. Setting up PostgreSQL and Connecting to the Database
Before running the application, ensure the backend is properly connected to the database by running the commands in order in the backend directory:
- sudo apt install postgresql
- sudo su - postgres
- psql 
- create database codeforces;
- create user test password 'test';
- grant all on database codeforces to test;
- \q
- exit
- psql -U test -d codeforces -h localhost -p 5432
    - Enter the password as "test"
-  \i '/path/to/backend/DDL.sql'

In a new terminal, inside the backend directory, run "python3 insert_data.py"

---

## 3. Run the Application

### Backend
Start the backend server:
```bash
cd /path/to/backend
node app.js
```

### Frontend
Start the frontend development server:
```bash
cd /path/to/frontend1
npm start
```

---
