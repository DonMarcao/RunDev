from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_premium = models.BooleanField(default=False)
    worlds_unlocked = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = 'Premium' if self.is_premium else 'Free'
        return (
            f"{self.user.username} - {status} - "
            f"World {self.worlds_unlocked}"
        )
