from django.shortcuts import render, redirect
from ..models import User
from django.contrib import messages
from django.contrib.auth.hashers import make_password, check_password
import re

def _validate_password(pw):
    """Return True if password meets policy: >=6 chars, at least one letter, one digit, one special."""
    if len(pw) < 6:
        return False
    if not re.search(r'[A-Za-z]', pw):
        return False
    if not re.search(r'\d', pw):
        return False
    if not re.search(r'[^A-Za-z0-9]', pw):
        return False
    return True

def signup(request):
    if request.method == 'POST':
        # gather fields
        first_name = request.POST.get('first_name', '').strip()
        last_name = request.POST.get('last_name', '').strip()
        phone = request.POST.get('phone', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '')
        password2 = request.POST.get('password2', request.POST.get('confirm_password', ''))
        role = request.POST.get('role') or 'tenant'
        budget = request.POST.get('budget') or 0
        property_type = request.POST.get('property_type') or 'single-room'
        city = request.POST.get('city', '').strip()

        errors = []
        if not all([first_name, last_name, email, password, password2]):
            errors.append('All fields are required.')
        if password != password2:
            errors.append('Passwords do not match.')
        if not _validate_password(password):
            errors.append('Password must be at least 6 characters and include letters, numbers and special characters.')
        if User.objects.filter(email=email).exists():
            errors.append('A user with this email already exists.')

        if errors:
            return render(request, 'pages/sign.html', {'errors': errors})

        user = User(
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            email=email,
            password=make_password(password),
            role=role,
            budget=int(budget),
            property_type=property_type,
            city=city,
        )
        user.save()
        # auto login
        request.session['user_id'] = user.user_id
        request.session['user_role'] = user.role
        # redirect based on role
        if user.role == 'owner':
            return redirect('owner')
        elif user.role == 'tenant':
            return redirect('tenant')
        else:
            return redirect('admin_panel')
    return render(request, 'pages/sign.html')

def login(request):
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '').strip()

        if not email or not password:
            return render(request, 'pages/login.html', {'error': 'Please provide both email and password.'})

        user = User.objects.filter(email=email).first()
        if not user:
            return render(request, 'pages/login.html', {'error': 'User not found.'})
        if not user.is_active:
            return render(request, 'pages/login.html', {'error': 'Account suspended. Contact admin.'})
        if not check_password(password, user.password):
            return render(request, 'pages/login.html', {'error': 'Invalid credentials.'})

        request.session['user_id'] = user.user_id
        request.session['user_role'] = user.role
        
        if user.role == 'owner':
            return redirect('owner')
        elif user.role == 'tenant':
            return redirect('tenant')
        elif user.role == 'admin':
            return redirect('admin_panel')
        else:
            return redirect('home')
    return render(request, 'pages/login.html')


def forgot_password(request):
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        phone = request.POST.get('phone', '').strip()
        new_password = request.POST.get('new_password', '')
        confirm_password = request.POST.get('confirm_password', '')

        if not email:
            return render(request, 'pages/forgot_password.html', {'error': 'Please enter your email address.'})

        user = User.objects.filter(email=email).first()
        if not user:
            return render(request, 'pages/forgot_password.html', {'error': 'No account found with that email address.'})

        if not phone or not new_password or not confirm_password:
            return render(request, 'pages/forgot_password.html', {'error': 'Please provide your phone number and a new password.'})

        if phone != user.phone:
            return render(request, 'pages/forgot_password.html', {'error': 'The phone number does not match our records for this account.'})

        if new_password != confirm_password:
            return render(request, 'pages/forgot_password.html', {'error': 'Passwords do not match.'})

        if not _validate_password(new_password):
            return render(request, 'pages/forgot_password.html', {'error': 'Password must be at least 6 characters and include letters, numbers and special characters.'})

        user.password = make_password(new_password)
        user.save(update_fields=['password'])
        messages.success(request, 'Your password has been updated successfully. You can now log in with your new password.')
        return redirect('login')

    return render(request, 'pages/forgot_password.html')