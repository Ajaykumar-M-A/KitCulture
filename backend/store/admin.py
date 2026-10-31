from django.contrib import admin
from .models import Category, Jersey, Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('jersey', 'jersey_name', 'size', 'quantity', 'price', 'custom_name', 'custom_number')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Jersey)
class JerseyAdmin(admin.ModelAdmin):
    list_display = ('name', 'club_or_country', 'season', 'kit_type', 'price', 'stock', 'badge', 'is_featured')
    list_filter = ('category', 'kit_type', 'season', 'is_featured')
    search_fields = ('name', 'club_or_country', 'caption')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('price', 'stock', 'is_featured', 'badge')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_name', 'customer_email', 'total_amount', 'payment_status', 'order_status', 'created_at')
    list_filter = ('payment_status', 'order_status', 'created_at')
    search_fields = ('order_number', 'customer_name', 'customer_email', 'razorpay_order_id', 'razorpay_payment_id')
    inlines = [OrderItemInline]
