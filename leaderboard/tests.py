from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from accounts.models import UserProfile
from .models import Score


class ScoreModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            is_premium=True
        )
        self.score = Score.objects.create(
            user=self.user,
            world='ocean',
            score=100,
            time_seconds=30
        )

    def test_score_created(self):
        self.assertEqual(self.score.score, 100)
        self.assertEqual(self.score.world, 'ocean')
        self.assertEqual(self.score.time_seconds, 30)

    def test_score_str(self):
        self.assertIn('testuser', str(self.score))

    def test_score_label_default_empty(self):
        self.assertEqual(self.score.label, '')

    def test_leaderboard_requires_login(self):
        response = self.client.get(reverse('leaderboard'))
        self.assertEqual(response.status_code, 302)

    def test_leaderboard_blocked_for_free_user(self):
        self.profile.is_premium = False
        self.profile.save()
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('leaderboard'))
        self.assertTemplateUsed(response, 'leaderboard/locked.html')

    def test_leaderboard_accessible_for_premium(self):
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('leaderboard'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'leaderboard/leaderboard.html')

    def test_update_score_label(self):
        self.client.login(username='testuser', password='testpass123')
        response = self.client.post(
            reverse('update_score', args=[self.score.id]),
            {'label': 'My best run'}
        )
        self.score.refresh_from_db()
        self.assertEqual(self.score.label, 'My best run')

    def test_delete_score(self):
        self.client.login(username='testuser', password='testpass123')
        response = self.client.post(
            reverse('delete_score', args=[self.score.id])
        )
        self.assertEqual(Score.objects.filter(id=self.score.id).count(), 0)

    def test_cannot_delete_other_user_score(self):
        other_user = User.objects.create_user(
            username='otheruser',
            password='testpass123'
        )
        self.client.login(username='otheruser', password='testpass123')
        response = self.client.post(
            reverse('delete_score', args=[self.score.id])
        )
        self.assertEqual(Score.objects.filter(id=self.score.id).count(), 1)