from operator import imod
from re import T
from sqlite3 import IntegrityError
from urllib import response
from urllib.robotparser import RequestRate
from django.core import serializers
from django.shortcuts import render
from django.template import context
from rest_framework.decorators import api_view
from django.contrib.auth.models import AbstractUser, User
from rest_framework.response import Response
from .serializers import UserSerializerClass
from .models import AppUser
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, logout
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.permissions import IsAuthenticated
import json
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password

@api_view(["POST"])
def signup(request):
	print("REGISTER header:", request.headers)
	print("REGISTER body:", request.data)
	serializer = UserSerializerClass(data=request.data)
	if serializer.is_valid():
		try:
			serializer.save()
			user = AppUser.objects.get(username=request.data['username'])
			serializer = UserSerializerClass(user)

			data = {
				'message': 'Login successful',
				'user': {
					'username': user.username,
					'nickname': user.nickname,
					'avatar': user.avatar.url if user.avatar else None
				}
			}
			return Response(data, status=status.HTTP_201_CREATED)
		except IntegrityError as e:
			return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
	
	return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def login(request):
	username = request.data.get('username')
	password = request.data.get('password')

	if not all ([username, password]):
		return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

	authenticated_user: AbstractUser | None = authenticate(username=username, password=password)
	if authenticated_user is not None:
		user = AppUser.objects.get(username=username)

		#login(request, user)
		response_data = {
			'message': 'Login successful',
			'user': {
				'username': user.username,
				'nickname': user.nickname,
				'avatar': user.avatar.url,
				#'score': getattr(user, 'score', '0'),
				#'jwt_token': encoded_token,
			}
		}

		token, _ = Token.objects.get_or_create(user=user)
		response_data['token'] = token.key

		return Response(response_data, status=status.HTTP_200_OK)
	else:
		return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

#shit
@api_view(["GET"])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def TestView(request):

	return Response({"message": "test view page"})


@api_view(["GET"])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout(request):

	request.user.auth_token.delete()
	return Response({"message": "logout was successful"})


@permission_classes([IsAuthenticated])
def set_nickname(request):
	nickname = request.data.get('nickname')

	user = request.user
	if AppUser.objects.filter(nickname__iexact=nickname).exclude(pk=user.pk).exists():
		return Response({"error": "This nickname is already in use."}, status=status.HTTP_400_BAD_REQUEST)

	if not nickname:
		user.nickname = user.username

	else:
		user.nickname = nickname
	user.save()
	return Response({"message": nickname}, status=status.HTTP_200_OK) #???? might delete


@login_required
def upload_avatar(request):
	try:
		user = request.user
		file = request.FILES.get('image')
		
		if file.size == 0:
			return Response({'error': 'File is empty'}, status=status.HTTP_400_BAD_REQUEST)
		elif not file.content_type.startswith('image'):
			return Response({'error': 'Invalid file type. Only PNG, JPG, JPEG, and GIF are allowed.'}, status=status.HTTP_400_BAD_REQUEST)
	
		user.avatar = file
		user.save()
		print("user avatar:", user.avatar)
		return Response({'message': 'Avatar updated successfully.'}, status=status.HTTP_200_OK)
	
	except Exception as e:
		return Response({"error": str(e)}, status=status.HTTP_409_CONFLICT)


@api_view(["POST"])
@login_required
def update_user_info(request):
	print("Request User:", request.headers)

	try:
		user = request.user
		new_username = request.data.get('new_username')
		new_nickname = request.data.get('nickname')
		new_avatar = request.FILES.get('image')
		old_password = request.data.get('old_password')
		new_password = request.data.get('new_password')
		confirm_password = request.data.get('confirm_password')

		if new_username:
			if AppUser.objects.filter(username__iexact=new_username).exclude(pk=user.pk).exists():
				return Response({'error': 'This username is already taken.'}, status=status.HTTP_400_BAD_REQUEST)
			user.username = new_username
		
		if new_nickname:
			set_nickname(request)

		if new_avatar:
			upload_avatar(request)
		
		if old_password and new_password and confirm_password:
			print("user.password old_password new_password :", user.password, old_password, new_password)
			if not check_password(old_password, user.password):
				return Response({'error': 'Incorrect old password.'}, status=status.HTTP_400_BAD_REQUEST)
			if new_password != confirm_password:
				return Response({'error': "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)
			user.password = make_password(new_password)

		user.save()
		return Response({'message': 'User info updated successfully.'}, status=status.HTTP_200_OK)
	
	except Exception as e:
		return Response({'error': str(e)}, status=status.HTTP_409_CONFLICT)