from django.db import models
import uuid

class Cheque(models.Model):
    transaction_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    chequeImg = models.ImageField(upload_to='signatures/')
    croppedImg = models.ImageField(upload_to='cropped_signatures/', null=True, blank=True)
    accountNo = models.CharField(max_length=100)
    forgery_confidence = models.FloatField(null=True, blank=True)
    verification_status = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Cheque {self.transaction_id} for account {self.accountNo}"
    
