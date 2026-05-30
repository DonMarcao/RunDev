import stripe
from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from accounts.models import UserProfile

stripe.api_key = settings.STRIPE_SECRET_KEY


@login_required
def checkout_view(request):
    if request.method == 'POST':
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'gbp',
                    'product_data': {
                        'name': 'RunDev Premium',
                        'description': 'Unlock all 4 worlds + leaderboard',
                    },
                    'unit_amount': 499,  # £4.99
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=request.build_absolute_uri('/payments/success/'),
            cancel_url=request.build_absolute_uri('/payments/cancel/'),
            metadata={'user_id': request.user.id}
        )
        return redirect(session.url, code=303)
    return render(request, 'payments/checkout.html')


@login_required
def success_view(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    profile.is_premium = True
    profile.save()
    return render(request, 'payments/success.html')


@login_required
def cancel_view(request):
    return render(request, 'payments/cancel.html')


@csrf_exempt
def webhook_view(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session['metadata']['user_id']
        profile = UserProfile.objects.get(user_id=user_id)
        profile.is_premium = True
        profile.save()

    return HttpResponse(status=200)