from django.urls import path
from . import views

urlpatterns = [
    path('', views.game_view, name='game'),
    path('submit-score/', views.submit_score, name='submit_score'),
    path('showroom/', views.showroom_view, name='showroom'),
]