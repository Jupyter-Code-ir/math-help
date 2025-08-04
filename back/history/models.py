from django.db import models
from persons.models import CustomUser
# Create your models here.
class setActivities(models.Model):
    set = models.JSONField()
    set_count = models.PositiveIntegerField()
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="set_activities"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.created_at

class lineActivities(models.Model):
    line = models.JSONField()
    line_count = models.PositiveIntegerField()
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="line_activities"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.created_at

class aiActivities(models.Model):
    title = models.CharField(max_length=100)
    chat = models.JSONField()
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="ai_activities"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.title
