from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from .models import UserProfile


class UserProfileTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)

    def test_profile_created(self):
        self.assertEqual(self.profile.is_premium, False)
        self.assertEqual(self.profile.worlds_unlocked, 1)

    def test_profile_str(self):
        self.assertIn('testuser', str(self.profile))

    def test_register_view_get(self):
        response = self.client.get(reverse('register'))
        self.assertEqual(response.status_code, 200)

    def test_register_view_post(self):
        response = self.client.post(reverse('register'), {
            'username': 'newuser',
            'password1': 'complexpass123',
            'password2': 'complexpass123',
        })
        self.assertEqual(User.objects.filter(username='newuser').count(), 1)

    def test_login_view_get(self):
        response = self.client.get(reverse('login'))
        self.assertEqual(response.status_code, 200)

    def test_login_view_post(self):
        response = self.client.post(reverse('login'), {
            'username': 'testuser',
            'password': 'testpass123',
        })
        self.assertEqual(response.status_code, 302)

    def test_logout_redirects(self):
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('logout'))
        self.assertEqual(response.status_code, 302)

    def test_game_requires_login(self):
        response = self.client.get(reverse('game'))
        self.assertEqual(response.status_code, 302)
        self.assertIn('/accounts/login/', response.url)