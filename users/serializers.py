from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    phone_number = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        phone_number = attrs.get('phone_number')
        password = attrs.get('password')

        if phone_number and password:
            user = authenticate(request=self.context.get('request'), phone_number=phone_number, password=password)
            if not user:
                raise serializers.ValidationError('Invalid phone number or password.')

            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include "phone_number" and "password".')

class UserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=False)
    email = serializers.EmailField(required=True)
    address = serializers.CharField(max_length=255, required=False, allow_blank=True)
    other_information = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')], required=False, allow_blank=True)
    secondary_phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    facebook_profile = serializers.URLField(required=False, allow_blank=True)
    twitter_profile = serializers.URLField(required=False, allow_blank=True)
    linkedin_profile = serializers.URLField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    preferences = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'phone_number', 'password', 'role', 'email', 'address',
            'other_information', 'profile_picture', 'date_of_birth', 'gender',
            'secondary_phone_number', 'facebook_profile', 'twitter_profile',
            'linkedin_profile', 'bio', 'preferences'
        )
        extra_kwargs = {'password': {'write_only': True}}
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise ValidationError("A user with this email already exists. Please try another email.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            phone_number=validated_data['phone_number'],
            email=validated_data['email'],
            password=validated_data['password'],
            username=validated_data.get('username', ''),  # Username is optional
            role=validated_data.get('role', User.STUDENT),  # Default to 'student' if no role is provided
            address=validated_data.get('address', ''),
            other_information=validated_data.get('other_information', ''),
            profile_picture=validated_data.get('profile_picture'),
            date_of_birth=validated_data.get('date_of_birth'),
            gender=validated_data.get('gender'),
            secondary_phone_number=validated_data.get('secondary_phone_number', ''),
            facebook_profile=validated_data.get('facebook_profile', ''),
            twitter_profile=validated_data.get('twitter_profile', ''),
            linkedin_profile=validated_data.get('linkedin_profile', ''),
            bio=validated_data.get('bio', ''),
            preferences=validated_data.get('preferences', {})
        )
        return user

    def update(self, instance, validated_data):
        # Update user instance with new data
        instance.address = validated_data.get('address', instance.address)
        instance.other_information = validated_data.get('other_information', instance.other_information)

        # Handle file upload for profile picture
        if 'profile_picture' in validated_data:
            instance.profile_picture = validated_data['profile_picture']
        
        instance.date_of_birth = validated_data.get('date_of_birth', instance.date_of_birth)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.secondary_phone_number = validated_data.get('secondary_phone_number', instance.secondary_phone_number)
        instance.facebook_profile = validated_data.get('facebook_profile', instance.facebook_profile)
        instance.twitter_profile = validated_data.get('twitter_profile', instance.twitter_profile)
        instance.linkedin_profile = validated_data.get('linkedin_profile', instance.linkedin_profile)
        instance.bio = validated_data.get('bio', instance.bio)
        instance.preferences = validated_data.get('preferences', instance.preferences)
        
        # Update fields that are editable
        instance.username = validated_data.get('username', instance.username)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.email = validated_data.get('email', instance.email)
        instance.role = validated_data.get('role', instance.role)
        
        # Update password if provided
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        
        instance.save()
        return instance



class RequestOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True)
