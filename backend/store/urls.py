from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CategoryViewSet,
    JerseyViewSet,
    OrderViewSet,
    create_razorpay_order,
    verify_razorpay_payment,
    admin_dashboard_stats,
    upload_jersey_image,
    CustomTokenObtainPairView,
    current_user_profile
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'jerseys', JerseyViewSet, basename='jersey')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    # JWT Authentication Endpoints
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', current_user_profile, name='current_user_profile'),

    # Image Upload & Compression Endpoint (supports with or without trailing slash)
    re_path(r'^upload/?$', upload_jersey_image, name='upload-jersey-image'),

    # Payments & Store Routes
    path('', include(router.urls)),
    path('payments/create-order/', create_razorpay_order, name='create-razorpay-order'),
    path('payments/verify/', verify_razorpay_payment, name='verify-razorpay-payment'),
    path('admin-stats/', admin_dashboard_stats, name='admin-dashboard-stats'),
]
