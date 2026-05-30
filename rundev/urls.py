from django.contrib import admin
from django.urls import path, include
from game import views as game_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('game/', include('game.urls')),
    path('payments/', include('payments.urls')),
    path('leaderboard/', include('leaderboard.urls')),
    path('', game_views.home_view, name='home'),
]
