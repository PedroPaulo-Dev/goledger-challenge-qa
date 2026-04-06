# QA Test API

A REST API that sits in front of the Hyperledger Fabric network.  
It adds an authentication layer and exposes simplified endpoints for managing books, persons, and libraries on the blockchain.

Your task is to **find and clearly document every functional bug** you can identify in this API.

---

## Prerequisites

| Requirement | Notes |
|---|---|
| Docker & Docker Compose | Required to run the Fabric network and CCAPI |
| Go 1.21+ | Only required for local (non-Docker) development |
| Hyperledger Fabric network | Provided by the GoLedger Team |

## Running the API

### With Docker Compose (recommended)

Make sure the cc-tools-demo Fabric network is already up, then:

```sh
cd api
cp .env.example .env
docker-compose up --build
```

The API is available at `http://localhost:8080`.

### Locally (without Docker)

```sh
cd api
cp .env.example .env
go mod tidy
go run .
```

Set `CCAPI_ORG_URL`, `CCAPI_AUTH_USERNAME` and `CCAPI_AUTH_PASSWORD` in your .env with the provided values.

---

## Authentication

The API uses **JWT Bearer tokens**.  
All endpoints except `/auth/login` and `/auth/register` require the header:

```
Authorization: Bearer <token>
```

### Default users

| Username | Password | Role  |
|----------|----------|-------|
| admin    | admin123 | admin |
| user1    | pass123  | user  |

---

## Endpoints

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Authenticate and receive a JWT token |
| POST | `/auth/register` | Create a new user account |
| GET  | `/me` | Return the profile of the currently authenticated user |

**Login request body:**
```json
{ "username": "admin", "password": "admin123" }
```
**Login response:**
```json
{ "token": "<jwt>" }
```

---

### Books

Books are stored on the Hyperledger Fabric blockchain. A book is uniquely identified by the combination of `title` + `author`.

| Method | Path | Auth required | Description |
|--------|------|:---:|-------------|
| GET    | `/books?author=X&genre=Y&page=N&limit=N` | ✅ | List books by author with optional genre filter and pagination |
| POST   | `/books` | ✅ | Create a new book |
| PUT    | `/books/tenant` | ✅ | Assign a tenant (person) to a book |
| DELETE | `/books?title=X&author=Y` | — | Delete a book |

**POST /books request body:**
```json
{
  "title":  "The Go Programming Language",
  "author": "Alan Donovan",
  "genres": ["Technology"],
  "bookType": 0
}
```

`bookType` values: `0` = Hardcover, `1` = Paperback, `2` = Ebook.

**PUT /books/tenant request body:**
```json
{
  "title":    "The Go Programming Language",
  "author":   "Alan Donovan",
  "tenantId": "000.000.000-00"
}
```

---

### Persons

Persons are identified by their Brazilian CPF number (`id` field).

| Method | Path | Auth required | Description |
|--------|------|:---:|-------------|
| POST | `/persons` | ✅ | Create a new person |

**POST /persons request body:**
```json
{
  "id":          "000.000.000-00",
  "name":        "Alice",
  "dateOfBirth": "1990-01-15T00:00:00Z",
  "height":      1.70
}
```

---

### Libraries

| Method | Path | Auth required | Description |
|--------|------|:---:|-------------|
| POST | `/libraries` | ✅ | Create a new library |
| GET  | `/libraries/:name/books` | ✅ | Get the number of books in a library |

**POST /libraries request body:**
```json
{ "name": "Central Library" }
```
