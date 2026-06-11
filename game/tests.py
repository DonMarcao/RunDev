from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from accounts.models import UserProfile
import json


class GameViewTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)

    def test_home_view(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)

    def test_game_requires_login(self):
        response = self.client.get(reverse('game'))
        self.assertEqual(response.status_code, 302)

    def test_game_view_logged_in(self):
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('game'))
        self.assertEqual(response.status_code, 200)

    def test_game_context_free_user(self):
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('game'))
        self.assertFalse(response.context['is_premium'])
        self.assertEqual(response.context['worlds_unlocked'], 1)

    def test_game_context_premium_user(self):
        self.profile.is_premium = True
        self.profile.worlds_unlocked = 2
        self.profile.save()
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('game'))
        self.assertTrue(response.context['is_premium'])

    def test_submit_score(self):
        self.client.login(username='testuser', password='testpass123')
        response = self.client.post(
            reverse('submit_score'),
            data=json.dumps({
                'world': 'ocean',
                'score': 100,
                'time_seconds': 30
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'ok')

    def test_showroom_requires_login(self):
        response = self.client.get(reverse('showroom'))
        self.assertEqual(response.status_code, 302)

    def test_showroom_view(self):
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('showroom'))
        self.assertEqual(response.status_code, 200)