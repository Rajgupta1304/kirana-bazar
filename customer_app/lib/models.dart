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
  final String shopkeeperId;

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
    required this.shopkeeperId,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      categoryId: json['categoryId'] ?? '',
      categoryName: json['categoryName'] ?? '',
      unit: json['unit'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      mrp: (json['mrp'] ?? 0).toDouble(),
      image: json['image'] ?? '',
      stock: json['stock'] ?? 0,
      shopkeeperId: json['shopkeeperId'] ?? '',
    );
  }
}

class Category {
  final String id;
  final String name;
  final String icon;

  Category({required this.id, required this.name, required this.icon});

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      icon: json['icon'] ?? '',
    );
  }
}

class Order {
  final String id;
  final double grandTotal;
  final String status;
  final List<dynamic> items;

  Order({
    required this.id,
    required this.grandTotal,
    required this.status,
    required this.items,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] ?? '',
      grandTotal: (json['grandTotal'] ?? 0).toDouble(),
      status: json['status'] ?? 'PENDING',
      items: json['items'] ?? [],
    );
  }
}

class User {
  final String id;
  final String name;
  final String phone;
  final String address;

  User({
    required this.id,
    required this.name,
    required this.phone,
    required this.address,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      address: json['address'] ?? '',
    );
  }
}
