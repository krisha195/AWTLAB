from django import forms
from .models import Student, Course, Department, Enrollment

class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ['student_id', 'first_name', 'last_name', 'email', 'phone',
                  'gender', 'date_of_birth', 'department', 'status', 'gpa', 'address']
        widgets = {
            'date_of_birth': forms.DateInput(attrs={'type': 'date'}),
            'address': forms.Textarea(attrs={'rows': 3}),
        }

class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ['name', 'code', 'department', 'credits', 'description']
        widgets = {'description': forms.Textarea(attrs={'rows': 3})}

class DepartmentForm(forms.ModelForm):
    class Meta:
        model = Department
        fields = ['name', 'code']

class EnrollmentForm(forms.ModelForm):
    class Meta:
        model = Enrollment
        fields = ['student', 'course', 'grade', 'semester']
