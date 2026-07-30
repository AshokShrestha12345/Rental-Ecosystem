# 🏠 Rental Management System

A Django-based rental platform for tenants, property owners, and administrators.

This project includes:

- Custom user roles for tenants, owners, and admins
- Property listings with image uploads and verification
- Tenant booking requests with owner/admin approval flows
- Property reviews and room reports
- Notifications for owners, tenants, and admin
- Admin moderation for users, listings, bookings, reviews, and reports

---

```


```
# admin pannel
admin name : admin
admin password : gaurab123

# web admin
admin email : gaurabaryal94@gmail.com
admin password : gaurab@123

admin email : admin@gmail.com
admin password : admin@123

# tenant 
tenant email : tenant@gmail.com
password : tenant@123

aayushtenant@gmail.com
aayush@123

# owner
owner email : owner@gmail.com
password : owner@123




---

## 🚀 Local Setup

### 1. Create a virtual environment

Open a terminal in the project root and run:

```powershell
python -m venv venv
venv\Scripts\activate
```

### 2. Install dependencies

Install required packages:

```powershell
pip install -r requirements.txt
```

If `requirements.txt` is empty, install Django directly:

```powershell
pip install django
```

### 3. Apply migrations

Set up the database schema:

```powershell
python manage.py makemigrations
python manage.py migrate
```

### 4. Run the development server

Start the app locally:

```powershell
python manage.py runserver
```

Then open `http://127.0.0.1:8000/`.

---

## 🔧 Project Overview

### Authentication and Users

- Signup and login for tenants, owners, and admin
- Password hashing with Django utilities
- Session-based login
- Forgot password flow with email and phone verification

### Core Models

- `User`: stores users, roles, contact info, and profile fields
- `Room`: property listings, owner relationships, verification, occupancy, likes, ratings
- `Review`: property reviews and ratings
- `BookRoom`: tenant booking requests and preferred visit details
- `Report`: property issue reports submitted by tenants
- `Notification`: messages sent between users

### Major Pages

- Home page at `/`
- Login at `/login/`
- Signup at `/sign/`
- Tenant dashboard at `/tenant/`
- Owner dashboard at `/owner/`
- Admin app panel at `/admin_panel/`
- Django admin at `/admin/`

---

## 👤 Role Features

### Tenant

- Browse verified room listings
- Like/unlike properties
- Submit booking requests
- Add reviews for rooms
- Report properties
- View notifications

### Owner

- View own room listings and booking requests
- Create new room entries with images and details
- Approve or reject tenant bookings
- Receive notifications from admin and tenants

### Admin

- View users, rooms, bookings, reviews, and reports
- Suspend or activate tenant/owner accounts
- Verify or reject property listings
- Approve or reject bookings
- Delete reviews, rooms, and dismiss reports
- Send notifications to users

---

## 🗂️ Folder Structure

```text
rental system/
├── app/
│   ├── admin.py
│   ├── apps.py
│   ├── migrations/
│   ├── models.py
│   ├── tests.py
│   ├── urls.py
│   ├── views/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── auth.py
│   │   ├── bookroom.py
│   │   ├── info_change.py
│   │   ├── logout.py
│   │   ├── main.py
│   │   ├── notification.py
│   │   ├── owner.py
│   │   ├── report.py
│   │   ├── review.py
│   │   └── tenant.py
│   ├── static/
│   └── templates/
├── core/
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── build.sh
├── db.sqlite3
├── manage.py
├── media/
├── staticfiles/
├── LICENSE
├── README.md
└── requirements.txt
```

---

## ⚠️ Notes

- Media uploads are served from `media/` and configured in `core/settings.py`
- Static files load from `app/static`
- The project seeds a default admin user if none exists
- `/admin_panel/` is the custom application admin dashboard, while `/admin/` is Django's built-in admin

---

## 📝 Helpful Commands

```powershell
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
