from django.shortcuts import render
from accounts.models import UserProfile
from .models import Character


def store_view(request):
    characters = Character.objects.filter(is_default=False)

    if request.user.is_authenticated:
        try:
            profile = UserProfile.objects.get(user=request.user)
            is_premium = profile.is_premium
            worlds_unlocked = profile.worlds_unlocked
        except UserProfile.DoesNotExist:
            is_premium = False
            worlds_unlocked = 1
    else:
        is_premium = False
        worlds_unlocked = 1

    return render(request, 'store/store.html', {
        'characters': characters,
        'is_premium': is_premium,
        'worlds_unlocked': worlds_unlocked,
    })
