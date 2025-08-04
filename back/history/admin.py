from django.contrib import admin
from history.models import setActivities , lineActivities , aiActivities
admin.site.register(setActivities)
admin.site.register(aiActivities)
admin.site.register(lineActivities)
# Register your models here.
