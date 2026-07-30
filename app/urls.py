from django.urls import path
from .views import auth, tenant, owner, admin, main, info_change, review, report, bookroom, notification

urlpatterns = [
    path("", main.index, name="home"),
    path("login/", auth.login, name="login"),
    path("forgot-password/", auth.forgot_password, name="forgot_password"),
    path("sign/", auth.signup, name="sign"),
    path("tenant/", tenant.tenant, name="tenant"),
    path("tenant/review/", review.review, name="review"),
    path("tenant/delete_review/<int:id>/", review.delete_review, name="delete_review"),
    path("tenant/book_property/", bookroom.bookroom, name="book_property"),
    path("tenant/report/", report.report, name="report"),
    path("tenant/notification/", notification.notification, name="notification"),
    path("tenant/toggle_like/<int:room_id>/", tenant.toggle_like, name="toggle_like"),
    path("owner/", owner.owner, name="owner"),
    path("owner/booking/<int:booking_id>/<str:status>/", owner.update_booking_status, name="update_booking_status"),
    path("create_property/", owner.create_room, name="create_property"),
    path("profile/", info_change.profile, name="profile"),
    path("admin_panel/", admin.admin_panel, name="admin_panel"),
    path("admin_panel/user/<int:user_id>/toggle/", admin.admin_toggle_user, name="admin_toggle_user"),
    path("admin_panel/room/<int:room_id>/verify/", admin.admin_verify_room, name="admin_verify_room"),
    path("admin_panel/room/<int:room_id>/delete/", admin.admin_delete_room, name="admin_delete_room"),
    path("admin_panel/report/<int:report_id>/dismiss/", admin.admin_dismiss_report, name="admin_dismiss_report"),
    path("admin_panel/review/<int:review_id>/delete/", admin.admin_delete_review, name="admin_delete_review"),
    path("admin_panel/booking/<int:booking_id>/<str:status>/", admin.admin_update_booking, name="admin_update_booking"),
    path("admin_panel/send_notification/", admin.admin_send_notification, name="admin_send_notification"),
]
