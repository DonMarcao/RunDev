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
        worlds_unlocked = profile.worlds_unlocked
    except UserProfile.DoesNotExist:
        is_premium = False
        worlds_unlocked = 1

    context = {
        'is_premium': is_premium,
        'worlds_unlocked': worlds_unlocked,
        'username': request.user.username,
    }
    return render(request, 'game/game.html', context)


@login_required
@csrf_exempt
def submit_score(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        world = data.get('world', 'ocean')
        score = data.get('score', 0)
        time_seconds = data.get('time_seconds', 0)

        Score.objects.create(
            user=request.user,
            world=world,
            score=score,
            time_seconds=time_seconds
        )

        # Unlock next world if premium
        profile = UserProfile.objects.get(user=request.user)
        world_order = ['ocean', 'space', 'matrix', 'cloud']
        current_index = world_order.index(world)

        if profile.is_premium and profile.worlds_unlocked == current_index + 1:
            profile.worlds_unlocked = current_index + 2
            profile.save()

        return JsonResponse({
            'status': 'ok',
            'worlds_unlocked': profile.worlds_unlocked
        })
    return JsonResponse({'status': 'error'}, status=400)


@login_required
def showroom_view(request):
    return render(request, 'game/showroom.html')