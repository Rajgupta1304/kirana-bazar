class Product {
  final String id;
  final String name;
  final String categoryId;
  final String categoryName;
  final String unit;
  final double price;
  final double mrp;
  final String image;
  final int stock;
  final String storeId;
  final bool inStore;
  final bool isAnimation;

  Product({
    required this.id,
    required this.name,
    required this.categoryId,
    required this.categoryName,
    required this.unit,
    required this.price,
    required this.mrp,
    required this.image,
    required this.stock,
    required this.storeId,
    required this.inStore,
    this.isAnimation = false,
  });

  bool get isOutOfStock => stock <= 0;

  factory Product.fromJson(Map<String, dynamic> json) {
    final parsedPrice = _toDouble(json['price'] ?? json['sellingPrice']);
    final parsedMrp = _toDouble(json['mrp'] ?? json['price']);
    final finalPrice = parsedPrice > 0 ? parsedPrice : (parsedMrp > 0 ? parsedMrp : 30.0);
    final finalMrp = parsedMrp > 0 ? parsedMrp : finalPrice;
    final parsedStock = _toInt(json['stock']);

    String resolvedImage = '';
    if (json['image'] != null && json['image'].toString().trim().isNotEmpty && json['image'].toString() != 'null') {
      resolvedImage = json['image'].toString().trim();
    } else if (json['images'] is List && (json['images'] as List).isNotEmpty) {
      resolvedImage = (json['images'] as List).first.toString().trim();
    }
    if (resolvedImage.isEmpty) {
      resolvedImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
    }

    return Product(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Grocery Item',
      categoryId: json['categoryId']?.toString() ?? 'cat_1',
      categoryName: json['categoryName']?.toString() ?? 'General',
      unit: json['unit']?.toString() ?? '1 unit',
      price: finalPrice,
      mrp: finalMrp,
      image: resolvedImage,
      stock: json['stock'] == null ? 15 : parsedStock,
      storeId: json['storeId']?.toString() ?? json['shopkeeperId']?.toString() ?? 'store_1',
      inStore: json['inStore'] == null ? true : (json['inStore'] == true || json['inStore'].toString() == 'true'),
      isAnimation: json['isAnimation'] == true || json['isAnimation']?.toString() == 'true',
    );
  }
}

class Category {
  final String id;
  final String name;
  final String icon;
  final String image;
  final String section;

  Category({
    required this.id,
    required this.name,
    required this.icon,
    this.image = '',
    this.section = 'Grocery & Kitchen',
  });

  static final Map<String, String> _fallbackCategoryImages = {
    'cat_1': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    'cat_2': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
    'cat_3': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80',
    'cat_4': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
    'cat_5': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
    'cat_6': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
    'cat_7': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    'cat_8': 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80',
  };

  factory Category.fromJson(Map<String, dynamic> json) {
    final catId = json['id']?.toString() ?? '';
    var img = json['image']?.toString() ?? '';
    if (img.isEmpty || img == 'null') {
      img = _fallbackCategoryImages[catId] ??
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
    }

    return Category(
      id: catId,
      name: json['name']?.toString() ?? '',
      icon: json['icon']?.toString() ?? '🛍️',
      image: img,
      section: json['section']?.toString() ?? 'Grocery & Kitchen',
    );
  }
}

class BannerItem {
  final String id;
  final String title;
  final String subtitle;
  final String image;
  final String targetType;
  final String targetValue;
  final int displayOrder;
  final bool active;

  BannerItem({
    required this.id,
    required this.title,
    this.subtitle = '',
    required this.image,
    this.targetType = 'category',
    this.targetValue = '',
    this.displayOrder = 0,
    this.active = true,
  });

  factory BannerItem.fromJson(Map<String, dynamic> json) {
    String rawImage = '';
    if (json['image'] != null && json['image'].toString().trim().isNotEmpty && json['image'].toString() != 'null') {
      rawImage = json['image'].toString().trim();
    }
    return BannerItem(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      subtitle: json['subtitle']?.toString() ?? '',
      image: rawImage,
      targetType: (json['targetType']?.toString() ?? 'category').toLowerCase(),
      targetValue: json['targetValue']?.toString() ?? '',
      displayOrder: _toInt(json['displayOrder']),
      active: json['active'] == null ? true : (json['active'] == true || json['active'].toString() == 'true'),
    );
  }
}

class StoreBranch {
  final String id;
  final String name;
  final String address;
  final String city;
  final String phone;

  StoreBranch({
    required this.id,
    required this.name,
    this.address = '',
    this.city = 'Delhi NCR',
    this.phone = '',
  });

  factory StoreBranch.fromJson(Map<String, dynamic> json) {
    return StoreBranch(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Kirana Mart',
      address: json['address']?.toString() ?? '',
      city: json['city']?.toString() ?? 'Delhi NCR',
      phone: json['phone']?.toString() ?? '',
    );
  }
}

class Order {
  final String id;
  final double grandTotal;
  final String status;
  final List<dynamic> items;
  final String customerName;
  final String address;
  final String createdAt;
  final String storeId;
  final String storeName;
  final String deliveryOtp;
  final String deliveredAt;
  final int etaMinutes;
  final String driverName;
  final String driverPhone;
  final double riderLat;
  final double riderLng;

  Order({
    required this.id,
    required this.grandTotal,
    required this.status,
    required this.items,
    this.customerName = '',
    this.address = '',
    this.createdAt = '',
    this.storeId = '',
    this.storeName = 'Kirana Store Hub',
    this.deliveryOtp = '',
    this.deliveredAt = '',
    this.etaMinutes = 10,
    this.driverName = '',
    this.driverPhone = '',
    this.riderLat = 0.0,
    this.riderLng = 0.0,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    final rawStatus = json['status']?.toString() ?? json['orderStatus']?.toString() ?? 'PENDING';
    final custDetails = json['customerDetails'] is Map ? json['customerDetails'] as Map : null;
    final riderLoc = json['riderLocation'] is Map ? json['riderLocation'] as Map : null;

    final name = custDetails != null && custDetails['name'] != null
        ? custDetails['name'].toString()
        : (json['customerName']?.toString() ?? '');

    final addr = custDetails != null && custDetails['address'] != null
        ? custDetails['address'].toString()
        : (json['address']?.toString() ?? '');

    return Order(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      grandTotal: _toDouble(json['grandTotal'] ?? json['totalAmount']),
      status: rawStatus,
      items: (json['items'] as List<dynamic>?) ?? [],
      customerName: name,
      address: addr,
      createdAt: json['createdAt']?.toString() ?? '',
      storeId: json['storeId']?.toString() ?? '',
      storeName: json['storeName']?.toString() ?? 'Sector 14 Express Hub',
      deliveryOtp: json['deliveryOtp']?.toString() ?? '',
      deliveredAt: json['deliveredAt']?.toString() ?? '',
      etaMinutes: _toInt(json['etaMinutes'] ?? 10),
      driverName: json['driverName']?.toString() ?? json['deliveryPartnerName']?.toString() ?? 'Vikram Sharma',
      driverPhone: json['driverPhone']?.toString() ?? json['deliveryPartnerPhone']?.toString() ?? '+91 98765 12345',
      riderLat: _toDouble(riderLoc != null ? riderLoc['lat'] : json['riderLat']),
      riderLng: _toDouble(riderLoc != null ? riderLoc['lng'] : json['riderLng']),
    );
  }
}

class User {
  final String id;
  final String name;
  final String phone;
  final String email;
  final String address;
  final String role;

  User({
    required this.id,
    required this.name,
    required this.phone,
    this.email = '',
    required this.address,
    this.role = 'Customer',
  });

  factory User.fromJson(Map<String, dynamic> json) {
    String parsedAddress = '';
    if (json['address'] is String) {
      parsedAddress = json['address'];
    } else if (json['address'] is Map) {
      final addrMap = json['address'] as Map;
      parsedAddress = [
        addrMap['line1'],
        addrMap['area'],
        addrMap['city'],
        addrMap['pincode']
      ].where((s) => s != null && s.toString().trim().isNotEmpty).join(', ');
    }

    return User(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Customer',
      phone: json['phone']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      address: parsedAddress.isNotEmpty ? parsedAddress : 'B-12, Sector 14, Metro Heights',
      role: json['role']?.toString() ?? 'Customer',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'email': email,
      'address': address,
      'role': role,
    };
  }
}

double _toDouble(dynamic v) {
  if (v == null) return 0.0;
  if (v is num) return v.toDouble();
  return double.tryParse(v.toString()) ?? 0.0;
}

int _toInt(dynamic v) {
  if (v == null) return 0;
  if (v is num) return v.toInt();
  return int.tryParse(v.toString()) ?? 0;
}
