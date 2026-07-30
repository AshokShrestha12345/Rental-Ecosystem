


from django.shortcuts import redirect
from ..models import Report, Room, User


def report(request):
    if request.method == "POST":
        user_id = request.session.get("user_id")
        if not user_id:
            return redirect("login")

        user = User.objects.filter(user_id=user_id).first()
        if not user:
            return redirect("login")

        room_id = request.POST.get("room_id")
        room = Room.objects.filter(id=room_id).first()
        if not room:
            return redirect("tenant")

        report_category = (request.POST.get("report_category") or "other-issue").strip()
        report_details = (request.POST.get("report_details") or "").strip()

        if report_details:
            Report.objects.create(
                room_id=room,
                report_category=report_category,
                report_details=report_details,
                user=user.email,
            )

    return redirect("tenant")

