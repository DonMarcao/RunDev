from django.db import models
from django.contrib.auth.models import User


class Purchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stripe_payment_id = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=6, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_successful = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - £{self.amount} - {'Success' if self.is_successful else 'Failed'}"