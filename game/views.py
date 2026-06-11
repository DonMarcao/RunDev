import json
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from accounts.models import UserProfile
from leaderboard.models import Score

WORLD_BG = {
    'ocean': 'ocean_loop.gif',
    'cloud': 'cloud_loop.gif',
    'space': 'space_loop.gif',
    'matrix': 'matrix_loop.gif',
}

WORLD_ORDER = ['ocean', 'cloud', 'space', 'matrix']


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

    current_world = request.GET.get('world', 'ocean')

    # Security check — can't access world not yet unlocked
    if current_world not in WORLD_ORDER:
        current_world = 'ocean'
    if WORLD_ORDER.index(current_world) + 1 > worlds_unlocked:
        current_world = 'ocean'

    context = {
        'is_premium': is_premium,
        'worlds_unlocked': worlds_unlocked,
        'username': request.user.username,
        'current_world': current_world,
        'bg_gif': WORLD_BG.get(current_world, 'ocean_loop.gif'),
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
        current_index = WORLD_ORDER.index(world) if world in WORLD_ORDER else 0

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