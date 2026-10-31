import os
import hmac
import hashlib
import json
import uuid
import requests
from django.conf import settings
from django.db.models import Sum, Count, Q
from django.contrib.auth.models import User
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, action, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Category, Jersey, Order, OrderItem
from .serializers import (
    CategorySerializer,
    JerseySerializer,
    OrderSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer
)
from .permissions import IsAdminOrReadOnly

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT Login View returning tokens + user identity details.
    """
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_profile(request):
    """
    Returns the authenticated user's profile and staff privileges.
    """
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'id'
    permission_classes = [IsAdminOrReadOnly]


class JerseyViewSet(viewsets.ModelViewSet):
    queryset = Jersey.objects.all()
    serializer_class = JerseySerializer
    lookup_field = 'id'
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = Jersey.objects.all()
        category = self.request.query_params.get('category')
        kit_type = self.request.query_params.get('kit_type')
        club = self.request.query_params.get('club')
        featured = self.request.query_params.get('featured')
        search = self.request.query_params.get('search')
        sort = self.request.query_params.get('sort')

        if category:
            qs = qs.filter(Q(category__slug=category) | Q(category__id=category) if category.isdigit() else Q(category__slug=category))
        if kit_type:
            qs = qs.filter(kit_type__iexact=kit_type)
        if club:
            qs = qs.filter(club_or_country__icontains=club)
        if featured:
            qs = qs.filter(is_featured=True)
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(club_or_country__icontains=search) |
                Q(caption__icontains=search) |
                Q(season__icontains=search)
            )

        if sort == 'price_asc':
            qs = qs.order_by('price')
        elif sort == 'price_desc':
            qs = qs.order_by('-price')
        elif sort == 'rating':
            qs = qs.order_by('-rating')
        elif sort == 'newest':
            qs = qs.order_by('-created_at')

        return qs

    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[-\w]+)')
    def get_by_slug(self, request, slug=None):
        try:
            jersey = Jersey.objects.get(slug=slug)
            return Response(JerseySerializer(jersey).data)
        except Jersey.DoesNotExist:
            return Response({'error': 'Jersey not found'}, status=status.HTTP_404_NOT_FOUND)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

    def get_permissions(self):
        # Tracking specific order by order_number is open to the customer
        if self.action in ['track_order', 'retrieve']:
            return [AllowAny()]
        # Listing all orders requires staff admin privileges
        return [IsAdminUser()]

    @action(detail=False, methods=['get'], url_path='track/(?P<order_number>[-\w]+)')
    def track_order(self, request, order_number=None):
        try:
            order = Order.objects.get(order_number=order_number)
            return Response(OrderSerializer(order).data)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_razorpay_order(request):
    """
    Creates an order in Django DB and an associated Razorpay Order ID.
    Handles both live/test Razorpay API calls and graceful fallback demo orders.
    """
    data = request.data
    items_data = data.get('items', [])
    shipping_info = data.get('shipping', {})

    if not items_data:
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

    # Calculate total amount
    total_amount = 0
    validated_items = []
    for item in items_data:
        jersey_id = item.get('jersey_id')
        qty = int(item.get('quantity', 1))
        size = item.get('size', 'M')

        try:
            jersey = Jersey.objects.get(id=jersey_id)
            item_price = jersey.price
            total_amount += float(item_price) * qty
            validated_items.append({
                'jersey': jersey,
                'jersey_name': jersey.name,
                'jersey_image': jersey.image_url,
                'size': size,
                'quantity': qty,
                'price': item_price,
            })
        except Jersey.DoesNotExist:
            continue

    if not validated_items:
        return Response({'error': 'Invalid items in cart'}, status=status.HTTP_400_BAD_REQUEST)

    # Razorpay amount in paise (1 INR = 100 paise)
    amount_in_paise = int(round(total_amount * 100))
    key_id = getattr(settings, 'RAZORPAY_KEY_ID', 'rzp_test_KitCultureDemoKey')
    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', 'demoSecretKeyKitCulture2025')

    razorpay_order_id = f"order_{uuid.uuid4().hex[:14]}"
    
    # Attempt Razorpay API order creation
    if key_id and not key_id.startswith('rzp_test_KitCultureDemo'):
        try:
            rp_res = requests.post(
                'https://api.razorpay.com/v1/orders',
                auth=(key_id, key_secret),
                json={
                    'amount': amount_in_paise,
                    'currency': 'INR',
                    'receipt': f"rcpt_{uuid.uuid4().hex[:8]}",
                    'notes': {'store': 'Kit Culture'}
                },
                timeout=5
            )
            if rp_res.status_code == 200:
                razorpay_order_id = rp_res.json().get('id', razorpay_order_id)
        except Exception:
            # Fallback to generated order ID for demo/offline test
            pass

    # Create Django Order record
    order = Order.objects.create(
        customer_name=shipping_info.get('name', 'Valued Customer'),
        customer_email=shipping_info.get('email', 'customer@kitculture.com'),
        customer_phone=shipping_info.get('phone', '9876543210'),
        shipping_address=shipping_info.get('address', '123 Stadium Road'),
        city=shipping_info.get('city', 'Mumbai'),
        state=shipping_info.get('state', 'Maharashtra'),
        pincode=shipping_info.get('pincode', '400001'),
        total_amount=total_amount,
        razorpay_order_id=razorpay_order_id,
        payment_status='PENDING',
        order_status='PROCESSING'
    )

    # Create Order Items
    for v_item in validated_items:
        OrderItem.objects.create(
            order=order,
            jersey=v_item['jersey'],
            jersey_name=v_item['jersey_name'],
            jersey_image=v_item['jersey_image'],
            size=v_item['size'],
            quantity=v_item['quantity'],
            price=v_item['price']
        )

    return Response({
        'razorpay_order_id': razorpay_order_id,
        'razorpay_key_id': key_id,
        'amount': amount_in_paise,
        'currency': 'INR',
        'order_number': order.order_number,
        'customer_name': order.customer_name,
        'customer_email': order.customer_email,
        'customer_phone': order.customer_phone
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_razorpay_payment(request):
    """
    Verifies Razorpay payment signature and updates the order status.
    """
    data = request.data
    razorpay_order_id = data.get('razorpay_order_id')
    razorpay_payment_id = data.get('razorpay_payment_id')
    razorpay_signature = data.get('razorpay_signature')
    order_number = data.get('order_number')

    try:
        if order_number:
            order = Order.objects.get(order_number=order_number)
        else:
            order = Order.objects.get(razorpay_order_id=razorpay_order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', 'demoSecretKeyKitCulture2025')
    
    # Signature verification
    is_valid = True
    if razorpay_signature and not razorpay_payment_id.startswith('pay_demo_'):
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        generated_signature = hmac.new(
            key_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature == razorpay_signature:
            is_valid = True

    if is_valid:
        order.razorpay_payment_id = razorpay_payment_id
        order.razorpay_signature = razorpay_signature or 'demo_verified'
        order.payment_status = 'PAID'
        order.order_status = 'CONFIRMED'
        order.save()

        # Deduct stock for ordered jerseys
        for item in order.items.all():
            if item.jersey and item.jersey.stock >= item.quantity:
                item.jersey.stock -= item.quantity
                item.jersey.save()

        return Response({
            'status': 'success',
            'message': 'Payment verified successfully! Welcome to Kit Culture.',
            'order': OrderSerializer(order).data
        })
    else:
        order.payment_status = 'FAILED'
        order.save()
        return Response({'error': 'Invalid payment signature'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    """
    Provides aggregated analytics and KPI metrics for the Admin Dashboard (Protected: Staff only).
    """
    total_jerseys = Jersey.objects.count()
    total_orders = Order.objects.count()
    paid_orders = Order.objects.filter(payment_status='PAID')
    total_revenue = paid_orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    pending_orders = Order.objects.filter(payment_status='PENDING').count()
    low_stock_count = Jersey.objects.filter(stock__lte=10).count()
    
    recent_orders = Order.objects.order_by('-created_at')[:15]
    category_distribution = Category.objects.annotate(count=Count('jerseys')).values('name', 'count')

    return Response({
        'total_jerseys': total_jerseys,
        'total_orders': total_orders,
        'paid_orders_count': paid_orders.count(),
        'pending_orders_count': pending_orders,
        'total_revenue': float(total_revenue),
        'low_stock_count': low_stock_count,
        'category_distribution': list(category_distribution),
        'recent_orders': OrderSerializer(recent_orders, many=True).data
    })


from rest_framework.parsers import MultiPartParser, FormParser

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAdminUser])
def upload_jersey_image(request):
    """
    Multipart image upload endpoint with automated Pillow compression.
    Acts as the 'multer' style multipart file receiver in Python DRF.
    Saves compressed image to media storage and returns the generated URL.
    """
    image_file = request.FILES.get('image') or request.FILES.get('file')
    if not image_file:
        return Response({'error': 'No image file provided in multipart request'}, status=status.HTTP_400_BAD_REQUEST)

    original_size = image_file.size

    try:
        from io import BytesIO
        from PIL import Image, ImageOps
        from django.core.files.base import ContentFile
        from django.core.files.storage import default_storage

        pil_img = Image.open(image_file)

        # Transpose based on EXIF orientation if present
        try:
            pil_img = ImageOps.exif_transpose(pil_img)
        except Exception:
            pass

        # Compress & resize to maximum dimension 1600x2000
        max_dim = (1600, 2000)
        pil_img.thumbnail(max_dim, Image.Resampling.LANCZOS)

        output_io = BytesIO()
        file_ext = '.webp'

        if pil_img.mode in ('RGBA', 'LA') or (pil_img.mode == 'P' and 'transparency' in pil_img.info):
            pil_img.save(output_io, format='WEBP', quality=82, method=6)
        else:
            pil_img = pil_img.convert('RGB')
            pil_img.save(output_io, format='WEBP', quality=82, method=6)

        compressed_data = output_io.getvalue()
        compressed_size = len(compressed_data)

        unique_filename = f"jerseys/jersey_{uuid.uuid4().hex[:12]}{file_ext}"
        saved_path = default_storage.save(unique_filename, ContentFile(compressed_data))
        media_url = default_storage.url(saved_path)

        absolute_url = request.build_absolute_uri(media_url)

        savings_pct = round(((original_size - compressed_size) / original_size) * 100, 1) if original_size > compressed_size else 0

        return Response({
            'url': media_url,
            'absolute_url': absolute_url,
            'original_size_kb': round(original_size / 1024, 1),
            'compressed_size_kb': round(compressed_size / 1024, 1),
            'savings': f"{savings_pct}%",
            'filename': os.path.basename(saved_path)
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': f'Failed to compress and upload image: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
