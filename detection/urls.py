from django.urls import path
from .views import check_forgery, get_transactions, get_transaction

urlpatterns = [
    path('check_forgery/', check_forgery, name='check_forgery'),
    path('transactions/', get_transactions, name='get_transactions'),
    path('transaction/<uuid:transaction_id>/', get_transaction, name='get_transaction'),
]
