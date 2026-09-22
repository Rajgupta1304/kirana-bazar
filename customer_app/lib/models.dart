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
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    final parsedPrice = _toDouble(json['price'] ?? json['sellingPrice']);
    final parsedMrp = _toDouble(json['mrp'] ?? json['price']);
    final finalPrice = parsedPrice > 0 ? parsedPrice : (parsedMrp > 0 ? parsedMrp : 30.0);
    final finalMrp = parsedMrp > 0 ? parsedMrp : finalPrice;
    final parsedStock = _toInt(json['stock']);

    return Product(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Grocery Item',
      categoryId: json['categoryId']?.toString() ?? 'cat_1',
      categoryName: json['categoryName']?.toString() ?? 'General',
      unit: json['unit']?.toString() ?? '1 unit',
      price: finalPrice,
      mrp: finalMrp,
      image: (json['image']?.toString().isNotEmpty == true)
          ? json['image'].toString()
          : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      stock: parsedStock > 0 ? parsedStock : 25,
      storeId: json['storeId']?.toString() ?? json['shopkeeperId']?.toString() ?? 'store_1',
      inStore: json['inStore'] == null ? true : (json['inStore'] == true || json['inStore'].toString() == 'true'),
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

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      icon: json['icon']?.toString() ?? '',
      image: json['image']?.toString() ?? '',
      section: json['section']?.toString() ?? 'Grocery & Kitchen',
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

  Order({
    required this.id,
    required this.grandTotal,
    required this.status,
    required this.items,
    this.customerName = '',
    this.address = '',
    this.createdAt = '',
    this.storeId = '',
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    final rawStatus = json['status']?.toString() ?? json['orderStatus']?.toString() ?? 'PENDING';
    return Order(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      grandTotal: _toDouble(json['grandTotal'] ?? json['totalAmount']),
      status: rawStatus,
      items: (json['items'] as List<dynamic>?) ?? [],
      customerName: json['customerName']?.toString() ?? '',
      address: json['address']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? '',
      storeId: json['storeId']?.toString() ?? '',
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
