from django.urls import path
from . import views

urlpatterns = [
    path('', views.leaderboard_view, name='leaderboard'),
    path('update/<int:score_id>/', views.update_score, name='update_score'),
    path('delete/<int:score_id>/', views.delete_score, name='delete_score'),
]