from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from rest_framework import generics  # Ensure this import is here
from .serializers import UserSerializer
from .models import User
import jwt, datetime
import random
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from .models import User
from django.db import IntegrityError
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.core.exceptions import ObjectDoesNotExist

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
class UserDetailUpdateView(APIView):
    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


from .utils import send_welcome_email

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        try:
            if serializer.is_valid(raise_exception=True):
                user = serializer.save()

                # Send welcome email after successful registration
                send_welcome_email(user.email, user.name)

                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                print(serializer.errors)  # Log the validation errors
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            if 'unique constraint' in str(e):
                return Response({"error": "Email or phone number already in use."}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"error": "Database error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValidationError as e:
            return Response({"error": e.detail}, status=status.HTTP_400_BAD_REQUEST)



class LoginView(APIView):
    def post(self, request):
        phone = request.data["phone"]
        password = request.data["password"]

        user = User.objects.filter(phone=phone).first()

        if user is None:
            raise AuthenticationFailed("User not found!")

        if not user.check_password(password):
            raise AuthenticationFailed("Incorrect password!")

        payload = {
            "id": user.id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            "iat": datetime.datetime.utcnow(),
        }

        token = jwt.encode(payload, "secret", algorithm="HS256")

        response = Response()

        response.set_cookie(key="jwt", value=token, httponly=True)
        user_serializer = UserSerializer(user)
        response.data = {**user_serializer.data, "jwt": token}
        return response

class LogoutView(APIView):
    def post(self, request):
        response = Response()
        response.delete_cookie("jwt")
        response.delete_cookie("csrftoken")  # Ensure CSRF token is also cleared
        response.data = {"message": "success"}
        return response


class VerifyUserView(APIView):
    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            if user.is_verified:
                return Response({"detail": "User is already verified"}, status=status.HTTP_400_BAD_REQUEST)

            # Generate the next unique account number
            last_user = User.objects.exclude(account_number=None).order_by('-account_number').first()
            if last_user and last_user.account_number.isdigit():
                next_account_number = str(int(last_user.account_number) + 1).zfill(8)
            else:
                next_account_number = '76543210'

            # Ensure the account number is unique
            while User.objects.filter(account_number=next_account_number).exists():
                next_account_number = str(int(next_account_number) + 1).zfill(8)

            user.is_verified = True
            user.account_number = next_account_number
            user.save()

            return Response({"detail": "User verified successfully", "account_number": user.account_number})
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
import random
import string
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

class ChangePasswordView(APIView):
    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            
            # Generate a new random password
            new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
            
            # Set the new password
            user.set_password(new_password)
            user.save()

            # Send the new password to the user's email
            send_password_email(user.email, user.name, new_password)

            return Response({"detail": "Password updated successfully"})
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def send_password_email(user_email, user_name, new_password):
    subject = "Your New Password"
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user_email]

    message = render_to_string('email/new-password-email.html', {
        'name': user_name,
        'password': new_password
    })

    send_mail(subject, message, from_email, recipient_list)

class SetPendingUserView(APIView):
    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            if user.is_verified:
                return Response({"detail": "User is already verified"}, status=status.HTTP_400_BAD_REQUEST)
            
            user.is_pending = True
            user.is_verified = False
            user.save()

            return Response({"detail": "User status set to pending"})
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



def csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

from .utils import send_pending_email  # Ensure this import is added

class SetPendingUserView(APIView):
    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            if user.is_verified:
                return Response({"detail": "User is already verified"}, status=status.HTTP_400_BAD_REQUEST)
            
            user.is_pending = True
            user.is_verified = False
            user.save()

            # Send email to the user
            send_pending_email(user.email, user.name)

            return Response({"detail": "User status set to pending"})
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from .utils import send_verification_email  # Ensure this import is added

class VerifyUserView(APIView):
    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            if user.is_verified:
                return Response({"detail": "User is already verified"}, status=status.HTTP_400_BAD_REQUEST)

            # Generate the next unique account number
            last_user = User.objects.exclude(account_number=None).order_by('-account_number').first()
            if last_user and last_user.account_number.isdigit():
                next_account_number = str(int(last_user.account_number) + 1).zfill(8)
            else:
                next_account_number = '76543210'

            # Ensure the account number is unique
            while User.objects.filter(account_number=next_account_number).exists():
                next_account_number = str(int(next_account_number) + 1).zfill(8)

            user.is_verified = True
            user.account_number = next_account_number
            user.save()

            # Send verification email to the user
            send_verification_email(user.email, user.name, user.account_number)

            return Response({"detail": "User verified successfully", "account_number": user.account_number})
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
