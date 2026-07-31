from django.shortcuts import redirect

from ..models import User, Notification


def notification(request):
    """Mark all notifications as read for the logged-in user."""
    user_id = request.session.get("user_id")
    if not user_id:
        return redirect("login")

    user = User.objects.filter(user_id=user_id).first()
    if not user:
        return redirect("login")

    if request.method == "POST":
        Notification.objects.filter(to_user=user, is_read=False).update(is_read=True)

    if user.role == "owner":
        return redirect("owner")
    return redirect("tenant")
