import 'package:cloud_firestore/cloud_firestore.dart';

class ContentSet {
  final String id;
  final String title;
  final String description;
  final String thumbnailUrl;
  final List<String> previewImages;
  final int totalImages;
  final double price;
  final String type;
  final List<String> tags;
  final String rating;
  final DateTime createdAt;
  final bool isPremium;

  ContentSet({
    required this.id,
    required this.title,
    required this.description,
    required this.thumbnailUrl,
    required this.previewImages,
    required this.totalImages,
    required this.price,
    required this.type,
    required this.tags,
    required this.rating,
    required this.createdAt,
    required this.isPremium,
  });

  factory ContentSet.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return ContentSet(
      id: doc.id,
      title: data['title'] ?? '',
      description: data['description'] ?? '',
      thumbnailUrl: data['thumbnailUrl'] ?? '',
      previewImages: List<String>.from(data['previewImages'] ?? []),
      totalImages: data['totalImages'] ?? 0,
      price: (data['price'] ?? 0.0).toDouble(),
      type: data['type'] ?? '',
      tags: List<String>.from(data['tags'] ?? []),
      rating: data['rating'] ?? '',
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      isPremium: data['isPremium'] ?? false,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'title': title,
      'description': description,
      'thumbnailUrl': thumbnailUrl,
      'previewImages': previewImages,
      'totalImages': totalImages,
      'price': price,
      'type': type,
      'tags': tags,
      'rating': rating,
      'createdAt': Timestamp.fromDate(createdAt),
      'isPremium': isPremium,
    };
  }
}

class SubscriptionTier {
  final String id;
  final String name;
  final double price;
  final String period;
  final List<String> features;
  final List<String> contentAccess;
  final String stripePriceId;

  SubscriptionTier({
    required this.id,
    required this.name,
    required this.price,
    required this.period,
    required this.features,
    required this.contentAccess,
    required this.stripePriceId,
  });

  factory SubscriptionTier.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return SubscriptionTier(
      id: doc.id,
      name: data['name'] ?? '',
      price: (data['price'] ?? 0.0).toDouble(),
      period: data['period'] ?? 'monthly',
      features: List<String>.from(data['features'] ?? []),
      contentAccess: List<String>.from(data['contentAccess'] ?? []),
      stripePriceId: data['stripePriceId'] ?? '',
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'price': price,
      'period': period,
      'features': features,
      'contentAccess': contentAccess,
      'stripePriceId': stripePriceId,
    };
  }
}
