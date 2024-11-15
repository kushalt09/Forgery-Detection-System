# Generated by Django 5.0.6 on 2024-07-31 08:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_alter_user_email'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(default='default@example.com', max_length=255, unique=True),
            preserve_default=False,
        ),
    ]