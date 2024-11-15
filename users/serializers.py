from rest_framework import serializers
from .models import User
import re



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "phone", "email", "isAdmin", "address", "password", "signImg", 'citizenshipImg', 'account_number', 'is_verified', 'is_pending']
        extra_kwargs = {"password": {"write_only": True}}

    def validate_phone(self, value):
        if not re.match(r'^9\d{9}$', value):
            raise serializers.ValidationError("Please input a proper phone number. The number must be 10 digits and start with 9.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance
