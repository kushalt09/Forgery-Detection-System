from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
class User(AbstractUser):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    address = models.CharField(max_length=255, null=True, blank=True)
    isAdmin = models.BooleanField(default=False, blank=True)
    signImg = models.ImageField(upload_to="user_signatures/", null=True, blank=True)
    citizenshipImg = models.ImageField(upload_to='citizenships/', null=True, blank=True)
    username = models.CharField(max_length=150, unique=True, null=True)
    email = models.EmailField(max_length=255, unique=True)
    account_number = models.CharField(max_length=8, null=True, blank=True, unique=True)
    is_verified = models.BooleanField(default=False)
    is_pending = models.BooleanField(default=False)
    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = ["name", "username"]
