from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from .models import AppUser

class DefaultAuthentication:

	def __init__(self):
		self.jwt_auth = JWTAuthentication()

	def authenticate(self, request):
		access_token = request.COOKIES.get('access_token')
		refresh_token = request.COOKIES.get('refresh_token')
		validated_token = None

		if access_token:
			try:
				validated_token = self.jwt_auth.get_validated_token(access_token)
			except Exception as e:
				if refresh_token:
					try:
						print("ACCESS TOKEN: ", access_token)
						print("REFRESH TOKEN: ", refresh_token)
						refresh = RefreshToken(refresh_token)
						new_access_token = str(refresh.access_token)
						validated_token = self.jwt_auth.get_validated_token(new_access_token)
						request.COOKIES['access_token'] = new_access_token
						print("NEW ACCESS TOKEN GENERATED: ", request.COOKIES['access_token'])
					except (TokenError, InvalidToken) as e:
						raise exceptions.AuthenticationFailed(f'Invalid refresh token: {e}')
				else:
					raise exceptions.AuthenticationFailed('No refresh token provided')

		else:
			raise exceptions.AuthenticationFailed('No access token provided')

		user = self.jwt_auth.get_user(validated_token)

		if not AppUser.objects.filter(pk=user.pk).exists():
			raise exceptions.AuthenticationFailed('User does not exist')

		request.user = user

		return user, request.COOKIES.get('access_token')


	def authenticate_header(self, request):
		"""
		Return the value of the WWW-Authenticate header in response to a
		request that was not authenticated.
		"""
		return 'Authentication realm="api"'
