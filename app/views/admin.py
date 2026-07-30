from django.shortcuts import render, redirect
from django.contrib import messages

from ..models import User, Room, BookRoom, Report, Review, Notification

def create_admin_user():
    """Create a default admin user if it doesn't exist."""
    if not User.objects.filter(role="admin").exists():
        User.objects.create(
            first_name="admin",
            last_name="user",
            phone="9800000000",
            email="admin@gmail.com",
            password="pbkdf2_sha256$1200000$yqYv5qGNrspeePuTqDn1VF$wycHK/VvzRjH3j8Z0MGAKJb0WG0unkhG0ljX0S0sP3Y=",
            role="admin",
            budget=0,
            property_type="",
            city="",
        )

create_admin_user()  # Ensure admin user exists on server start



def _require_admin(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return None, redirect("login")
    user = User.objects.filter(user_id=user_id).first()
    if not user or user.role != "admin":
        return None, redirect("login")
    return user, None


def admin_panel(request):
    admin_user, redirect_resp = _require_admin(request)
    if redirect_resp:
        return redirect_resp

    users = User.objects.exclude(role="admin").order_by("-created_at")
    rooms = Room.objects.select_related("owner").order_by("-created_at")
    bookings = BookRoom.objects.select_related("room_id", "room_id__owner").order_by("-created_at")
    reports = Report.objects.select_related("room_id", "room_id__owner").order_by("-created_at")
    reviews = Review.objects.select_related("property_id").order_by("-created_at")

    tenant_count = users.filter(role="tenant").count()
    owner_count = users.filter(role="owner").count()
    suspended_count = users.filter(is_active=False).count()

    context = {
        "admin_user": admin_user,
        "users": users,
        "rooms": rooms,
        "bookings": bookings,
        "reports": reports,
        "reviews": reviews,
        "tenant_count": tenant_count,
        "owner_count": owner_count,
        "suspended_count": suspended_count,
        "total_users": tenant_count + owner_count,
        "total_properties": rooms.count(),
        "pending_rooms": rooms.filter(tag="Unverified").count(),
        "pending_bookings": bookings.filter(status="Pending").count(),
        "report_count": reports.count(),
        "active_bookings": bookings.filter(status="Approved").count(),
        "notifications_sent": Notification.objects.filter(from_user=admin_user).order_by("-created_at")[:10],
    }
    return render(request, "pages/admin.html", context)


def admin_toggle_user(request, user_id):
    admin_user, redirect_resp = _require_admin(request)
    if redirect_resp:
        return redirect_resp

    user = User.objects.filter(user_id=user_id).first()
    if not user:
        messages.error(request, "User not found.")
    elif user.role == "admin":
        messages.error(request, "Cannot modify admin accounts.")
    else:
        user.is_active = not user.is_active
        user.save()
        status = "activated" if user.is_active else "suspended"
        messages.success(request, f"User {user.email} has been {status}.")
    return redirect("admin_panel")


def admin_verify_room(request, room_id):
    admin_user, redirect_resp = _require_admin(request)
    if redirect_resp:
        return redirect_resp

    action = request.GET.get("action", "approve")
    room = Room.objects.filter(id=room_id).first()
    if not room:
        messages.error(request, "Property not found.")
        return redirect("admin_panel")

    if action == "approve":
        room.tag = "Verified"
        room.is_verified = True
        room.save(update_fields=["tag", "is_verified"])
        messages.success(request, f'Property "{room.room_name}" approved.')
        if room.owner:
            Notification.objects.create(
                from_user=admin_user,
                to_user=room.owner,
                message=f'Your property "{room.room_name}" has been verified and is now live.',
            )
    elif action == "reject":
        room.tag = "Rejected"
        room.is_verified = False
        room.save(update_fields=["tag", "is_verified"])
        messages.success(request, f'Property "{room.room_name}" rejected.')
        if room.owner:
            Notification.objects.create(
                from_user=admin_user,
                to_user=room.owner,
                message=f'Your property "{room.room_name}" was rejected. Please review and resubmit.',
            )
    return redirect("admin_panel")


def admin_delete_room(request, room_id):
    _, redirect_resp = _require_admin(request)
    if redirect_resp:
        return redirect_resp

    room = Room.objects.filter(id=room_id).first()
    if room:
        name = room.room_name
        room.delete()
        messages.success(request, f'Property "{name}" removed.')
    else:
        messages.error(request, "Property not found.")
    return redirect("admin_panel")


def admin_dismiss_report(request, report_id):
    _, redirect_resp = _require_admin(request)
    if redirect_resp:
        return redirect_resp

    report = Report.objects.filter(id=report_id).first()
    if report:
        report.delete()
        messages.success(request, "Report dismissed.")
    else:
        messages.error(request, "Report not found.")
    return redirect("admin_panel")


def admin_delete_review(request, review_id):
    _, redirect_resp = _require_admin(request)
    if redirect_resp:
        return redirect_resp

    review = Review.objects.filter(id=review_id).first()
    if review:
        review.delete()
        messages.success(request, "Review removed.")
    else:
        messages.error(request, "Review not found.")
    return redirect("admin_panel")


def admin_update_booking(request, booking_id, status):
    admin_user, redirect_resp = _require_admin(request)
    if redirect_resp:
        return redirect_resp

    if status not in ("Approved", "Rejected"):
        messages.error(request, "Invalid booking status.")
        return redirect("admin_panel")

    booking = BookRoom.objects.filter(id=booking_id).select_related("room_id").first()
    if not booking:
        messages.error(request, "Booking not found.")
        return redirect("admin_panel")

    if status == "Approved":
        booking.is_verified_by_admin = True
        booking.status = "Pending"  # Requires Owner approval next
    elif status == "Rejected":
        booking.is_verified_by_admin = False
        booking.status = "Rejected"
    booking.save()

    room = booking.room_id
    tenant_user = User.objects.filter(email=booking.email).first()
    if tenant_user:
        Notification.objects.create(
            from_user=admin_user,
            to_user=tenant_user,
            message=f"Your booking for '{room.room_name}' has been {status.lower()} by admin.",
        )

    messages.success(request, f"Booking updated to {status}.")
    return redirect("admin_panel")


def admin_send_notification(request):
    admin_user, redirect_resp = _require_admin(request)
    if redirect_resp:
        return redirect_resp

    if request.method != "POST":
        return redirect("admin_panel")

    message = request.POST.get("message", "").strip()
    audience = request.POST.get("audience", "all")

    if not message:
        messages.error(request, "Message is required.")
        return redirect("admin_panel")

    recipients = User.objects.exclude(role="admin")
    if audience == "tenants":
        recipients = recipients.filter(role="tenant")
    elif audience == "owners":
        recipients = recipients.filter(role="owner")

    count = 0
    for user in recipients:
        Notification.objects.create(from_user=admin_user, to_user=user, message=message)
        count += 1

    messages.success(request, f"Notification sent to {count} user(s).")
    return redirect("admin_panel")
