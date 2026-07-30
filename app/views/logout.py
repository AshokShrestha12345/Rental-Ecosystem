

from django.shortcuts import render

def logout(request):

    request.session.flush()

