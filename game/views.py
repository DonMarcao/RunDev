from django.shortcuts import render
from django.contrib.auth.decorators import login_required


def home_view(request):
    return render(request, 'home.html')


@login_required
def game_view(request):
    return render(request, 'game/game.html')