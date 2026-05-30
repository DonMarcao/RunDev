from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Character


def store_view(request):
    characters = Character.objects.filter(is_default=False)
    return render(request, 'store/store.html', {'characters': characters})