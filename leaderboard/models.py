from django.db import models
from django.contrib.auth.models import User


class Score(models.Model):
    WORLD_CHOICES = [
        ('ocean', 'Web Ocean'),
        ('space', 'Code Space'),
        ('matrix', 'Binary Matrix'),
        ('cloud', 'Cloud City'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    world = models.CharField(max_length=20, choices=WORLD_CHOICES)
    score = models.IntegerField()
    time_seconds = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score']

    def __str__(self):
        return f"{self.user.username} - {self.world} - {self.score}"