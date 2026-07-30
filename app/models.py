
from django.db import models
from django.utils import timezone

class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=500, default='Unknown')
    last_name = models.CharField(max_length=500, default='Unknown')
    phone = models.CharField(max_length=15, default='')
    email = models.EmailField(max_length=254, default='noemail@example.com', unique=True)
    password = models.CharField(max_length=100, default='')
    role = models.CharField(max_length=100, default='tenant')
    city = models.CharField(max_length=100, default='')
    budget = models.IntegerField(default=0)
    property_type = models.CharField(max_length=100, default='single-room')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Remove default=timezone.now
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email


class Room(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    tag = models.CharField(max_length=500, default='Unverified')
    # Per‑user likes – use ManyToMany instead of a single Boolean flag
    liked_by = models.ManyToManyField(User, related_name='liked_rooms', blank=True)
    image = models.ImageField(upload_to='images/')
    room_name = models.CharField(max_length=250)
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=200, null=True, blank=True)
    price = models.IntegerField(default=0)
    rating = models.FloatField(default=0)
    beds = models.IntegerField(default=1, null=True, blank=True)
    bath = models.IntegerField(default=1)
    sqft = models.IntegerField(default=0)
    description = models.TextField(default='', null=True, blank=True)
    is_occupied = models.BooleanField(default=False)
    # Verification flag – only rooms with is_verified=True are shown to tenants
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.room_name} - {self.address}'


class Review(models.Model):
    property_id = models.ForeignKey(Room, on_delete=models.CASCADE)
    rating = models.IntegerField(default=0)
    title = models.CharField(max_length=200)
    review = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.property_id} - {self.rating}'


class BookRoom(models.Model):
    room_id = models.ForeignKey(Room, on_delete=models.CASCADE)

    email = models.EmailField(max_length=254)

    preferred_date = models.DateField()
    preferred_time = models.CharField(max_length=100, default='12:00 PM')

    move_in_date = models.DateField()
    occupants = models.CharField(max_length=200)
    lease_duration = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=100, default='Pending')
    is_verified_by_owner = models.BooleanField(default=False)
    is_verified_by_admin = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.room_id.room_name} - {self.email}"

class Report(models.Model):
    room_id = models.ForeignKey(Room, on_delete=models.CASCADE)
    report_category = models.CharField(max_length=200)
    report_details = models.TextField()
    user = models.EmailField(max_length=254)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.room_id} - {self.report_category}'


class Notification(models.Model):
    from_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_notifications"
    )
    
    to_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_notifications"
    )
    message = models.TextField(default='')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'{self.from_user} - {self.to_user} - {self.message}'

