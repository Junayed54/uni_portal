# # your_project_name/asgi.py

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from quiz.routing import websocket_urlpatterns # Import your routing configuration

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quiz_portal.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": 
        URLRouter(
            websocket_urlpatterns  # Your WebSocket URLs
        )
})
# import os
# import django
# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from quiz.routing import websocket_urlpatterns


# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quiz_portal.settings')

# application = get_asgi_application()

