from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from store.models import Category, Jersey, Order

class KitCultureAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create test admin user
        self.admin_user = User.objects.create_superuser(
            username='admin_test',
            email='admin@kitculture.com',
            password='testpassword123'
        )
        # Create regular user
        self.regular_user = User.objects.create_user(
            username='buyer',
            email='buyer@example.com',
            password='userpassword123'
        )
        # Create category
        self.category = Category.objects.create(
            name='Club Kits',
            slug='club-kits',
            description='European Club Shirts'
        )
        # Create test jersey
        self.jersey = Jersey.objects.create(
            name='Real Madrid 2024/25 Home',
            slug='real-madrid-2024-25-home',
            category=self.category,
            club_or_country='Real Madrid',
            season='2024/25',
            kit_type='Home',
            caption='The Regal White of Champions',
            description='High performance jersey',
            price=2999.00,
            original_price=3999.00,
            image_url='https://images.unsplash.com/photo-1517466787929-bc90951d0974',
            stock=25
        )

    def test_public_can_list_jerseys(self):
        response = self.client.get('/api/jerseys/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_jwt_auth_login_successful(self):
        response = self.client.post('/api/auth/token/', {
            'username': 'admin_test',
            'password': 'testpassword123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertTrue(response.data['user']['is_staff'])

    def test_unauthorized_user_cannot_create_jersey(self):
        payload = {
            'name': 'Hacked Kit',
            'category': self.category.id,
            'club_or_country': 'Fake Club',
            'caption': 'Unauthorized',
            'description': 'Test',
            'price': 1999.00,
            'image_url': 'https://example.com/test.jpg',
            'stock': 10
        }
        response = self.client.post('/api/jerseys/', payload)
        # Should be forbidden or unauthorized
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_admin_with_jwt_can_create_jersey(self):
        # 1. Obtain JWT token
        token_res = self.client.post('/api/auth/token/', {
            'username': 'admin_test',
            'password': 'testpassword123'
        })
        access_token = token_res.data['access']

        # 2. Make authenticated POST request
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        payload = {
            'name': 'Arsenal 2024/25 Away',
            'category': self.category.id,
            'club_or_country': 'Arsenal',
            'season': '2024/25',
            'kit_type': 'Away',
            'caption': 'North London Forever',
            'description': 'Black and green heritage away kit',
            'price': 2899.00,
            'image_url': 'https://images.unsplash.com/photo-1522778119026-d647f0596c20',
            'stock': 30
        }
        response = self.client.post('/api/jerseys/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Arsenal 2024/25 Away')

    def test_create_razorpay_order_endpoint(self):
        payload = {
            'shipping': {
                'name': 'John Doe',
                'email': 'john@example.com',
                'phone': '9876543210',
                'address': 'Street 1',
                'city': 'Mumbai',
                'state': 'MH',
                'pincode': '400001'
            },
            'items': [
                {
                    'jersey_id': self.jersey.id,
                    'size': 'L',
                    'quantity': 1
                }
            ]
        }
        response = self.client.post('/api/payments/create-order/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('razorpay_order_id', response.data)
        self.assertIn('order_number', response.data)

    def test_upload_image_endpoint(self):
        from io import BytesIO
        from PIL import Image
        from django.core.files.uploadedfile import SimpleUploadedFile

        # Create dummy image
        img = Image.new('RGB', (100, 100), color='red')
        img_io = BytesIO()
        img.save(img_io, format='JPEG')
        img_file = SimpleUploadedFile("test.jpg", img_io.getvalue(), content_type="image/jpeg")

        # 1. Admin JWT Auth
        token_res = self.client.post('/api/auth/token/', {
            'username': 'admin_test',
            'password': 'testpassword123'
        })
        access_token = token_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # 2. Upload image to /api/upload/
        response = self.client.post('/api/upload/', {'image': img_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('url', response.data)
        self.assertTrue(response.data['url'].startswith('/media/jerseys/'))
