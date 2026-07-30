
from django.contrib import admin
from .models import User, Room, Review, BookRoom, Report, Notification

admin.site.register(User)
admin.site.register(Room)
admin.site.register(Review)
admin.site.register(BookRoom)
admin.site.register(Report)
admin.site.register(Notification)