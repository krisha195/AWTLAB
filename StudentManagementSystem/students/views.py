from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.db.models import Q, Count, Avg
from .models import Student, Course, Department, Enrollment
from .forms import StudentForm, CourseForm, DepartmentForm, EnrollmentForm

def dashboard(request):
    total_students = Student.objects.count()
    active_students = Student.objects.filter(status='active').count()
    total_courses = Course.objects.count()
    total_departments = Department.objects.count()
    recent_students = Student.objects.order_by('-created_at')[:5]
    dept_stats = Department.objects.annotate(student_count=Count('students')).order_by('-student_count')[:5]
    status_counts = {
        'active': Student.objects.filter(status='active').count(),
        'inactive': Student.objects.filter(status='inactive').count(),
        'graduated': Student.objects.filter(status='graduated').count(),
        'suspended': Student.objects.filter(status='suspended').count(),
    }
    context = {
        'total_students': total_students,
        'active_students': active_students,
        'total_courses': total_courses,
        'total_departments': total_departments,
        'recent_students': recent_students,
        'dept_stats': dept_stats,
        'status_counts': status_counts,
    }
    return render(request, 'students/dashboard.html', context)

# --- Students ---
def student_list(request):
    q = request.GET.get('q', '')
    dept = request.GET.get('department', '')
    status = request.GET.get('status', '')
    students = Student.objects.select_related('department')
    if q:
        students = students.filter(Q(first_name__icontains=q) | Q(last_name__icontains=q) | Q(student_id__icontains=q) | Q(email__icontains=q))
    if dept:
        students = students.filter(department__id=dept)
    if status:
        students = students.filter(status=status)
    departments = Department.objects.all()
    return render(request, 'students/student_list.html', {'students': students, 'departments': departments, 'q': q, 'selected_dept': dept, 'selected_status': status})

def student_detail(request, pk):
    student = get_object_or_404(Student, pk=pk)
    enrollments = student.enrollments.select_related('course').all()
    return render(request, 'students/student_detail.html', {'student': student, 'enrollments': enrollments})

def student_create(request):
    if request.method == 'POST':
        form = StudentForm(request.POST)
        if form.is_valid():
            student = form.save()
            messages.success(request, f'Student {student.full_name} created successfully!')
            return redirect('student_detail', pk=student.pk)
    else:
        form = StudentForm()
    return render(request, 'students/student_form.html', {'form': form, 'title': 'Add Student'})

def student_edit(request, pk):
    student = get_object_or_404(Student, pk=pk)
    if request.method == 'POST':
        form = StudentForm(request.POST, instance=student)
        if form.is_valid():
            form.save()
            messages.success(request, 'Student updated successfully!')
            return redirect('student_detail', pk=pk)
    else:
        form = StudentForm(instance=student)
    return render(request, 'students/student_form.html', {'form': form, 'title': 'Edit Student', 'student': student})

def student_delete(request, pk):
    student = get_object_or_404(Student, pk=pk)
    if request.method == 'POST':
        name = student.full_name
        student.delete()
        messages.success(request, f'Student {name} deleted.')
        return redirect('student_list')
    return render(request, 'students/confirm_delete.html', {'object': student, 'type': 'Student'})

# --- Departments ---
def department_list(request):
    departments = Department.objects.annotate(student_count=Count('students'), course_count=Count('courses'))
    return render(request, 'students/department_list.html', {'departments': departments})

def department_create(request):
    if request.method == 'POST':
        form = DepartmentForm(request.POST)
        if form.is_valid():
            dept = form.save()
            messages.success(request, f'Department {dept.name} created!')
            return redirect('department_list')
    else:
        form = DepartmentForm()
    return render(request, 'students/department_form.html', {'form': form, 'title': 'Add Department'})

def department_edit(request, pk):
    dept = get_object_or_404(Department, pk=pk)
    if request.method == 'POST':
        form = DepartmentForm(request.POST, instance=dept)
        if form.is_valid():
            form.save()
            messages.success(request, 'Department updated!')
            return redirect('department_list')
    else:
        form = DepartmentForm(instance=dept)
    return render(request, 'students/department_form.html', {'form': form, 'title': 'Edit Department'})

def department_delete(request, pk):
    dept = get_object_or_404(Department, pk=pk)
    if request.method == 'POST':
        dept.delete()
        messages.success(request, 'Department deleted.')
        return redirect('department_list')
    return render(request, 'students/confirm_delete.html', {'object': dept, 'type': 'Department'})

# --- Courses ---
def course_list(request):
    courses = Course.objects.select_related('department').annotate(enrollment_count=Count('enrollments'))
    return render(request, 'students/course_list.html', {'courses': courses})

def course_create(request):
    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            course = form.save()
            messages.success(request, f'Course {course.name} created!')
            return redirect('course_list')
    else:
        form = CourseForm()
    return render(request, 'students/course_form.html', {'form': form, 'title': 'Add Course'})

def course_edit(request, pk):
    course = get_object_or_404(Course, pk=pk)
    if request.method == 'POST':
        form = CourseForm(request.POST, instance=course)
        if form.is_valid():
            form.save()
            messages.success(request, 'Course updated!')
            return redirect('course_list')
    else:
        form = CourseForm(instance=course)
    return render(request, 'students/course_form.html', {'form': form, 'title': 'Edit Course'})

def course_delete(request, pk):
    course = get_object_or_404(Course, pk=pk)
    if request.method == 'POST':
        course.delete()
        messages.success(request, 'Course deleted.')
        return redirect('course_list')
    return render(request, 'students/confirm_delete.html', {'object': course, 'type': 'Course'})

# --- Enrollments ---
def enrollment_list(request):
    enrollments = Enrollment.objects.select_related('student', 'course')
    return render(request, 'students/enrollment_list.html', {'enrollments': enrollments})

def enrollment_create(request):
    if request.method == 'POST':
        form = EnrollmentForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Enrollment added!')
            return redirect('enrollment_list')
    else:
        form = EnrollmentForm()
    return render(request, 'students/enrollment_form.html', {'form': form, 'title': 'Add Enrollment'})

def enrollment_delete(request, pk):
    enrollment = get_object_or_404(Enrollment, pk=pk)
    if request.method == 'POST':
        enrollment.delete()
        messages.success(request, 'Enrollment removed.')
        return redirect('enrollment_list')
    return render(request, 'students/confirm_delete.html', {'object': enrollment, 'type': 'Enrollment'})
