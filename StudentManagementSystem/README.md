# EduTrack — Student Management System

A full-featured Student Management System built with Django.

## Features
- 📊 Dashboard with stats & charts
- 🎓 Student CRUD (create, view, edit, delete)
- 🏛️ Department management
- 📚 Course management
- 📋 Enrollment tracking with grades
- 🔍 Search & filter students
- ⚙️ Django Admin panel

## Quick Start

```bash
# Install dependencies
pip install django

# Apply migrations
python manage.py migrate

# (Optional) Load sample data — already included in db.sqlite3
# Create admin user
python manage.py createsuperuser

# Run the server
python manage.py runserver
```

Then open: http://127.0.0.1:8000/

Admin panel: http://127.0.0.1:8000/admin/
- Username: admin
- Password: admin123

## Project Structure
```
sms/
├── sms/               # Project config (settings, urls)
├── students/          # Main app
│   ├── models.py      # Student, Department, Course, Enrollment
│   ├── views.py       # All CRUD views
│   ├── forms.py       # Django forms
│   ├── urls.py        # URL routing
│   └── admin.py       # Admin registration
├── templates/students/ # HTML templates (dark theme UI)
└── db.sqlite3         # Database with sample data
```
