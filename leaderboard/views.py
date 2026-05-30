from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from accounts.models import UserProfile
from .models import Score


@login_required
def leaderboard_view(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
        is_premium = profile.is_premium
    except UserProfile.DoesNotExist:
        is_premium = False

    if not is_premium:
        return render(request, 'leaderboard/locked.html')

    scores = Score.objects.select_related('user').order_by('-score')[:20]
    return render(request, 'leaderboard/leaderboard.html', {'scores': scores})