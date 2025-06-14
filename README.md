# 🔍 API Logging Tool — Next.js + Supabase

A powerful developer tool to **log, inspect, and debug API requests** in real time. Built using **Next.js** and **Supabase**, this tool allows you to test any public/private API and automatically logs request/response metadata for observability.

> Think of it as your Postman + API debugger + Supabase logger all in one ⚡

---

## ✨ Features

- 🔐 **User-based API logs** via Supabase Auth
- 🧪 **Test any API** (GET, POST, PUT, DELETE)
- 📊 **Auto-logs** request headers, body, response, time, status, and size
- ⚠️ Handles and logs **errors** (invalid endpoints, CORS issues, network errors)
- 📁 View **full headers and payloads**
- 🕒 Shows **response time**, **status code**, and **timestamp**
- ☁️ Powered by **Supabase DB** (PostgreSQL)

---

## 🚀 Tech Stack

| Layer       | Technology       |
|-------------|------------------|
| Frontend    | [Next.js](https://nextjs.org/) + Tailwind CSS |
| Backend     | [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) |
| Database    | [Supabase](https://supabase.io/) (PostgreSQL) |
| Auth        | Supabase Auth     |
| Logging     | Custom `saveApiLog` handler with real-time storage |
| Deployment  | Vercel / Netlify (optional) |

---

## 📦 Installation

```bash
git clone https://github.com/your-username/api-log-tool-with-supabase.git
cd api-log-tool-with-supabase
npm install 
```
---

## 🔐 Setup Supabase
Go to Supabase

Create a new project

Enable Email Auth in the Authentication tab

Create a table for logs (see schema below)

Get your Supabase URL and Anon Key

## 🧱 Supabase Schema (Table: api_logs)
```bash
create table api_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  method text,
  url text,
  endpoint text,
  headers jsonb,
  request_payload jsonb,
  response_payload jsonb,
  status_code int,
  response_time int,
  error text,
  user_agent text,
  size int,
  inserted_at timestamp default current_timestamp
);
```
---

## 🔧 Environment Variables
Create a .env.local file in the root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
🧠 How It Works
User logs in via Supabase

They input the API URL, method, headers, and body

Tool sends a request using fetch

Response is captured and:

Displayed beautifully

Logged to Supabase (api_logs table)

Error logs are also captured with status 0

```

---

