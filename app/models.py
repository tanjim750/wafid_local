from django.db import models
from django.contrib.auth.models import User

class WafidLink(models.Model):
    sno = models.IntegerField()
    link = models.TextField()
    name = models.CharField(max_length=1000, blank=True, null=True)
    comment = models.TextField(blank=True,null=True)
    status = models.CharField(max_length=10000,default="Due")
    is_paid = models.BooleanField(default=False)

    def __str__(self):
        return str(self.sno)

class CardInfo(models.Model):
    title = models.CharField(max_length=10000)
    number = models.IntegerField()
    cvv = models.IntegerField()
    expiry_month = models.IntegerField()
    expiry_year = models.IntegerField()

    def __str__(self):
        return str(self.title)

class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sno = models.IntegerField()
    passport = models.CharField(max_length=100)
    agent_name = models.CharField(max_length=1000)
    medical_name = models.CharField(max_length=1000)
    pay_link = models.URLField()
    is_copied = models.BooleanField(default=False)
    date = models.DateTimeField(null=True,auto_now_add=True)

    def __str__(self):
        return self.passport

class BookingInfo(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    country = models.CharField(max_length=10000)
    city = models.CharField(max_length=10000)
    country_traveling_to = models.CharField(max_length=10000)
    first_name = models.CharField(max_length=10000)
    last_name = models.CharField(max_length=10000)
    date_of_birth = models.TextField()
    nationality = models.CharField(max_length=10000)
    gender = models.CharField(max_length=100)
    marital_status = models.CharField(max_length=10000)
    passport_issue_date = models.TextField()
    passport_expiry_date = models.TextField()
    passport_issue_place = models.CharField(max_length=1000,default="DHAKA")
    visa_type = models.CharField(max_length=10000)
    email_id = models.CharField(max_length=10000)
    phone_no = models.CharField(max_length=10000)
    position_applied_for = models.CharField(max_length=1000)

    def __str__(self):
        return self.booking.passport
    
class DefaultBookinInfo(models.Model):
    country = models.CharField(max_length=10000,default="Bangladesh")
    city = models.CharField(max_length=10000,default="Dhaka")
    country_traveling_to = models.CharField(max_length=10000,default="Saudi Arabia")
    nationality = models.CharField(max_length=10000,default="Bangladeshi")
    visa_type = models.CharField(max_length=10000,default="Work Visa")
    email_id = models.CharField(max_length=10000,default="nurtravels24@gmail.com")
    phone_no = models.CharField(max_length=10000,default="+8800000006030")
    position_applied_for = models.CharField(max_length=1000,default="Worker")
    passport_issue_place = models.CharField(max_length=1000,default="DHAKA")

    def __str__(self):
        return self.email_id
