from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from store.views import upload_jersey_image

urlpatterns = [
    path('admin/', admin.site.urls),
    # Direct upload routes (with or without trailing slash)
    re_path(r'^api/upload/?$', upload_jersey_image, name='root-upload-jersey-image'),
    path('api/', include('store.urls')),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
