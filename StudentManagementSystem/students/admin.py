from django.contrib import admin
from .models import Student, Department, Course, Enrollment

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'created_at']
    search_fields = ['name', 'code']

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'first_name', 'last_name', 'email', 'department', 'status', 'gpa']
    list_filter = ['status', 'gender', 'department']
    search_fields = ['student_id', 'first_name', 'last_name', 'email']

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'department', 'credits']
    list_filter = ['department']
    search_fields = ['code', 'name']

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'semester', 'grade', 'enrolled_date']
    list_filter = ['grade', 'semester']
