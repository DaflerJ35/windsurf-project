import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PaymentService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  
  // Your Cloud Functions URL
  final String cloudFunctionsUrl = 'YOUR_CLOUD_FUNCTIONS_URL';

  // Purchase individual content set
  Future<bool> purchaseContentSet(String contentSetId) async {
    try {
      final user = _auth.currentUser;
      if (user == null) throw 'User not authenticated';

      // Get content set details
      final contentSetDoc = await _firestore
          .collection('contentSets')
          .doc(contentSetId)
          .get();
      
      if (!contentSetDoc.exists) throw 'Content set not found';
      
      final contentSetData = contentSetDoc.data()!;
      
      // Create payment intent
      final response = await http.post(
        Uri.parse('$cloudFunctionsUrl/createPaymentIntent'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'amount': (contentSetData['price'] * 100).round(), // Convert to cents
          'currency': 'usd',
          'contentSetId': contentSetId,
          'userId': user.uid,
        }),
      );

      if (response.statusCode != 200) throw 'Failed to create payment intent';

      final paymentIntentData = json.decode(response.body);

      // Confirm payment with Stripe
      final paymentMethod = await Stripe.instance.createPaymentMethod(
        params: PaymentMethodParams.card(
          paymentMethodData: PaymentMethodData(),
        ),
      );

      final confirmPaymentIntent = await Stripe.instance.confirmPayment(
        paymentIntentData['clientSecret'],
        PaymentMethodParams.card(
          paymentMethodData: PaymentMethodData(
            billingDetails: BillingDetails(
              email: user.email,
            ),
          ),
        ),
      );

      // Update user's purchased content
      await _firestore.collection('users').doc(user.uid).update({
        'purchasedContent': FieldValue.arrayUnion([contentSetId]),
      });

      return true;
    } catch (e) {
      print('Purchase error: $e');
      return false;
    }
  }

  // Subscribe to a tier
  Future<bool> subscribe(String tierId) async {
    try {
      final user = _auth.currentUser;
      if (user == null) throw 'User not authenticated';

      // Get subscription tier details
      final tierDoc = await _firestore
          .collection('subscriptionTiers')
          .doc(tierId)
          .get();
      
      if (!tierDoc.exists) throw 'Subscription tier not found';
      
      final tierData = tierDoc.data()!;

      // Create subscription
      final response = await http.post(
        Uri.parse('$cloudFunctionsUrl/createSubscription'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'tierId': tierId,
          'userId': user.uid,
          'priceId': tierData['stripePriceId'],
        }),
      );

      if (response.statusCode != 200) throw 'Failed to create subscription';

      final subscriptionData = json.decode(response.body);

      // Confirm setup with Stripe
      final paymentMethod = await Stripe.instance.createPaymentMethod(
        params: PaymentMethodParams.card(
          paymentMethodData: PaymentMethodData(),
        ),
      );

      // Attach payment method to customer
      await http.post(
        Uri.parse('$cloudFunctionsUrl/attachPaymentMethod'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'paymentMethodId': paymentMethod.id,
          'customerId': subscriptionData['customerId'],
        }),
      );

      // Update user's subscription status
      await _firestore.collection('users').doc(user.uid).update({
        'subscription': {
          'tierId': tierId,
          'status': 'active',
          'startDate': FieldValue.serverTimestamp(),
        },
      });

      return true;
    } catch (e) {
      print('Subscription error: $e');
      return false;
    }
  }

  // Cancel subscription
  Future<bool> cancelSubscription() async {
    try {
      final user = _auth.currentUser;
      if (user == null) throw 'User not authenticated';

      final userDoc = await _firestore
          .collection('users')
          .doc(user.uid)
          .get();
      
      if (!userDoc.exists) throw 'User not found';
      
      final userData = userDoc.data()!;
      final subscription = userData['subscription'];

      if (subscription == null || subscription['status'] != 'active') {
        throw 'No active subscription found';
      }

      // Cancel subscription with Stripe
      await http.post(
        Uri.parse('$cloudFunctionsUrl/cancelSubscription'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': user.uid,
        }),
      );

      // Update user's subscription status
      await _firestore.collection('users').doc(user.uid).update({
        'subscription.status': 'cancelled',
        'subscription.endDate': FieldValue.serverTimestamp(),
      });

      return true;
    } catch (e) {
      print('Cancellation error: $e');
      return false;
    }
  }

  // Check content access
  Future<bool> hasAccessToContent(String contentSetId) async {
    try {
      final user = _auth.currentUser;
      if (user == null) return false;

      final userDoc = await _firestore
          .collection('users')
          .doc(user.uid)
          .get();
      
      if (!userDoc.exists) return false;
      
      final userData = userDoc.data()!;

      // Check if content is purchased individually
      final purchasedContent = List<String>.from(userData['purchasedContent'] ?? []);
      if (purchasedContent.contains(contentSetId)) return true;

      // Check subscription access
      final subscription = userData['subscription'];
      if (subscription == null || subscription['status'] != 'active') return false;

      final contentSetDoc = await _firestore
          .collection('contentSets')
          .doc(contentSetId)
          .get();
      
      if (!contentSetDoc.exists) return false;
      
      final contentSetData = contentSetDoc.data()!;

      final tierDoc = await _firestore
          .collection('subscriptionTiers')
          .doc(subscription['tierId'])
          .get();
      
      if (!tierDoc.exists) return false;
      
      final tierData = tierDoc.data()!;

      final contentAccess = List<String>.from(tierData['contentAccess']);
      return contentAccess.contains(contentSetData['type']);
    } catch (e) {
      print('Access check error: $e');
      return false;
    }
  }
}
