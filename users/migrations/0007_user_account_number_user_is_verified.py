# Generated by Django 5.0.6 on 2024-07-31 07:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_auto_20240731_0530'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='account_number',
            field=models.CharField(blank=True, max_length=8, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='user',
            name='is_verified',
            field=models.BooleanField(default=False),
        ),
    ]