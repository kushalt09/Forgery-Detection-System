# users/utils.py
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

def send_welcome_email(user_email, user_name):
    subject = "Welcome to HamroBank"
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user_email]

    # Render the email template with user-specific data
    message = render_to_string('email/welcome-email.html', {'name': user_name})


    send_mail(subject, message, from_email, recipient_list)

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

def send_pending_email(user_email, user_name):
    subject = "Important: Visit Your Nearest Bank Branch"
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user_email]

    message = render_to_string('email/pending-status-email.html', {'name': user_name})

    send_mail(subject, message, from_email, recipient_list)


from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

def send_verification_email(user_email, user_name, account_number):
    subject = "Congratulations! Your Account Has Been Verified"
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user_email]

    message = render_to_string('email/verification-email.html', {
        'name': user_name,
        'account_number': account_number
    })

    send_mail(subject, message, from_email, recipient_list)
