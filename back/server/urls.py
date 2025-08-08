from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView 
from general.views import aiResponse_API_NLP , set_API,LineAPI,aiResponse_APi_chatBot
from history.views import user_history , Save_history
from persons.views import user_info , register

api_urls = [
    path("token", TokenObtainPairView.as_view(), name="token"),
    path("token/refresh", TokenRefreshView.as_view(), name="refresh_token"),
    path("ai_NLP/", aiResponse_API_NLP.as_view(), name="ai_NLP"),
    path("ai_chatbot/", aiResponse_APi_chatBot.as_view(), name="ai_chatbot"),
    path("set/", set_API.as_view(), name="set"),
    path("eqe/", LineAPI.as_view(), name="eqe"),
    path('user-info/', user_info, name='user-info'),
    path("register/", register, name="register"),
    path('user-history/', user_history, name='user-history'),
    path('save-history/', Save_history.as_view, name='save-history')
]

urlpatterns = [
    path("api/", include(api_urls)),
    path("admin/", admin.site.urls, name="backoffice"),
    
]