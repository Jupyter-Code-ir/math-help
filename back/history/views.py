from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from history.models import setActivities, lineActivities, aiActivities

@login_required
def user_history(request):
    user = request.user
    sets = list(setActivities.objects.filter(user=user).values('set', 'set_count', 'created_at'))
    lines = list(lineActivities.objects.filter(user=user).values('line', 'line_count', 'created_at'))
    ais = list(aiActivities.objects.filter(user=user).values('title', 'chat', 'created_at'))
    return JsonResponse({
        "sets": sets,
        "lines": lines,
        "ais": ais,
    })