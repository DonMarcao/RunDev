from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Max, Min, Sum
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

    world_filter = request.GET.get('world', 'all')
    completed = request.GET.get('completed', False)

    # Best score per player per world (filtered by world)
    if world_filter == 'all':
        scores = Score.objects.values('user__username', 'world').annotate(
            best_score=Max('score'),
            best_time=Min('time_seconds')
        ).order_by('-best_score', 'best_time')[:20]
    else:
        scores = Score.objects.filter(world=world_filter).values(
            'user__username', 'world'
        ).annotate(
            best_score=Max('score'),
            best_time=Min('time_seconds')
        ).order_by('-best_score', 'best_time')[:20]

    # Total score ranking across all worlds
    total_scores = Score.objects.values('user__username').annotate(
        total=Sum('score')
    ).order_by('-total')[:10]

    user_scores = Score.objects.filter(user=request.user).order_by('-score')

    return render(request, 'leaderboard/leaderboard.html', {
        'scores': scores,
        'user_scores': user_scores,
        'completed': completed,
        'world_filter': world_filter,
        'total_scores': total_scores,
    })


@login_required
def update_score(request, score_id):
    score = get_object_or_404(Score, id=score_id, user=request.user)
    if request.method == 'POST':
        label = request.POST.get('label', '').strip()
        score.label = label
        score.save()
        messages.success(request, 'Score updated!')
    return redirect('leaderboard')


@login_required
def delete_score(request, score_id):
    score = get_object_or_404(Score, id=score_id, user=request.user)
    if request.method == 'POST':
        score.delete()
        messages.success(request, 'Score deleted!')
    return redirect('leaderboard')
