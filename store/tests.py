from django.test import TestCase
from django.urls import reverse
from .models import Character


class StoreViewTest(TestCase):

    def setUp(self):
        self.default_character = Character.objects.create(
            name='Default Dev',
            world='ocean',
            description='The starting developer.',
            image='characters/default.png',
            price=0,
            is_default=True
        )
        self.purchasable_character = Character.objects.create(
            name='Robot Dev',
            world='matrix',
            description='A robot developer character.',
            image='characters/robot.png',
            price=2.99,
            is_default=False
        )

    def test_store_view_accessible_without_login(self):
        response = self.client.get(reverse('store'))
        self.assertEqual(response.status_code, 200)

    def test_store_view_uses_correct_template(self):
        response = self.client.get(reverse('store'))
        self.assertTemplateUsed(response, 'store/store.html')

    def test_store_view_excludes_default_characters(self):
        response = self.client.get(reverse('store'))
        characters = response.context['characters']
        self.assertNotIn(self.default_character, characters)
        self.assertIn(self.purchasable_character, characters)

    def test_character_str(self):
        self.assertIn('Robot Dev', str(self.purchasable_character))
