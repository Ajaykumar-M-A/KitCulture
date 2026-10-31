import uuid
from django.db import models
from django.utils.text import slugify

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Jersey(models.Model):
    KIT_TYPES = (
        ('Home', 'Home'),
        ('Away', 'Away'),
        ('Third', 'Third'),
        ('Retro', 'Retro Classics'),
        ('Special Edition', 'Special Edition'),
    )

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='jerseys')
    club_or_country = models.CharField(max_length=120)
    season = models.CharField(max_length=50, default='2024/25')
    kit_type = models.CharField(max_length=50, choices=KIT_TYPES, default='Home')
    caption = models.CharField(max_length=250, help_text="Attractive marketing catchphrase / caption")
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    image_url = models.CharField(max_length=800, help_text="Image URL or uploaded media path")
    back_image_url = models.CharField(max_length=800, blank=True, null=True, help_text="Back image URL or uploaded media path")
    badge = models.CharField(max_length=50, blank=True, default='POPULAR')
    available_sizes = models.CharField(max_length=100, default='S,M,L,XL,XXL')
    stock = models.PositiveIntegerField(default=50)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.9)
    review_count = models.PositiveIntegerField(default=84)
    is_featured = models.BooleanField(default=True)
    customization_available = models.BooleanField(default=True, help_text="Allow custom name and number printing")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Jersey.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.season})"


class Order(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
    )
    ORDER_STATUS_CHOICES = (
        ('PROCESSING', 'Processing'),
        ('CONFIRMED', 'Confirmed'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
    )

    order_number = models.CharField(max_length=50, unique=True, blank=True)
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    shipping_address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=20)
    
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Razorpay Details
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    order_status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='PROCESSING')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"KC-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.order_number} - {self.customer_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    jersey = models.ForeignKey(Jersey, on_delete=models.SET_NULL, null=True, blank=True)
    jersey_name = models.CharField(max_length=200)
    jersey_image = models.URLField(max_length=800, blank=True, null=True)
    size = models.CharField(max_length=10, default='L')
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    custom_name = models.CharField(max_length=50, blank=True, null=True)
    custom_number = models.CharField(max_length=10, blank=True, null=True)

    def __str__(self):
        return f"{self.quantity}x {self.jersey_name} ({self.size})"
