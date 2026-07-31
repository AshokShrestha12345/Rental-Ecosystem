# pyrefly: ignore [missing-import]
from django.test import Client, TestCase
from django.urls import reverse

from .models import User, Room, Report, BookRoom, Notification


class AuthFlowTests(TestCase):
    def test_report_submission_is_saved_and_visible_to_admin(self):
        tenant = User.objects.create(
            first_name='Tenant',
            last_name='User',
            email='tenant@test.com',
            password='hashed',
            role='tenant',
        )
        owner = User.objects.create(
            first_name='Owner',
            last_name='User',
            email='owner@test.com',
            password='hashed',
            role='owner',
        )
        room = Room.objects.create(
            owner=owner,
            image='images/default.jpg',
            room_name='Test Room',
            address='Test Street',
            city='Kathmandu',
            price=10000,
            description='Test',
            tag='Verified',
            is_verified=True,
        )

        session = self.client.session
        session['user_id'] = str(tenant.user_id)
        session['user_role'] = tenant.role
        session.save()

        response = self.client.post(
            reverse('report'),
            {
                'room_id': room.id,
                'report_category': 'fake-scam',
                'report_details': 'The listing is misleading',
            },
        )

        self.assertEqual(response.status_code, 302)
        self.assertTrue(Report.objects.filter(room_id=room).exists())

        admin = User.objects.create(
            first_name='Admin',
            last_name='User',
            email='admin@test.com',
            password='hashed',
            role='admin',
        )
        admin_session = self.client.session
        admin_session['user_id'] = str(admin.user_id)
        admin_session['user_role'] = admin.role
        admin_session.save()

        admin_response = self.client.get(reverse('admin_panel'))
        self.assertContains(admin_response, 'The listing is misleading')

    def test_signup_and_login_work_with_confirm_password_field(self):
        response = self.client.post(
            reverse('sign'),
            {
                'first_name': 'Test',
                'last_name': 'User',
                'phone': '9876543210',
                'email': 'test@example.com',
                'password': 'Abc123!',
                'confirm_password': 'Abc123!',
                'role': 'tenant',
                'budget': '10000',
                'property_type': 'Room / Single Bed',
                'city': 'Kathmandu',
            },
        )

        self.assertEqual(response.status_code, 302, response.content.decode())
        user = User.objects.get(email='test@example.com')
        self.assertTrue(user.password.startswith('pbkdf2_sha256$'))
        self.assertEqual(self.client.session['user_role'], 'tenant')

        second_client = Client()
        login_response = second_client.post(
            reverse('login'),
            {'email': 'test@example.com', 'password': 'Abc123!'},
        )

        self.assertEqual(login_response.status_code, 302, login_response.content.decode())
        self.assertEqual(second_client.session['user_role'], 'tenant')

    def test_login_error_message_is_rendered(self):
        response = self.client.post(
            reverse('login'),
            {'email': 'missing@example.com', 'password': 'wrong-pass'},
        )

        self.assertContains(response, 'User not found.')

    def test_signup_error_message_is_rendered_for_duplicate_email(self):
        User.objects.create(
            first_name='Existing',
            last_name='User',
            email='existing@example.com',
            password='hashed',
            role='tenant',
        )

        response = self.client.post(
            reverse('sign'),
            {
                'first_name': 'New',
                'last_name': 'User',
                'phone': '9876543210',
                'email': 'existing@example.com',
                'password': 'Abc123!',
                'password2': 'Abc123!',
                'role': 'tenant',
                'budget': '10000',
                'property_type': 'Room / Single Bed',
                'city': 'Kathmandu',
            },
        )

        self.assertContains(response, 'A user with this email already exists.')

    def test_toggle_like_toggles_room_in_wishlist(self):
        tenant = User.objects.create(
            first_name='Tenant',
            last_name='User',
            email='toggle@test.com',
            password='hashed',
            role='tenant',
        )
        owner = User.objects.create(
            first_name='Owner',
            last_name='User',
            email='owner2@test.com',
            password='hashed',
            role='owner',
        )
        room = Room.objects.create(
            owner=owner,
            image='images/default.jpg',
            room_name='Favorite Room',
            address='Test Street',
            city='Kathmandu',
            price=10000,
            description='Test',
            tag='Verified',
            is_verified=True,
        )

        session = self.client.session
        session['user_id'] = str(tenant.user_id)
        session['user_role'] = tenant.role
        session.save()

        first_response = self.client.get(reverse('toggle_like', args=[room.id]))
        self.assertEqual(first_response.status_code, 200)
        self.assertTrue(room.liked_by.filter(user_id=tenant.user_id).exists())

        second_response = self.client.get(reverse('toggle_like', args=[room.id]))
        self.assertEqual(second_response.status_code, 200)
        self.assertFalse(room.liked_by.filter(user_id=tenant.user_id).exists())

    def test_admin_panel_shows_owner_approval_message_after_admin_approval(self):
        admin_user = User.objects.create(
            first_name='Admin',
            last_name='User',
            email='admin-booking@test.com',
            password='hashed',
            role='admin',
        )
        owner = User.objects.create(
            first_name='Owner',
            last_name='User',
            email='owner-booking@test.com',
            password='hashed',
            role='owner',
        )
        tenant = User.objects.create(
            first_name='Tenant',
            last_name='User',
            email='tenant-booking@test.com',
            password='hashed',
            role='tenant',
        )
        room = Room.objects.create(
            owner=owner,
            image='images/default.jpg',
            room_name='Booked Room',
            address='Test Street',
            city='Kathmandu',
            price=10000,
            description='Test',
            tag='Verified',
            is_verified=True,
        )
        booking = BookRoom.objects.create(
            room_id=room,
            email=tenant.email,
            preferred_date='2025-01-01',
            preferred_time='12:00 PM',
            move_in_date='2025-01-02',
            occupants='2',
            lease_duration='1 month',
            message='Need a place',
            status='Pending',
            is_verified_by_admin=False,
            is_verified_by_owner=False,
        )

        admin_session = self.client.session
        admin_session['user_id'] = str(admin_user.user_id)
        admin_session['user_role'] = admin_user.role
        admin_session.save()

        self.client.get(reverse('admin_update_booking', args=[booking.id, 'Approved']))
        booking.refresh_from_db()

        self.assertTrue(booking.is_verified_by_admin)
        self.assertEqual(booking.status, 'Pending')

        response = self.client.get(reverse('admin_panel'))
        self.assertContains(response, 'Owner approval left')

    def test_owner_notifications_mark_all_read_and_redirect_back_to_owner(self):
        owner = User.objects.create(
            first_name='Owner',
            last_name='User',
            email='owner-notify@test.com',
            password='hashed',
            role='owner',
        )
        Notification.objects.create(
            from_user=owner,
            to_user=owner,
            message='Your booking has been approved.',
            is_read=False,
        )

        session = self.client.session
        session['user_id'] = str(owner.user_id)
        session['user_role'] = owner.role
        session.save()

        response = self.client.post(reverse('notification'))

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse('owner'))
        self.assertEqual(Notification.objects.filter(to_user=owner, is_read=False).count(), 0)

    def test_admin_verification_updates_room_state(self):
        admin_user = User.objects.create(
            first_name='Admin',
            last_name='User',
            email='admin@test.com',
            password='hashed',
            role='admin',
        )
        owner = User.objects.create(
            first_name='Owner',
            last_name='User',
            email='owner@test.com',
            password='hashed',
            role='owner',
        )
        room = Room.objects.create(
            owner=owner,
            image='images/default.jpg',
            room_name='Test Room',
            address='Test Street',
            city='Kathmandu',
            price=10000,
            description='Test',
            tag='Unverified',
            is_verified=False,
        )

        session = self.client.session
        session['user_id'] = str(admin_user.user_id)
        session['user_role'] = admin_user.role
        session.save()

        response = self.client.get(reverse('admin_verify_room', args=[room.id]), {'action': 'approve'})

        self.assertEqual(response.status_code, 302)
        room.refresh_from_db()
        self.assertTrue(room.is_verified)
        self.assertEqual(room.tag, 'Verified')

        self.client.get(reverse('admin_verify_room', args=[room.id]), {'action': 'reject'})
        room.refresh_from_db()
        self.assertFalse(room.is_verified)
        self.assertEqual(room.tag, 'Rejected')
