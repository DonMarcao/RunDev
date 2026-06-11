from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from accounts.models import UserProfile
from .models import Purchase


class PaymentsTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)

    def test_checkout_requires_login(self):
        response = self.client.get(reverse('checkout'))
        self.assertEqual(response.status_code, 302)

    def test_checkout_view_get(self):
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('checkout'))
        self.assertEqual(response.status_code, 200)

    def test_success_sets_premium(self):
        self.client.login(username='testuser', password='testpass123')
        self.client.get(reverse('payment_success'))
        self.profile.refresh_from_db()
        self.assertTrue(self.profile.is_premium)

    def test_success_unlocks_world_2(self):
        self.client.login(username='testuser', password='testpass123')
        self.client.get(reverse('payment_success'))
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.worlds_unlocked, 2)

    def test_cancel_view(self):
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('payment_cancel'))
        self.assertEqual(response.status_code, 200)

    def test_purchase_model_str(self):
        purchase = Purchase.objects.create(
            user=self.user,
            stripe_payment_id='test_123',
            amount=4.99,
            is_successful=True
        )
        self.assertIn('testuser', str(purchase))