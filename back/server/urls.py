from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView 
from general.views import aiResponse_API_NLP , set_API


api_urls = [
    path("token", TokenObtainPairView.as_view(), name="token"),
    path("token/refresh", TokenRefreshView.as_view(), name="refresh_token"),
    path("ai_NLP/", aiResponse_API_NLP.as_view(), name="ai_NLP"),
    path("set/", set_API.as_view(), name="set")
]

urlpatterns = [
    path("api/", include(api_urls)),
    path("admin/", admin.site.urls, name="backoffice"),
]