from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("Users must have an username address")
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, password, **extra_fields)

    def get_by_natural_key(self, username):
        return self.get(username=username)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=50,unique=True)
    password = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    @property
    def is_authenticated(self):
        return True
    @property
    def is_anonymous(self):
        return False

    def get_full_name(self):
        return self.username

    def get_short_name(self):
        return self.username
    def get_by_natural_key(self, username):
        return self.get(**{self.model.USERNAME_FIELD: username})
    def __str__(self):
        return self.username
    