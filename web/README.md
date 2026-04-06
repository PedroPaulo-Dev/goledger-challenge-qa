# QA Test Frontend

A React single-page application for the Library Manager system.  
It interacts with the [QA Test API](../api/README.md), which in turn connects to a Hyperledger Fabric blockchain via the deployed CCAPI.

Your task is to **find and clearly document every functional bug** you can identify in this front-end application.

---

## Prerequisites

| Requirement | Notes |
|---|---|
| Node.js 18+ | Required to run the development server |
| [api](../api) running | Start it first; default URL `http://localhost:8080` |
| Hyperledger Fabric network | Provided by the GoLedger Team |

## Running the Application

```sh
cd web
cp .env.example .env          # adjust VITE_API_URL if needed
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Default Credentials

| Username | Password |
|----------|----------|
| admin    | admin123 |
| user1    | pass123  |

---

## Features

| Page | Description |
|------|-------------|
| **Login** | Authenticate with username and password |
| **Register** | Create a new user account |
| **Books** | Search books by author and genre; create books; delete books; assign a tenant (borrower) |
| **Persons** | Register a new person (identified by Brazilian CPF) |
| **Libraries** | Create a library; query the number of books in a library |

---