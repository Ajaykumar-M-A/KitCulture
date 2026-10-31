from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .models import Category, Jersey, Order, OrderItem

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT Token Serializer that returns user profile and admin status along with tokens.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'is_staff': self.user.is_staff,
            'is_superuser': self.user.is_superuser,
        }
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_superuser']


class CategorySerializer(serializers.ModelSerializer):
    jerseys_count = serializers.IntegerField(source='jerseys.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image_url', 'jerseys_count', 'created_at']


class JerseySerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    category_name = serializers.ReadOnlyField(source='category.name')
    sizes = serializers.SerializerMethodField()

    class Meta:
        model = Jersey
        fields = [
            'id', 'name', 'slug', 'category', 'category_name', 'club_or_country',
            'season', 'kit_type', 'caption', 'description', 'price',
            'original_price', 'image_url', 'back_image_url', 'badge',
            'available_sizes', 'sizes', 'stock', 'rating', 'review_count',
            'is_featured', 'customization_available', 'created_at', 'updated_at'
        ]

    def get_sizes(self, obj):
        if obj.available_sizes:
            return [s.strip() for s in obj.available_sizes.split(',') if s.strip()]
        return ['S', 'M', 'L', 'XL', 'XXL']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'jersey', 'jersey_name', 'jersey_image', 'size',
            'quantity', 'price'
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'customer_email',
            'customer_phone', 'shipping_address', 'city', 'state', 'pincode',
            'total_amount', 'razorpay_order_id', 'razorpay_payment_id',
            'payment_status', 'order_status', 'items', 'created_at'
        ]
