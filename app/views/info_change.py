from django.shortcuts import render, redirect
from ..models import User

from django.contrib import messages

def profile(request):

    user = User.objects.filter(user_id=request.session.get('user_id')).first()

    if not user:
        return redirect('login')

    if request.method == "POST":
        print(f"--- PROFILE UPDATE POST DATA ---")
        print(f"first_name: {request.POST.get('first_name')}")
        print(f"password: {request.POST.get('password')}")
        print(f"confirm_password: {request.POST.get('confirm_password')}")

        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        phone = request.POST.get('phone')
        city = request.POST.get('city')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        email = request.POST.get('email')

        if first_name:
            user.first_name = first_name

        if last_name:
            user.last_name = last_name

        if phone:
            user.phone = phone

        if city:
            user.city = city

        if email:
            user.email = email

        if password and confirm_password:
            if password == confirm_password:
                user.password = password
                messages.success(request, "Password updated successfully!")
                print("PASSWORD UPDATED!")
            else:
                messages.error(request, "Passwords do not match!")
                print("PASSWORDS DID NOT MATCH")
        else:
            messages.success(request, "Profile updated successfully!")
            print("PROFILE INFO UPDATED")

        user.save()

    if user.role == "owner":
        return redirect('owner')
    else:
        return redirect('tenant')