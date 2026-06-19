from django.shortcuts import render
from .models import Character


def store_view(request):
    characters = Character.objects.filter(is_default=False)
    return render(request, 'store/store.html', {'characters': characters})
