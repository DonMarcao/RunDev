from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
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
    user_scores = Score.objects.filter(user=request.user).order_by('-score')
    return render(request, 'leaderboard/leaderboard.html', {
        'scores': scores,
        'user_scores': user_scores,
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