from operator import imod
from re import T
from sqlite3 import IntegrityError
from urllib import response
from urllib.robotparser import RequestRate
from django.core import serializers
from django.shortcuts import render
from django.template import context
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
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
from django.http import JsonResponse

@api_view(["POST"])
def signup(request):
		
	serializer = UserSerializerClass(data=request.data)
	if serializer.is_valid():
		try:
			serializer.save()
		
			user = AppUser.objects.get(username=request.data['username'])
			token = Token.objects.get(user=user)

			serializer = UserSerializerClass(user)

			data = {
				"user": serializer.data,
				"token": token.key
			}
			return Response(data, status=status.HTTP_201_CREATED)
		except IntegrityError as e:
			return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
	
	return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

#return Response({"message": "sign up page"})


@api_view(["POST"])
def login(request):

	data = json.loads(request.data)
	authenticate_user = authenticate(username=data['username'], password=data['password'])

	if authenticate_user is not None:
		user = AppUser.objects.get(username=data['username'])
		serializer = UserSerializerClass(user)

		response_data = {
			'user': serializer.data
		}

		token, created_token = Token.objects.get_or_create(user=user)

		if token:
			response_data['token'] = token.key
		elif created_token:
			response_data['token'] = created_token.key
		return JsonResponse(response_data, status=status.HTTP_200_OK)

	return JsonResponse({"detail": "User not found"}, status=status.HTTP_404_BAD_REQUEST)
#return Response({"message": "login page"})


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
	#logout(request)

	return Response({"message": "logout was successful"})
