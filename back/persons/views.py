from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from persons.models import CustomUser

@login_required
def user_info(request):
    user = CustomUser.objects.get(id=request.user.id)
    return JsonResponse({
        "username": user.username,
        "last_login": user.last_login
    })
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from persons.models import CustomUser

@csrf_exempt
def register(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        if not username or not password:
            return JsonResponse({"detail": "نام کاربری و رمز عبور الزامی است."}, status=400)
        if CustomUser.objects.filter(username=username).exists():
            return JsonResponse({"detail": "این نام کاربری قبلا ثبت شده است."}, status=400)
        user = CustomUser(username=username)
        user.set_password(password)
        user.save()
        return JsonResponse({"detail": "ثبت نام موفقیت آمیز بود."}, status=201)
    return JsonResponse({"detail": "فقط متد POST مجاز است."}, status=405)