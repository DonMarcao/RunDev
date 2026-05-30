import json
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from accounts.models import UserProfile
from leaderboard.models import Score


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


@login_required
@csrf_exempt
def submit_score(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        Score.objects.create(
            user=request.user,
            world=data.get('world', 'ocean'),
            score=data.get('score', 0),
            time_seconds=data.get('time_seconds', 0)
        )
        return JsonResponse({'status': 'ok'})
    return JsonResponse({'status': 'error'}, status=400)