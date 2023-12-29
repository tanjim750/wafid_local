"""wafid_autopay URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path("pay-now/",views.PayNow.as_view(), name='pay_now'),
    # path("pay-with-selenium/",views.PayWithSelenium.as_view(), name='pay-with-selenium'),
    path("login/",views.LoginView.as_view(), name='login'),
    path("",views.HomeView.as_view(), name='home'),
    path("add-link",views.AddLink.as_view(), name='add_link'),
    path("remove-link",views.RemoveLink.as_view(), name='remove_link'),
    path("update-link",views.UpdateLink.as_view(), name='update_link'),
    path("add-to-tab",views.AddToTab.as_view(), name='add_to_tab'),
    path("booking",views.BookingView.as_view(), name='booking'),
    path("booking-links",views.BookingLinkView.as_view(), name='booking_links'),
    path("book-again",views.BookAgainView.as_view(), name='book_again'),
    path("logout",views.LogoutView.as_view(), name='logout'),
]
