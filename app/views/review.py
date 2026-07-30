
from app.models import Room, Review
from django.shortcuts import redirect


def review(request):
    if request.method == 'POST':

        property_id = request.POST.get('property_id')
        property_id = int(property_id)
        rating = request.POST.get('rating')
        title = request.POST.get('title')
        review_text = request.POST.get('review')

        room = Room.objects.get(id=property_id)
        review = Review(property_id=room, rating=rating, title=title, review=review_text)
        review.save()

        return redirect('tenant')


def delete_review(request, id):
    review = Review.objects.get(id=id)
    review.delete()
    return redirect('tenant')