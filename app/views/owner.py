from django.shortcuts import render, redirect
from django.contrib import messages
from ..models import User, Room, BookRoom, Review, Notification

def owner(request):
    """Render the owner dashboard page."""
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('login')
        
    user_info = User.objects.filter(user_id=user_id).first()
    if not user_info:
        return redirect('login')

    rooms = Room.objects.filter(owner=user_info)
    total_properties = rooms.count()
    active_listings = rooms.filter(is_occupied=False).count()
    booked_properties = rooms.filter(is_occupied=True).count()

    # Get booking requests for the owner's rooms
    bookings = BookRoom.objects.filter(room_id__in=rooms).order_by('-created_at')
    pending_bookings_count = bookings.filter(status='Pending').count()

    # Get reviews for the owner's rooms
    reviews = Review.objects.filter(property_id__in=rooms).order_by('-created_at')
    review_count = reviews.count()
    
    # Calculate average rating
    avg_rating = 0.0
    if review_count > 0:
        avg_rating = sum(r.rating for r in reviews) / review_count
        avg_rating = round(avg_rating, 1)

    # Get notifications
    notifications = Notification.objects.filter(to_user=user_info).order_by('-created_at')
    unread_notifications_count = notifications.filter(is_read=False).count()

    context = {
        'user_info': user_info,
        'rooms': rooms,
        'total_properties': total_properties,
        'active_listings': active_listings,
        'booked_properties': booked_properties,
        'bookings': bookings,
        'pending_bookings_count': pending_bookings_count,
        'reviews': reviews,
        'review_count': review_count,
        'avg_rating': avg_rating,
        'notifications': notifications,
        'unread_notifications_count': unread_notifications_count,
    }
    return render(request, "pages/owner.html", context)

def create_room(request):
    """Handle room creation form submission.
    Validates logged‑in user, retrieves the corresponding User object,
    saves the Room with the uploaded image, and redirects back to the owner page.
    """

    if request.method == "POST":
        # Extract form data
        room_name = request.POST.get('room_name')
        facilities = request.POST.get('additional_facilities')
        address = request.POST.get('address')
        city = request.POST.get('city')
        price = request.POST.get('price')
        size = request.POST.get('size')
        bedrooms = request.POST.get('bedrooms')
        bathrooms = request.POST.get('bathrooms')
        image = request.FILES.get('image')
        description = request.POST.get('description')

        # Check if user is logged in via session
        user_id = request.session.get('user_id')
        if not user_id:
            messages.error(request, "You must be logged in to create a room.")
            return redirect('login')

        # Retrieve the User instance for the owner
        try:
            owner_user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            messages.error(request, "Owner account not found.")
            return redirect('login')

        # Create and persist the Room instance
        room = Room(
            room_name=room_name,
            address=address,
            city=city,
            price=int(price) if price else 0,
            sqft=int(size) if size else 0,
            beds=int(bedrooms) if bedrooms else 1,
            bath=int(bathrooms) if bathrooms else 1,
            image=image,
            description=description,
            tag='Unverified',
            owner=owner_user,
        )
        room.save()
        messages.success(request, "Room created successfully!")
        return redirect('owner')
    # For non‑POST requests, simply render the owner page
    return render(request, "pages/owner.html")

def update_booking_status(request, booking_id, status):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('login')

    # Only allow valid status values
    if status not in ('Approved', 'Rejected'):
        messages.error(request, "Invalid booking status.")
        return redirect('owner')
        
    try:
        booking = BookRoom.objects.get(id=booking_id)
        if booking.room_id.owner.user_id == int(user_id):
            old_status = booking.status
            booking.status = status
            if status == 'Approved':
                booking.is_verified_by_owner = True
            elif status == 'Rejected':
                booking.is_verified_by_owner = False
            booking.save()
            
            room = booking.room_id
            # Auto-occupy the room if approved by owner
            if status == 'Approved':
                room.is_occupied = True
                room.save()
            # Free room if previously approved booking is now rejected
            elif status == 'Rejected' and old_status == 'Approved':
                room.is_occupied = False
                room.save()
            
            # Send notification to tenant
            tenant_user = User.objects.filter(email=booking.email).first()
            owner_user = User.objects.filter(user_id=user_id).first()
            if tenant_user and owner_user:
                Notification.objects.create(
                    from_user=owner_user,
                    to_user=tenant_user,
                    message=f"Your booking request for '{booking.room_id.room_name}' has been {status.lower()} by the owner."
                )
            messages.success(request, f"Booking status updated to {status}.")
    except BookRoom.DoesNotExist:
        messages.error(request, "Booking request not found.")
    return redirect('owner')

  