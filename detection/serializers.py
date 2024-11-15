from rest_framework import serializers
from .models import Cheque

class ChequeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cheque
        fields = ['transaction_id', 'chequeImg', 'croppedImg', 'accountNo', 'forgery_confidence', 'verification_status']
        read_only_fields = ['transaction_id', 'croppedImg', 'forgery_confidence', 'verification_status']
