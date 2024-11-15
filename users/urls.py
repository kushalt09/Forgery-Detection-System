from django.urls import path
from .views import csrf_token, RegisterView, LoginView, LogoutView, UserListView, UserDeleteView, UserDetailUpdateView, VerifyUserView, ChangePasswordView, SetPendingUserView

urlpatterns = [
    path("register", RegisterView.as_view()),
    path("login", LoginView.as_view()),
    path("logout", LogoutView.as_view()),
    path('csrf-token/', csrf_token, name='csrf_token'),
    path('', UserListView.as_view(), name='user-list'),
    path('<int:pk>/', UserDetailUpdateView.as_view(), name='user-detail-update'),
    path('delete/<int:pk>/', UserDeleteView.as_view(), name='user-delete'),
    path('<int:pk>/change_password/', ChangePasswordView.as_view(), name='user-change-password'),
    path('verify/<int:pk>/', VerifyUserView.as_view(), name='user-verify'),
    path('pending/<int:pk>/', SetPendingUserView.as_view(), name='user-pending'),
]
