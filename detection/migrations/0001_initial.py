# Generated by Django 5.0.3 on 2024-03-27 10:59

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Cheque',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image1', models.ImageField(upload_to='signatures/')),
                ('image2', models.ImageField(upload_to='signatures/')),
                ('accountNumber', models.CharField(max_length=100)),
            ],
        ),
    ]
