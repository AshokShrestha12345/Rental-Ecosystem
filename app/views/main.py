from django.shortcuts import render


from .logout import logout

def index(request):
    logout(request)
    return render(request, 'index.html')