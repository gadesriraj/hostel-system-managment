# HostelSync — Smart Hostel Management Platform

A centralized, institutional-grade full-stack digital hostel management platform for colleges and universities. Replaces fragmented spreadsheets, paper complaint logs, and manual gate registers with an automated, role-governed platform.

---

## 🏛️ System Architecture

```
                                 ┌────────────────────────────────────────┐
                                 │            User Interfaces             │
                                 │  - Role Portals (Student/Warden/Staff) │
                                 │  - Interactive Room Matrix & Analytics │
                                 │  - Tailwind CSS + Lucide Icons         │
                                 └──────────────────┬─────────────────────┘
                                                    │ REST API / JSON
                                                    ▼
                     ┌────────────────────────────────────────────────────────────┐
                     │            Application Server & API Engine                 │
                     │  - Full-stack Server (server.ts)                           │
                     │  - JWT Authentication & Role-Based Access Control          │
                     │  - Room Allocation & Capacity Guards                       │
                     │  - Maintenance Workflow Engine & SLA Tracking             │
                     └──────────────────────────────┬─────────────────────────────┘
                                                    │
                                                    ▼
                                 ┌────────────────────────────────────────┐
                                 │      PostgreSQL / Supabase Database    │
                                 │  - 11 Relational Tables (database/schema.sql)
                                 │  - Referential Integrity & Cascades    │
                                 │  - Indexed Queries & Status Enums      │
                                 └────────────────────────────────────────┘
```

---

## 👥 Three Core Roles & Access Permissions

| Role | Access Scope | Key Capabilities |
| :--- | :--- | :--- |
| **Student** | Student Portal | View allocated room & roommates, log maintenance complaints, track SLA progress, request visitor entry passes, submit mess ratings & feedback, read notices. |
| **Warden / Admin** | Administrative Portal | Full hostel management, room CRUD & capacity matrices, allocate/reassign/evict rooms, triage complaints & assign to technicians, approve/reject visitor passes, publish institutional notices, view Recharts analytics. |
| **Hostel Staff** | Technician Portal | View assigned repair tasks filtered to own profile, toggle status (`In Progress`, `Resolved`), submit resolution notes and repair logs. |

---

## 🔑 Quick Demo Credentials (1-Click Switcher Available in UI)

| Role | Email | Password | Name | Focus / Room |
| :--- | :--- | :--- | :--- | :--- |
| **Warden / Admin** | `warden@hostelsync.edu` | `admin123` | Dr. Robert Vance | Chief Warden |
| **Student (Occupied)** | `student@hostelsync.edu` | `student123` | Alex Morgan | Room A-204 (AC Double) |
| **Student (Resident)** | `priya@hostelsync.edu` | `student123` | Priya Sharma | Room B-102 |
| **Staff (Electrician)** | `staff@hostelsync.edu` | `staff123` | David Miller | Electrical & HVAC |
| **Staff (Plumber)** | `carlos@hostelsync.edu` | `staff123` | Carlos Mendez | Plumbing & Drainage |

---

## 🚀 Running the Platform

### Integrated Full-Stack Application
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Applying Database Schema to PostgreSQL / Supabase
Run the provided SQL script located in `database/schema.sql`:
```bash
psql -h localhost -U postgres -d hostelsync -f database/schema.sql
```
For Supabase, copy the contents of `database/schema.sql` into the Supabase SQL Editor and execute.

---

## 📡 REST API Specifications

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new student or staff account |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token |
| `POST` | `/api/auth/logout` | Invalidate session |
| `GET` | `/api/students` | List all students with room & roommate data |
| `GET` | `/api/students/:id` | Detailed student profile with room details |
| `PUT` | `/api/students/:id` | Update student profile info |
| `GET` | `/api/rooms` | Query rooms filtered by block, floor, and occupancy |
| `POST` | `/api/rooms` | Create new hostel room (Warden) |
| `PUT` | `/api/rooms/:id` | Update room capacity, type, and status |
| `DELETE` | `/api/rooms/:id` | Delete room and unassign occupants |
| `POST` | `/api/allocations` | Allocate student to room with capacity check |
| `DELETE` | `/api/allocations/:id` | Release student room allocation |
| `GET` | `/api/complaints` | Retrieve complaints with role & status filters |
| `POST` | `/api/complaints` | File a new maintenance ticket |
| `PUT` | `/api/complaints/:id` | Update complaint status, assign staff, add notes |
| `GET` | `/api/visitors` | List visitor entry requests |
| `POST` | `/api/visitors` | Submit visitor pass request |
| `PUT` | `/api/visitors/:id` | Warden approve/reject visitor pass |
| `GET` | `/api/notices` | Fetch published hostel announcements |
| `POST` | `/api/notices` | Post institutional notice |
| `GET` | `/api/feedback` | List mess food quality ratings |
| `POST` | `/api/feedback` | Submit meal rating and hygiene feedback |
| `GET` | `/api/analytics/rooms` | Occupancy rates, block breakdowns, and capacities |
| `GET` | `/api/analytics/complaints` | Status counts, category charts, resolution times |
| `GET` | `/api/analytics/maintenance` | Technician performance metrics and SLA response rates |
