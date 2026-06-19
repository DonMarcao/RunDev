from unittest.mock import patch, MagicMock
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

    @patch('payments.views.stripe.checkout.Session.retrieve')
    def test_success_sets_premium_when_paid(self, mock_retrieve):
        mock_session = MagicMock()
        mock_session.payment_status = 'paid'
        mock_retrieve.return_value = mock_session

        self.client.login(username='testuser', password='testpass123')
        self.client.get(
            reverse('payment_success'), {'session_id': 'cs_test_123'}
        )
        self.profile.refresh_from_db()
        self.assertTrue(self.profile.is_premium)

    @patch('payments.views.stripe.checkout.Session.retrieve')
    def test_success_unlocks_world_2_when_paid(self, mock_retrieve):
        mock_session = MagicMock()
        mock_session.payment_status = 'paid'
        mock_retrieve.return_value = mock_session

        self.client.login(username='testuser', password='testpass123')
        self.client.get(
            reverse('payment_success'), {'session_id': 'cs_test_123'}
        )
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.worlds_unlocked, 2)

    @patch('payments.views.stripe.checkout.Session.retrieve')
    def test_success_does_not_grant_premium_when_unpaid(self, mock_retrieve):
        mock_session = MagicMock()
        mock_session.payment_status = 'unpaid'
        mock_retrieve.return_value = mock_session

        self.client.login(username='testuser', password='testpass123')
        self.client.get(
            reverse('payment_success'), {'session_id': 'cs_test_123'}
        )
        self.profile.refresh_from_db()
        self.assertFalse(self.profile.is_premium)

    def test_success_does_not_grant_premium_without_session_id(self):
        self.client.login(username='testuser', password='testpass123')
        self.client.get(reverse('payment_success'))
        self.profile.refresh_from_db()
        self.assertFalse(self.profile.is_premium)

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
