from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from history.models import setActivities, lineActivities, aiActivities
from rest_framework.views import APIView
@login_required
def user_history(request):
    user = request.user
    sets = list(setActivities.objects.filter(user=user).values('set', str('set_count'), 'created_at'))
    lines = list(lineActivities.objects.filter(user=user).values('line', str('line_count'), 'created_at'))
    ais = list(aiActivities.objects.filter(user=user).values('title', 'chat', 'created_at'))
    return JsonResponse({
        "sets": sets,
        "lines": lines,
        "ais": ais,
    })
class Save_history(APIView):
    def post(request):
        user = request.user
        section = request.data.get("section")
        data = request.data.get("data")
        if section.lower() in "set" :
            for set in data.lines:
                setActivities.set = set.value
                setActivities.set_name = set.name
        if section.lower() in "line" :
            for line in data.lines:
                lineActivities.set = line.value
                lineActivities.set_name = line.name
        if section.lower() in "ai" :
            for chat in data.lines:
                pass
