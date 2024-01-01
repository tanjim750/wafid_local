from django.shortcuts import render, redirect
from django.views import View
from django.http import JsonResponse
from django.contrib.auth import authenticate , login , logout
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from .models import *

import requests,re,os
from datetime import timedelta,datetime
import threading
import time
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.chrome.service import Service
from anticaptchaofficial.recaptchav3proxyless import *


class LoginView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('home')
        return render(request,"login.html")
    def post(self, request):
        username = request.POST.get('username',None)
        password = request.POST.get('password',None)

        if username and password:
            user = authenticate(username=username ,password=password)

            if user is not None:
                login(request, user)

                context = {
                    "status": 200,
                    "text": "Successfully logged in",
                    "return_url":  str(reverse('home'))
                }
            else:
                context = {
                    "status": 404,
                    "text": "Username or password is incorrect"
            }
        else:
            context = {
                "status": 404,
                "text": "Username or password is empty"
            }

        return JsonResponse(context,safe=True)

class LogoutView(View):
    def get(self, request):
        logout(request)
        return redirect('login')
    
class HomeView(View):
    def __init__(self):
        self.links = WafidLink.objects.filter(is_paid=False).order_by("sno")
        self.cards = CardInfo.objects.all()

    def get(self,request):
        if request.user.is_authenticated:
            context = {
                "links":self.links,"cards":self.cards,
            }
            return render(request,"home.html",context)
        else:
            return redirect("login")

class PaidLinksView(View):
    def __init__(self):
        self.links = WafidLink.objects.filter(is_paid=True).order_by("sno")

    def get(self,request):
        if request.user.is_authenticated:
            context = {
                "links":self.links
            }
            return render(request,"paidlinks.html",context)
        else:
            return redirect("login")

class AddLink(View):
    def post(self, request):
        if not request.user.is_authenticated:
            return redirect("login")
        link = request.POST.get("link", None)
        name = request.POST.get("name", None)
        comment = request.POST.get("comment", None)
        previous_sno = request.POST.get("previous_sno", None)

        if link and previous_sno:
            sno = int(previous_sno)+1
            all_links = WafidLink.objects.filter(sno__gte=sno)

            # add link 
            already_exists = WafidLink.objects.filter(link=link).exists()
            if already_exists is False:
                obj = WafidLink.objects.create(
                    sno = sno,
                    link=link,
                    name = name,
                    comment = comment,
                )
                added_link = {
                    "link": obj.link,
                    "name": obj.name,
                    "comment": obj.comment,
                    "sno": obj.sno,
                    "status": obj.status,
                }

                for link in all_links:
                    if link != obj:
                        sno += 1
                        link.sno = sno
                        link.save()

                context = {
                    "status": 200,
                    "text": "Link Successfully Added",
                    "links": added_link
                }
            else:
                context = {
                    "status": 400,
                    "text": "Already added try different link"
                }
        else:
            context = {
                "status": 500,
                "text": "Please Provide a valid link"
            }
        
        return JsonResponse(context, safe=True)

class UpdateLink(View):
    def post(self,request):
        if not request.user.is_authenticated:
            return redirect("login")
        
        link = request.POST.get("link", None)
        name = request.POST.get("name", None)
        comment = request.POST.get("comment", None)
        sno = request.POST.get("sno", None)
        
        if link and sno:
            get_link = WafidLink.objects.filter(sno=sno)

            if get_link.exists():
                get_link = get_link.first()

                get_link.link = link
                get_link.name = name
                get_link.comment = comment
                get_link.save()

                added_link = {
                    "link": get_link.link,
                    "name": get_link.name,
                    "comment": get_link.comment,
                    "sno": get_link.sno,
                    "status": get_link.status,
                }

                context = {
                    "status": 200,
                    "text": "Link Successfully updated",
                    "links": added_link
                }
            else:
                context = {
                    "status":500,
                    "error":"Link not found"
                }
        else:
            context = {
                "status":500,
                "error":"Required parameters are missing"
            }
        
        return JsonResponse(context,safe=True)


class RemoveLink(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return redirect("login")
        
        sno = request.GET.get("sno", None)
        
        if sno is not None:
            get_link = WafidLink.objects.filter(sno=sno)

            if get_link.exists():
                get_link.first().delete()

                all_links = WafidLink.objects.all().order_by("sno")


                for index,link in enumerate(all_links):
                    sno = index + 1
                    link.sno = sno
                    link.save()

                context = {
                    "status":200,
                    "text":"Successfully removed"
                }
                
            else:
                context = {
                    "status":500,
                    "error":"Link not found"
                }
        else:
            context = {
                "status":500,
                "error":"Sno is required"
            }
        
        return JsonResponse(context,safe=True)
    
class BookingView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return redirect("login")
        
        return render(request, "booking.html")
    
    def post(self, request):
        if not request.user.is_authenticated:
            return redirect("login")
        
        fname = request.POST.get("fname",None)
        lname = request.POST.get("lname",None)
        dob = request.POST.get("dob",None)
        gender = request.POST.get("gender",None)
        marital_status = request.POST.get("marital_status",None)
        passport_num = request.POST.get("passport_num",None)
        passport_issue_date = request.POST.get("passport_issue_date",None)
        # passport_issue_place = request.POST.get("passport_issue_place",None)
        passport_expiry = request.POST.get("passport_expiry",None)
        agent = request.POST.get("agent",None)
        medical = request.POST.get("medical",None)
        browser = request.POST.get("browser",None)

        booking = Booking.objects.filter(passport = passport_num)
        if booking.exists():
            booking = booking.first()
            created_date = booking.date
            if timezone.is_naive(created_date):
                created_date = timezone.make_aware(created_date, timezone.get_current_timezone())

            current_date = timezone.now()
            difference = current_date - created_date

            if difference < timedelta(hours=1.01):
                context = {
                    "status":400,
                    "text":f"Already booking completed. Try again after {str(timedelta(hours=1)-difference)[:7]} hours"
                }
                return render(request,'booking.html',context)

        make_booking = MakeBooking(browser)
        # make_booking.login_google()
        make_booking.get_values(request.user,fname,lname,dob,gender,marital_status,passport_num,passport_issue_date,passport_expiry,agent,medical)
        response = make_booking.book_now()
        context = response
        return render(request,'booking.html',context)


class BookingLinkView(View):
    def remove_link(self,id):
        booking = Booking.objects.filter(id=id)
        if booking.exists():
            booking = booking.first()
            booking_info = BookingInfo.objects.filter(booking=booking)
            if booking_info.exists():
                booking_info.first().delete()
            booking.delete()
            context = {
                "status": 200,
            }
        else:
            context = {
                "status":400, 
                "error":"Link not found"
                }
        
        return context
    
    def set_as_copied(self,id):
        booking = Booking.objects.filter(id=id)
        if booking.exists():
            booking = booking.first()
            booking.is_copied = True
            booking.save()
            context = {
                "status": 200,
            }
        else:
            context = {
                "status":400, 
                "error":"Link not found"
                }
        
        return context
    
    def search_booking(self,passport):
        if len(passport):
            bookings = Booking.objects.filter(passport__icontains = passport)
        else:
            bookings = Booking.objects.all().order_by('passport')
        bookings_list =[]
        for booking in bookings:
            d = {}
            d["id"] = booking.id
            d["pay_link"] = booking.pay_link
            d["passport"] = booking.passport
            d["agent_name"] = booking.agent_name
            d["medical_name"] = booking.medical_name
            d["date"] = str(booking.date)[:-9]
            d["is_copied"] = booking.is_copied
            d["username"] = booking.user.username
            bookings_list.append(d)
            
        context = {
            "status":200,
            "bookings":bookings_list
        }
        return context
    
    def delete_all(self):
        Booking.objects.all().delete()
        context = {
            "status":200,
            "bookings":"All Bookings deleted"
        }
        return context

    def get(self, request):
        if not request.user.is_authenticated:
            return redirect("login")
        
        action = request.GET.get('action',None)
        if action == "set_as_copied":
            id = request.GET.get('id',None)
            if id:
               context = self.set_as_copied(id)
            else:
                context = {
                    "status": 400,
                }
            return JsonResponse(context)
        
        elif action == "remove_link":
            id = request.GET.get('id',None)
            if id:
               context = self.remove_link(id)
            else:
                context = {
                    "status": 400,
                }
            return JsonResponse(context)
        
        elif action == "search_booking":
            passport = request.GET.get('passport',None)
            context = self.search_booking(passport)
            return JsonResponse(context)
        
        elif action == "delete_all":
            context = self.delete_all()
            return JsonResponse(context)
        
        else:
            booking = Booking.objects.all().order_by("-date")
            context = {
                "bookings": booking
            }
            return render(request, 'booking_links.html', context)


class BookAgainView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return redirect("login")
        
        action = request.GET.get('action', None)
        if action == "book_again":
            id = request.GET.get('id', None)
            if id:
                booking = Booking.objects.get(id=id)
                created_date = booking.date
                if timezone.is_naive(created_date):
                    created_date = timezone.make_aware(created_date, timezone.get_current_timezone())

                current_date = timezone.now()
                difference = current_date - created_date

                if difference > timedelta(hours=1.05):
                    booking_info = BookingInfo.objects.filter(booking=booking)
                    if booking_info.exists():
                        booking_info = booking_info.first()
                        fname = booking_info.first_name
                        lname = booking_info.last_name
                        dob = booking_info.date_of_birth
                        gender = booking_info.gender
                        marital_status = booking_info.marital_status
                        passport_num = booking_info.booking.passport
                        passport_issue_date = booking_info.passport_issue_date
                        passport_expiry = booking_info.passport_expiry_date
                        agent = booking_info.booking.agent_name
                        medical = booking_info.booking.medical_name

                        make_booking = MakeBooking()
                        # make_booking.login_google()
                        make_booking.get_values(request.user,fname,lname,dob,gender,marital_status,passport_num,passport_issue_date,passport_expiry,agent,medical)
                        response = make_booking.book_now()
                        if response["status"] == 200:
                            booking.date = timezone.now()
                            booking.save()
                        context = response
                    else:
                        context = {
                            "status":400,
                            "error":f"Bookin Information not found"
                        }
                else:
                    context = {
                        "status":400,
                        "error":f"Try again after {str(timedelta(hours=1)-difference)[:7]} hours"
                    }
            else:
                context = {
                    "status": 400,
                    "error": "booking Not Found",
                }
        else:
            context = {
                "status": 400,
                "error": "Invalid Request",
            }

        return JsonResponse(context)




            
class MakeBooking(View):
    def __init__(self,browser = None):
        obj = DefaultBookinInfo.objects.filter(id=1)
        if obj.exists():
            self.obj = obj.first()
        else:
            self.obj = DefaultBookinInfo.objects.create()
        if browser == "firefox":
            options = webdriver.FirefoxOptions()
            options.add_argument('--headless')
            options.add_argument('--disable-gpu')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--no-sandbox')
            self.driver = webdriver.Firefox(options=options)
        elif browser == "chrome":
            options = webdriver.ChromeOptions()
            options.add_argument('--headless')
            options.add_argument('--disable-gpu')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--no-sandbox')
            self.driver = webdriver.Chrome(options=options)
        else:
            # service = Service(executable_path='/media/tanjim/Tanjim/python/django/wafid/msedgedriver')
            options = webdriver.EdgeOptions()
            options.add_argument('--headless')
            options.add_argument('--disable-gpu')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--no-sandbox')
            self.driver = webdriver.Edge(options=options)

        self.url = "https://wafid.com/book-appointment/"
        self.default_value()

    def default_value(self):
        self.country = self.obj.country
        self.city = self.obj.city
        self.country_traveling_to = self.obj.country_traveling_to
        self.nationality = self.obj.nationality
        self.visa_type = self.obj.visa_type
        self.email_id = self.obj.email_id
        self.phone_no = self.obj.phone_no
        self.position_applied_for = self.obj.position_applied_for
        self.passport_issue_place = self.obj.passport_issue_place

        return True
    
    def login_google(self):
        self.driver.get("https://accounts.google.com")

        # Locate the username input field and enter your email address
        email_input = self.driver.find_element("name", "identifier")
        email_input.send_keys("quinnirene701@gmail.com")

        # Click the "Next" button
        next_button = self.driver.find_element(By.ID,"identifierNext")
        next_button.click()

        # Wait for a while to allow the page to load
        time.sleep(2)

        # Locate the password input field and enter your password
        password_input = self.driver.find_element("name", "password")
        password_input.send_keys("abcd1234@")

        # Click the "Next" button to log in
        password_next_button = self.driver.find_element(By.ID,"passwordNext")
        password_next_button.click()

        return True
    def solve_captcha(self,uuid):
        # Your Anti-Captcha API key
        api_key = '96b6ee4e4c31556a0dcabac0a46af8ce'

        # Initialize Anti-Captcha client
        solver = recaptchaV3Proxyless()
        solver.set_verbose(1)
        solver.set_key(api_key)
        solver.set_website_url(self.url)
        solver.set_website_key(uuid)

        # Your Selenium script here...

        # Get the reCAPTCHA solution
        captcha_solution = solver.solve_and_return_solution()

        # Set the solution in your Selenium script
        self.driver.execute_script(f'document.getElementsByName("g-recaptcha-response")[0].innerHTML="{captcha_solution}";')
        return captcha_solution

    def get_values(self,user,fname,lname,dob,gender,marital_status,passport_num,passport_issue_date,passport_expiry,agent,medical):
        self.user = user
        self.fname = fname
        self.lname = lname
        self.dob = dob
        self.gender = gender
        self.marital_status = marital_status
        self.passport_num = passport_num
        self.passport_issue_date = passport_issue_date
        # self.passport_issue_place = passport_issue_place
        self.passport_expiry = passport_expiry
        self.agent = agent
        self.medical = medical

        return True
    def set_cookie(self):
        cookies_json = [
           {
                "domain": ".wafid.com",
                "name": "_gid",
                "path": "/",
                "value": "GA1.2.120193923.1703337273"
            },
            {
                "domain": ".wafid.com",
                "name": "_ga_GGW1JWX8ZB",
                "path": "/",
                "value": "GS1.1.1703337272.1.1.1703337275.0.0.0"
            },
            {
                "domain": ".wafid.com",
                "name": "__cf_bm",
                "path": "/",
                "value": ".Bz1E4DIZwhAXQNsR_QO3UBIGPN25LAxt5UtEXcUk94-1703337267-1-AUi/PSrjD0lFO9apTzch9QYc5NknO59Axf7UheYT3HHpdRIhH/uQdSNqauP9KyXeApjt8IYWqqlSx7wsmQw5mzA="
            },
            {
                "domain": ".wafid.com",
                "name": "_gat_gtag_UA_146902071_1",
                "path": "/",
                "value": "1"
            },
            {
                "domain": ".wafid.com",
                "name": "_ga",
                "path": "/",
                "value": "GA1.1.1672112324.1703337273"
            },
            {
                "domain": ".wafid.com",
                "name": "_ga_MJXP81MQSG",
                "path": "/",
                "value": "GS1.1.1703337272.1.1.1703337275.0.0.0"
            },
            {
                "domain": ".wafid.com",
                "name": "_ga_RZ2W6CXMS3",
                "path": "/",
                "value": "GS1.1.1703337272.1.1.1703337275.0.0.0"
            }
        ]

        for cookie in cookies_json:
            self.driver.add_cookie(cookie)
        

        return True

    def add_to_db(self,link):
        total_bookings = Booking.objects.all().count()

        booking = Booking.objects.create(
            user = self.user,
            sno = total_bookings+1,
            passport = self.passport_num,
            agent_name = self.agent,
            medical_name = self.medical,
            pay_link = link,
        )

        booking_info = BookingInfo.objects.create(
            booking = booking,
            country = self.country,
            city = self.city,
            country_traveling_to = self.country_traveling_to,
            first_name = self.fname,
            last_name = self.lname,
            date_of_birth = self.dob,
            nationality = self.nationality,
            gender = self.gender,
            marital_status = self.marital_status,
            passport_issue_date = self.passport_issue_date,
            passport_issue_place = self.passport_issue_place,
            passport_expiry_date = self.passport_expiry,
            visa_type = self.visa_type,
            email_id = self.email_id,
            phone_no = self.phone_no,
            position_applied_for = self.position_applied_for
        )
        
        d = {}
        d["id"] = booking.id
        d["pay_link"] = booking.pay_link
        d["passport"] = booking.passport
        d["agent_name"] = booking.agent_name
        d["medical_name"] = booking.medical_name
        d["date"] = str(booking.date)[:-9]
        d["username"] = booking.user.username
        d["text"] = "Booking Successful!!!"
        return d
    
    def book_now(self):
        self.driver.get(self.url)
        self.set_cookie()
        page_source = self.driver.page_source
        print(page_source.title)
        # Define a regular expression pattern for UUIDs
        uuid_pattern = re.compile(r'data-widget-uuid="([^"]+)"')

        # Find all matches in the page source
        uuid = uuid_pattern.findall(page_source)[0]
        print(uuid)
        
        self.driver.find_element(By.NAME, "country").send_keys(self.country)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "city").send_keys(self.city)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "traveled_country").send_keys(self.country_traveling_to)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "first_name").send_keys(self.fname)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "last_name").send_keys(self.lname)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "dob").send_keys(self.dob)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "nationality").send_keys(self.nationality)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "gender").send_keys(self.gender)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "marital_status").send_keys(self.marital_status)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "passport").send_keys(self.passport_num)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "confirm_passport").send_keys(self.passport_num)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "passport_issue_date").send_keys(self.passport_issue_date)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "passport_issue_place").send_keys(self.passport_issue_place)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "passport_expiry_on").send_keys(self.passport_expiry)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "visa_type").send_keys(self.visa_type)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "email").send_keys(self.email_id)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "phone").send_keys(self.phone_no)
        time.sleep(0.5)
        self.driver.find_element(By.NAME, "applied_position").send_keys(self.position_applied_for)
        time.sleep(0.5)
        checkbox = self.driver.find_element(By.CSS_SELECTOR, "input[id=id_confirm]")

        # Find the parent div of the checkbox
        parent_div = checkbox.find_element(By.XPATH, "./..")

        # Click on the label inside the parent div
        label = parent_div.find_element(By.TAG_NAME, "label")
        label.click()
        time.sleep(3)

        submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_btn.click()
        
        return_url = self.driver.current_url
        count = 1
        while (return_url == self.url and count < 4):
            self.solve_captcha(uuid)
            checkbox = self.driver.find_element(By.CSS_SELECTOR, "input[id=id_confirm]")
            # Find the parent div of the checkbox
            parent_div = checkbox.find_element(By.XPATH, "./..")
            # Click on the label inside the parent div
            label = parent_div.find_element(By.TAG_NAME, "label")
            label.click()
            submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_btn.click()
            return_url = self.driver.current_url
            count += 1
            time.sleep(3)


        if "/pay/" in return_url:
            booking = self.add_to_db(return_url)
            context = {
                "status": 200,
            }
            context.update(booking)
        else:
            context = {
                "status": 400,
                "text": "Booking failed"
            }
        self.driver.quit()
        return context


class AddToTab(View):
    def __init__(self):
        self.pay_instance = PayBooking()
        self.context = {
            "status": 200,
            "links":[]
            }
    
    def get(self,request):
        start_from = request.GET.get('start_from',None)
        end_to = request.GET.get('end_to',None)
        card_id = request.GET.get('card_id',None)

        if start_from and end_to and card_id:
            start_from = int(start_from)
            end_to = int(end_to)

            start = start_from if start_from < end_to else end_to
            end = end_to if end_to > start_from else start_from
            
            card_info = CardInfo.objects.filter(id=card_id)

            if card_info.exists():
                card = card_info.first()
                card_number = card.number
                cvv = card.cvv
                expiry_year = card.expiry_year
                expiry_month = card.expiry_month
                
                self.pay_instance.add_card(card_number,cvv,expiry_year,expiry_month)

            wafid_link = WafidLink.objects.filter(sno__in = list(range(start, end+1)))
            for obj in wafid_link:
                link = obj.link
                
                driver = webdriver.Edge()

                self.pay_instance.add_to_tab(link,driver)
                self.context["links"].append(
                    {
                        "sno":obj.sno,
                        "text": "In Tab"
                    }
                )

            return JsonResponse(self.context,safe=True)
        else:
            context = {
                "status": 500,
                "text": "Required parameters are missing"
            }
            return JsonResponse(context, safe=True)
            


class PayNow(View):
    def __init__(self):
        self.pay_instance = PayBooking()


    def get(self,request):
        start_from = request.GET.get('start_from',None)
        end_to = request.GET.get('end_to',None)

        if start_from and end_to:
            start_from = int(start_from)
            end_to = int(end_to)

            start = start_from if start_from < end_to else end_to
            end = end_to if end_to > start_from else start_from

            threads = []
            wafid_links = WafidLink.objects.filter(sno__in = list(range(start, end+1)))
            for obj in wafid_links:
                link = obj.link
                # self.pay_instance.pay_now(link)
                thread = threading.Thread(target=self.pay_instance.pay_now, args=(link,))
                threads.append(thread)
                thread.start()
                time.sleep(1)
            
            for th in threads:
                th.join()
            
            wafid_links = WafidLink.objects.filter(sno__in = list(range(start, end+1))) # get updated data after payment done
            context = {"pay_status":[]}
            for obj in wafid_links:
                dict = {
                    "status": 200 if obj.is_paid else 400,
                    "payment_status": obj.status,
                    "sno": obj.sno
                }
                context["pay_status"].append(dict)

        else:
            context = {
                "status": 400,
                "text": "Please provide a valid serial number"
            }
        
        return JsonResponse(context, safe=True)


class PayBooking():
    all_tabs = {}

    def __init__(self):
        # self.driver = webdriver.Chrome()
        self.is_card_added = False

    def add_card(self,card_number,cvv,expiry_year,expiry_month):
        self.card_number = card_number
        self.cvv = cvv
        self.expiry_year = expiry_year
        self.expiry_month = expiry_month

        self.is_card_added = True

        return True

        
    
    def get_error_msg(self,driver):
        # Find the <div class="ui error message"> element
        error_div = driver.find_element(By.CSS_SELECTOR, "div.ui.error.message")

        if error_div is not None:
            # Get the text inside the div
            error_message = error_div.text
        else:
            error_message = "Unknown error found"
        
        return error_message
        
    def change_payment_status(self,url,context):
        link = WafidLink.objects.filter(link=url)

        if link.exists():
            link = link.first()
            status = context["status"]
            payment_status = context["payment_status"]
            link.status = payment_status
            if status == 200:
                link.is_paid = True
            link.save()

            return True
        else:
            return False
    
    def add_to_tab(self,url,driver):
        self.driver = driver
        url_already_added = PayBooking.all_tabs.get(url,None)
        if not url_already_added:

            # self.driver.execute_script(f"window.open('', '_blank');")
            # self.driver.switch_to.window(self.driver.window_handles[current_tab_index])
            self.driver.get(url)
            PayBooking.all_tabs[url] = self.driver

            # Check the return URL after opening the payment URL
            current_url = self.driver.current_url
            
            if current_url == url:

                # Find and fill out the card holder name, card number, CVV, expiry year, and expiry month
                # self.driver.find_element(By.NAME, "card_holder_name").send_keys("Nur")
                self.driver.find_element(By.NAME, "card_number").send_keys(self.card_number)
                # time.sleep(1)
                self.driver.find_element(By.NAME, "card_security_code").send_keys(self.cvv)
                # time.sleep(1)

                # Select expiry year from dropdown
                expiry_year_dropdown = Select(self.driver.find_element(By.NAME, "expiry_year"))
                expiry_year_dropdown.select_by_value(str(self.expiry_year))

                # Select expiry month from dropdown
                expiry_month_dropdown = Select(self.driver.find_element(By.NAME, "expiry_month"))
                expiry_month_dropdown.select_by_value(str(self.expiry_month))

        return True
    
    def pay_now(self,url):
        driver = PayBooking.all_tabs.get(url,None) # Get the tab index for the url
        if driver is not None:
            # self.driver.switch_to.window(self.driver.window_handles[tab_index])
            # Check the return URL after opening the payment URL
            current_url = driver.current_url

            # Check if the return URL is the same as the initial URL
            if "/slip/" in current_url:
                context = {
                    "status":200,
                    "payment_status":"Already Paid"
                }
            elif current_url == url:
                # Submit the form
                driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
                current_url = driver.current_url

                # Check if the return URL indicates that the payment has already been made
                if "/slip/" in current_url:
                    context = {
                        "status":200,
                        "payment_status":"Payment successful"
                    }
                else:
                    error_message = self.get_error_msg(driver)
                    context = {
                        "status":400,
                        "payment_status":error_message
                    }
            else:
                error_message = self.get_error_msg()
                context = {
                    "status": 400,
                    "payment_status": error_message
                }
        else:
            context = {
                "status": 500,
                "payment_status": "No tab found that asosiated with the url or no card added"
            }
        driver.quit() # Close the browser
        PayBooking.all_tabs.pop(url)
        #driver.close() # close the current tab

        self.change_payment_status(url, context)
        return context