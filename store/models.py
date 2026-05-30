from django.db import models


class Character(models.Model):
    WORLD_CHOICES = [
        ('ocean', 'Web Ocean'),
        ('space', 'Code Space'),
        ('matrix', 'Binary Matrix'),
        ('cloud', 'Cloud City'),
    ]

    name = models.CharField(max_length=100)
    world = models.CharField(max_length=20, choices=WORLD_CHOICES)
    description = models.TextField()
    image = models.ImageField(upload_to='characters/')
    is_default = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.name} ({self.get_world_display()})"