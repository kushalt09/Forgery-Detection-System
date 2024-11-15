from django.http import JsonResponse
from keras.preprocessing import image
import tensorflow as tf
import numpy as np
import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.conf import settings
from .serializers import ChequeSerializer
from .models import Cheque
from users.models import User

# Load the TensorFlow model
model = tf.keras.models.load_model("saved_model/my_model")

@api_view(['GET'])
def get_transaction(request, transaction_id):
    # Retrieve the transaction by transaction_id
    transaction = get_object_or_404(Cheque, transaction_id=transaction_id)

    # Get the user associated with this transaction by account number
    user = get_object_or_404(User, account_number=transaction.accountNo)

    # Prepare the response data
    response_data = {
        'transaction_id': str(transaction.transaction_id),
        'accountNo': transaction.accountNo,
        'username': user.name,  # Include the user's name
        'forgery_confidence': transaction.forgery_confidence,
        'verification_status': transaction.verification_status,
        'signImg': user.signImg.url if user.signImg else None,  # Include the user's original signature
        'chequeImg': transaction.chequeImg.url if transaction.chequeImg else None,
        'croppedImg': transaction.croppedImg.url if transaction.croppedImg else None,
        'createdAt': transaction.created_at.isoformat(),
    }

    return Response(response_data, status=status.HTTP_200_OK)
@api_view(['GET'])
def get_transactions(request):
    transactions = Cheque.objects.all()

    # Prepare the response data for each transaction
    response_data = []
    for transaction in transactions:
        user = get_object_or_404(User, account_number=transaction.accountNo)
        data = {
            'transaction_id': str(transaction.transaction_id),
            'accountNo': transaction.accountNo,
            'username': user.name,  # Include the user's name
            'forgery_confidence': transaction.forgery_confidence,
            'verification_status': transaction.verification_status,
            'signImg': user.signImg.url if user.signImg else None,  # Include the user's original signature
            'chequeImg': transaction.chequeImg.url if transaction.chequeImg else None,
            'croppedImg': transaction.croppedImg.url if transaction.croppedImg else None,
            'createdAt': transaction.created_at.isoformat(),
        }
        response_data.append(data)

    return Response(response_data, status=status.HTTP_200_OK)

@api_view(['POST'])
def check_forgery(request):
    serializer = ChequeSerializer(data=request.data)
    if serializer.is_valid():
        chequeImgFile = serializer.validated_data['chequeImg']
        accountNo = serializer.validated_data['accountNo']

        try:
            user = User.objects.get(account_number=accountNo)
        except User.DoesNotExist:
            return Response({"error": "User with this account number does not exist."}, status=status.HTTP_404_NOT_FOUND)

        # Save the original cheque image in 'signatures/' directory
        chequeImgPath = save_image(chequeImgFile, 'signatures')

        # Create the Cheque object
        cheque = Cheque.objects.create(
            chequeImg=chequeImgFile,  # Storing the original image reference
            accountNo=accountNo,
            forgery_confidence=0.0,  # Default value
            verification_status='pending',  # Default status
        )

        # Handle cropping and save the cropped image in 'cropped_signatures/' directory
        croppedImgFile = request.FILES.get('croppedImg')  # Note the key used here matches the frontend
        if croppedImgFile:
            cropped_image_path = save_cropped_image(croppedImgFile, cheque.transaction_id)
            cheque.croppedImg = cropped_image_path
        else:
            cheque.croppedImg = cheque.chequeImg  # If no cropping, use the original cheque image

        cheque.save()

        # Retrieve the original user signature image path
        originalImgPath = os.path.join(settings.MEDIA_ROOT, str(user.signImg))

        # Prepare images for prediction
        x = prepare_image_for_prediction(chequeImgPath)
        y = prepare_image_for_prediction(originalImgPath)

        # Perform prediction
        y_pred, confidence = perform_prediction(x, y)

        # Update the cheque object with the prediction results
        cheque.forgery_confidence = float(confidence * 100)
        cheque.verification_status = 'forged' if y_pred == 1 else 'real'
        cheque.save()

        # Build URLs for the images
        originalSignImgUrl = request.build_absolute_uri(settings.MEDIA_URL + str(user.signImg))
        chequeImgUrl = request.build_absolute_uri(settings.MEDIA_URL + cheque.chequeImg.name)
        croppedImgUrl = request.build_absolute_uri(settings.MEDIA_URL + cheque.croppedImg.name)

        # Return the response with all image URLs
        return Response({
            "transaction_id": cheque.transaction_id,
            "originalSignImg": originalSignImgUrl,
            "chequeImg": chequeImgUrl,
            "status": cheque.verification_status,
            "confidence": float(confidence * 100),
            "croppedImg": croppedImgUrl
        })

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def save_image(image, directory):
    image_dir = os.path.join(settings.MEDIA_ROOT, directory)
    os.makedirs(image_dir, exist_ok=True)
    image_path = os.path.join(image_dir, image.name)
    
    with open(image_path, 'wb+') as destination:
        for chunk in image.chunks():
            destination.write(chunk)
    
    return image_path  # Return the path where the image is saved

def save_cropped_image(image, transaction_id):
    cropped_image_dir = os.path.join(settings.MEDIA_ROOT, 'cropped_signatures/')
    os.makedirs(cropped_image_dir, exist_ok=True)
    cropped_image_path = os.path.join(cropped_image_dir, f'{transaction_id}.png')

    with open(cropped_image_path, 'wb+') as destination:
        for chunk in image.chunks():
            destination.write(chunk)

    return os.path.join('cropped_signatures', f'{transaction_id}.png')  # Correctly returning the relative path


def prepare_image_for_prediction(image_path):
    img = image.load_img(image_path, target_size=(100, 100))
    img = image.img_to_array(img)
    img = tf.image.rgb_to_grayscale(img)
    img = np.expand_dims(img, axis=0)
    img = img / 255.0
    return img

def perform_prediction(x, y):
    y_pred = model.predict([x, y])
    confidence = np.max(y_pred)
    y_pred = np.argmax(y_pred)
    return y_pred, confidence
