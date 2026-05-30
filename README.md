# Archify & Buildify — MERN Stack

Full conversion of the original PHP/MySQL app to a modern **MERN** stack:
**MongoDB · Express · React (Vite 19 + Tailwind CSS) · Node.js**

---

## Project Structure

```
archify-mern/
├── package.json               ← root (concurrently dev runner)
│
├── server/                    ← Node.js + Express backend
│   ├── server.js              ← Entry point
│   ├── .env.example
│   ├── models/
│   │   ├── Admin.js           ← Admin user (bcrypt password)
│   │   ├── Client.js          ← Client onboarding (PHP: clients table)
│   │   ├── Staff.js           ← Architects/staff (PHP: staffs table)
│   │   ├── Lead.js            ← Leads + follow-ups (PHP: member_status)
│   │   ├── Project.js         ← Work delegation + task tracking
│   │   ├── Invoice.js         ← Invoices, quotations, receipts
│   │   ├── Employee.js        ← Attendance employees (PHP: employee table)
│   │   ├── Department.js      ← Attendance departments
│   │   ├── Shift.js           ← Work shifts
│   │   └── Attendance.js      ← Daily attendance records
│   ├── routes/
│   │   ├── auth.js            ← POST /api/auth/admin/login, /employee/login
│   │   ├── clients.js         ← CRUD /api/clients
│   │   ├── staffs.js          ← CRUD /api/staffs
│   │   ├── leads.js           ← CRUD /api/leads
│   │   ├── projects.js        ← CRUD /api/projects
│   │   ├── invoices.js        ← CRUD /api/invoices
│   │   ├── attendance.js      ← Check-in, check-out, admin view
│   │   ├── employees.js       ← CRUD /api/employees
│   │   ├── departments.js     ← Departments + shifts CRUD
│   │   └── dashboard.js       ← GET /api/dashboard/summary
│   └── middleware/
│       └── auth.js            ← JWT guard (protectAdmin, protectEmployee)
│
└── client/                    ← React + Vite + Tailwind frontend
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx             ← All routes defined here
        ├── index.css           ← Tailwind + custom component classes
        ├── context/
        │   └── AuthContext.jsx ← Login/logout state, JWT storage
        ├── utils/
        │   └── api.js          ← Axios instance with /api base + 401 guard
        ├── components/
        │   ├── layout/
        │   │   ├── AdminLayout.jsx       ← Sidebar + topbar for admin
        │   │   └── AttendanceLayout.jsx  ← Simple header for employee portal
        │   └── ui/
        │       └── index.jsx   ← PageHeader, StatCard, DataTable, Modal,
        │                         FormField, StatusBadge, SearchBar, ConfirmDialog
        └── pages/
            ├── LoginPage.jsx             ← Admin login + link to employee portal
            ├── NotFound.jsx
            ├── admin/
            │   ├── Dashboard.jsx         ← Stats + recharts (pie, bar)
            │   ├── ClientsList.jsx       ← Table with search
            │   ├── ClientEntry.jsx       ← Add/edit client form
            │   ├── LeadsList.jsx         ← Leads table
            │   ├── LeadForm.jsx          ← Lead + 3 follow-up slots
            │   ├── ProjectsList.jsx      ← Task status mini-grid per project
            │   ├── ProjectForm.jsx       ← 8-task assignment table
            │   ├── InvoiceList.jsx       ← Filter by type, totals summary
            │   ├── InvoiceForm.jsx       ← Line items, auto-total, balance
            │   ├── StaffsList.jsx        ← Staff/architects table
            │   ├── StaffEntry.jsx        ← Add/edit staff
            │   ├── AttendanceAdmin.jsx   ← Month filter, employee attendance log
            │   ├── EmployeesList.jsx     ← Attendance employees
            │   ├── EmployeeForm.jsx      ← Add/edit employee + dept/shift select
            │   └── DepartmentsPage.jsx  ← Manage departments + shifts
            └── attendance/
                ├── EmployeeLogin.jsx     ← Employee-specific login screen
                ├── EmployeeProfile.jsx   ← Employee profile summary
                └── AttendanceMark.jsx    ← Live clock, check-in/check-out form
```

---

## Quick Start

### 1. Prerequisites
- Node.js ≥ 18
- MongoDB running locally (or MongoDB Atlas URI)

### 2. Clone & install dependencies

```bash
git clone <repo-url>
cd archify-mern

# Install root dev deps
npm install

# Install server deps
cd server && npm install && cd ..

# Install client deps
cd client && npm install && cd ..
```

### 3. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env:
#   MONGO_URI=mongodb://localhost:27017/archify
#   JWT_SECRET=change_this_to_a_long_random_string
```

### 4. Create the first admin account

Start the server once, then POST to the seed endpoint:

```bash
cd server && node server.js &
curl -X POST http://localhost:5000/api/auth/admin/seed
# Response: { "message": "Admin created: admin / admin123" }
```

Change the password immediately after first login.

### 5. Run in development

```bash
# From root directory — runs both server (port 5000) and client (port 5173)
npm run dev
```

Open **http://localhost:5173**

---

## User Flows (identical to original PHP app)

| Portal | URL | Credentials |
|--------|-----|-------------|
| Admin Login | `/` | admin / admin123 (after seed) |
| Employee Attendance Portal | `/attendance` | Set via Admin → Employees |

### Admin Portal Pages
| Page | Route | PHP Equivalent |
|------|-------|----------------|
| Dashboard | `/admin` | `admin/index.php` |
| Client Onboarding | `/admin/clients` | `admin/members.php` |
| Client Entry Form | `/admin/clients/new` | `admin/member-entry.php` |
| Leads Management | `/admin/leads` | `admin/member-status.php` |
| Invoice & Payments | `/admin/invoices` | `admin/payment.php` + `Invoice-Generation.php` |
| Work Delegation | `/admin/projects` | `admin/work.php` + `work-table.php` |
| Staff / Architects | `/admin/staffs` | `admin/staffs.php` |
| Attendance Reports | `/admin/attendance` | `attendance/admin/` |
| Employees | `/admin/employees` | `attendance/admin/add-employee.php` |
| Departments & Shifts | `/admin/departments` | `attendance/admin/add-department.php` |

### Employee Attendance Portal Pages
| Page | Route | PHP Equivalent |
|------|-------|----------------|
| Login | `/attendance` | `attendance/index.php` |
| Profile | `/emp` | `attendance/dashboard.php` |
| Mark Attendance | `/emp/attendance` | `attendance/attendance.php` |

---

## API Reference

### Auth
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/admin/login` | `{username, password}` | Admin JWT |
| POST | `/api/auth/employee/login` | `{username, password}` | Employee JWT |
| POST | `/api/auth/admin/seed` | — | Create default admin (dev only) |

### Protected Routes (Bearer token required)
All `/api/clients`, `/api/staffs`, `/api/leads`, `/api/projects`, `/api/invoices`, `/api/employees`, `/api/departments` support:
- `GET /` — list all
- `GET /:id` — single record
- `POST /` — create
- `PUT /:id` — update
- `DELETE /:id` — delete

### Attendance
| Method | Endpoint | Guard | Description |
|--------|----------|-------|-------------|
| GET | `/api/attendance/today` | employee | Today's record for logged-in employee |
| POST | `/api/attendance/checkin` | employee | Mark check-in |
| PUT | `/api/attendance/checkout` | employee | Mark check-out + work report |
| GET | `/api/attendance?month=YYYY-MM` | admin | All records, filterable |
| DELETE | `/api/attendance/:id` | admin | Remove record |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Counts, finance totals, chart data |

---

## MongoDB Schema Summary

| Collection | Key Fields |
|------------|-----------|
| `admins` | username, password (bcrypt) |
| `clients` | fullname, gender, dor, contact_number, whatsapp_number, address, services[], quotation |
| `staffs` | fullname, username, password, email, designation, gender, contact, status |
| `leads` | lead_name, contact_number, lead_source, project_type, lead_status, lead_priority, follow_ups[] |
| `projects` | date, clientName, projectType, 8×task{status,architect}, overallStatus |
| `invoices` | invoiceNumber, type, clientName, lineItems[], subTotal, tax, total, amountPaid, balance, status |
| `employees` | first_name, last_name, username, password, department(ref), shift(ref), designation |
| `departments` | name, description |
| `shifts` | shift, start_time, end_time |
| `attendances` | employee(ref), date(YYYY-MM-DD), check_in, check_out, shift, location, status, work_report |

---

## Tech Stack
- **Frontend**: React 19, Vite 6, Tailwind CSS 3, React Router 7, Recharts, Lucide Icons, Axios, React Hot Toast, date-fns
- **Backend**: Node.js, Express 4, Mongoose 8, bcryptjs, jsonwebtoken, multer
- **Database**: MongoDB
