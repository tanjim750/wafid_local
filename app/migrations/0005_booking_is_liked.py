# Generated by Django 5.0 on 2023-12-22 11:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0004_defaultbookininfo_booking_bookinginfo'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='is_liked',
            field=models.BooleanField(default=False),
        ),
    ]
