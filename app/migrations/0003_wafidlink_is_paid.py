# Generated by Django 5.0 on 2023-12-21 11:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_cardinfo'),
    ]

    operations = [
        migrations.AddField(
            model_name='wafidlink',
            name='is_paid',
            field=models.BooleanField(default=False),
        ),
    ]
