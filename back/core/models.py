from django.db import models
from django.core.management.base import BaseCommand
import os


class RefModel(models.Model):
    created_at = models.DateTimeField(
        auto_now=True, editable=False, verbose_name="تاریخ ایجاد"
    )

    class Meta:
        abstract = True


class RefCommand(BaseCommand):
    testNum = 0

    def CheckCreateDir(self, appName, targetType, folderDir):
        if not os.path.isdir(folderDir):
            self.warning("project doesn't exsist. create project folder ...")
            os.mkdir(folderDir)
            os.mkdir(os.path.join(folderDir, "django"))
            self.success("folder created")

        elif not os.path.isdir(f"{folderDir}/{targetType}"):
            self.warning(
                f"{targetType} folder on project doesn't exsist. create project folder ..."
            )
            os.mkdir(os.path.join(folderDir, targetType))
            self.success("folder created")

    def info(self, message):
        self.stdout.write(self.style.MIGRATE_LABEL(message))

    def warning(self, message):
        self.stdout.write(self.style.WARNING(message))

    def success(self, message, check=True):
        self.stdout.write(self.style.SUCCESS(message + (" ✅" if check else "")))

    def error(self, message):
        return Exception(self.style.ERROR(message) + " ❌")

