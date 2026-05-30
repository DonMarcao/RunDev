from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from accounts.models import UserProfile


def home_view(request):
    return render(request, 'home.html')


@login_required
def game_view(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
        is_premium = profile.is_premium
    except UserProfile.DoesNotExist:
        is_premium = False

    context = {
        'is_premium': is_premium,
        'username': request.user.username,
    }
    return render(request, 'game/game.html', context)