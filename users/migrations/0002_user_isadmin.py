# Generated by Django 5.0.3 on 2024-03-28 07:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='isAdmin',
            field=models.BooleanField(blank=True, default=False),
        ),
    ]
