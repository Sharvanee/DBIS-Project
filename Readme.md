# Project: CodeQuest
- This project is a full-stack platform integrating authentication, data management, and visualization using Node.js, PostgreSQL, and React. 
- It is the implementation of a fully functional competitive programming platform called CodeQuest (inspired from
already existing platforms such as Codeforces or LeetCode), which provides users with an interactive and user-friendly interface to learn in-demand programming languages, practice problem solving, participate in contests, track their performance, create custom
contests, write blogs, and engage with the like-minded coding community.


# Setup Instructions

##  1. Installation and Setup: 
The following needs to be installed:
- [Node.js](https://nodejs.org/en/download) (LTS version recommended)
- In the backend directory, execute the following 2 commands: 
    - npm install
    - npm init -y
    - npm install bcrypt express pg express-session body-parser cors ajv multer @google/generative-ai google-auth-library
    - nvm install --lts
    - nvm use --lts
    - npm install google-auth-library
- In the frontend1 directory, run the command:
    - npm install lucide-react
    - npm install react-router @monaco-editor/react date-fns react-calendar-heatmap react-github-calendar

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
