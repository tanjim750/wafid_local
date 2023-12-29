# Generated by Django 5.0 on 2023-12-23 13:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0006_alter_defaultbookininfo_city_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='bookinginfo',
            name='passport_issue_place',
        ),
        migrations.AddField(
            model_name='defaultbookininfo',
            name='passport_issue_place',
            field=models.CharField(default='DHAKA', max_length=1000),
        ),
    ]
