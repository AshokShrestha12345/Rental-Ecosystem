from django.shortcuts import redirect
from app.models import Room, BookRoom, User


def bookroom(request):
    if request.method == "POST":
        user_id = request.session.get("user_id")
        if not user_id:
            return redirect("login")

        user = User.objects.filter(user_id=user_id).first()
        if not user:
            return redirect("login")

        room_id = request.POST.get("room_id")
        if not room_id:
            return redirect("tenant")

        room = Room.objects.filter(id=room_id).first()
        if not room:
            return redirect("tenant")

        BookRoom.objects.create(
            room_id=room,
            email=user.email,
            preferred_date=request.POST.get("preferred_date"),
            preferred_time=request.POST.get("preferred_time"),
            move_in_date=request.POST.get("move_in_date"),
            occupants=request.POST.get("occupants"),
            lease_duration=request.POST.get("lease_duration"),
            message=request.POST.get("message"),
        )

    return redirect("tenant")
