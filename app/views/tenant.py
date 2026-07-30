
from django.shortcuts import render, redirect
from django.http import JsonResponse
from ..models import Room, User, Review, BookRoom, Notification

def tenant(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('login')
    
    user_info = User.objects.filter(user_id=user_id).first()
    rooms = Room.objects.filter(is_verified=True)
    liked_rooms = []
    if user_info:
        liked_rooms = user_info.liked_rooms.all()
        liked_room_ids = set(liked_rooms.values_list('id', flat=True))
        for room in rooms:
            room.liked = room.id in liked_room_ids
    reviews = Review.objects.all().order_by('-created_at')
    bookings = BookRoom.objects.filter(email=user_info.email).order_by('-created_at') if user_info else []
    notifications = Notification.objects.filter(to_user=user_info).order_by('-created_at') if user_info else []
    unread_count = notifications.filter(is_read=False).count() if user_info else 0
    
    return render(request, "pages/tenant.html", {
        'rooms': rooms,
        'liked_rooms': liked_rooms,
        'user_info': user_info,
        'reviews': reviews,
        'bookings': bookings,
        'notifications': notifications,
        'unread_count': unread_count,
    })

def toggle_like(request, room_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    try:
        room = Room.objects.get(id=room_id)
    except Room.DoesNotExist:
        return JsonResponse({'error': 'Room not found'}, status=404)

    user = User.objects.filter(user_id=user_id).first()
    if not user:
        return JsonResponse({'error': 'User not found'}, status=404)

    if room.liked_by.filter(user_id=user.user_id).exists():
        room.liked_by.remove(user)
        liked = False
    else:
        room.liked_by.add(user)
        liked = True

    return JsonResponse({'success': True, 'liked': liked})