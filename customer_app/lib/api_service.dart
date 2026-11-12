import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'models.dart';

class ApiService {
  static String get baseUrl {
    const envUrl = String.fromEnvironment('API_URL');
    if (envUrl.isNotEmpty) return envUrl;
    if (kIsWeb) {
      final origin = Uri.base.origin;
      if (origin.isNotEmpty && !origin.startsWith('file://')) {
        return '$origin/api';
      }
    }
    return 'https://kirana-bazar-production.up.railway.app/api';
  }
  static String? _token;
  static String? lastAuthError;
  
  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  static String? get token => _token;

  static void setToken(String? token) {
    _token = token;
  }

  static const List<Category> defaultCategories = [];

  static const List<Product> defaultProducts = [];

  static Future<http.Response?> _getWithFallback(String path) async {
    final hosts = [
      baseUrl,
      'http://127.0.0.1:5000/api',
    ];
    for (final host in hosts) {
      try {
        final res = await http
            .get(Uri.parse('$host$path'), headers: _headers)
            .timeout(const Duration(seconds: 15));
        return res;
      } catch (_) {
        continue;
      }
    }
    return null;
  }

  static List<Product>? _cachedProducts;
  static List<Category>? _cachedCategories;
  static List<BannerItem>? _cachedBanners;

  static List<Product> get cachedProducts => _cachedProducts ?? const <Product>[];
  static List<Category> get cachedCategories => _cachedCategories ?? const <Category>[];
  static List<BannerItem>? get cachedBanners => _cachedBanners;

  static Future<List<Product>> getProducts({String? storeId, bool forceRefresh = false}) async {
    if (!forceRefresh && _cachedProducts != null) {
      // Background revalidation
      _fetchProductsFromNetwork(storeId: storeId).then((fresh) {
        _cachedProducts = fresh;
      }).catchError((_) {});
      return _cachedProducts!;
    }
    return await _fetchProductsFromNetwork(storeId: storeId);
  }

  static Future<List<Product>> _fetchProductsFromNetwork({String? storeId}) async {
    try {
      final path = storeId != null ? '/products?storeId=$storeId' : '/products';
      final response = await _getWithFallback(path);
      if (response != null && response.statusCode == 200) {
        final dynamic data = json.decode(response.body);
        if (data is List) {
          final list = <Product>[];
          for (final item in data) {
            try {
              if (item is Map<String, dynamic>) {
                list.add(Product.fromJson(item));
              } else if (item is Map) {
                list.add(Product.fromJson(Map<String, dynamic>.from(item)));
              }
            } catch (err) {
              print('Skipping malformed product item: $err');
            }
          }
          _cachedProducts = list;
          return list;
        }
      }
    } catch (e) {
      print('Error fetching products: $e');
    }
    return _cachedProducts ?? const <Product>[];
  }

  static Future<List<Category>> getCategories({bool forceRefresh = false}) async {
    if (!forceRefresh && _cachedCategories != null) {
      _fetchCategoriesFromNetwork().then((fresh) {
        _cachedCategories = fresh;
      }).catchError((_) {});
      return _cachedCategories!;
    }
    return await _fetchCategoriesFromNetwork();
  }

  static Future<List<Category>> _fetchCategoriesFromNetwork() async {
    try {
      final response = await _getWithFallback('/categories');
      if (response != null && response.statusCode == 200) {
        final dynamic data = json.decode(response.body);
        if (data is List) {
          final list = <Category>[];
          for (final item in data) {
            try {
              if (item is Map<String, dynamic>) {
                list.add(Category.fromJson(item));
              } else if (item is Map) {
                list.add(Category.fromJson(Map<String, dynamic>.from(item)));
              }
            } catch (err) {
              print('Skipping malformed category item: $err');
            }
          }
          _cachedCategories = list;
          return list;
        }
      }
    } catch (e) {
      print('Error fetching categories: $e');
    }
    return _cachedCategories ?? const <Category>[];
  }

  static Future<User?> login(String emailOrPhone, String password) async {
    lastAuthError = null;
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'emailOrPhone': emailOrPhone.trim(), 'password': password.trim()}),
      );
      final data = json.decode(response.body);
      if (response.statusCode == 200) {
        _token = data['token'];
        return User.fromJson(data['user']);
      } else {
        lastAuthError = data['error'] ?? 'Login failed (${response.statusCode})';
      }
    } catch (e) {
      print('Login error: $e');
      lastAuthError = 'Network connection failed: $e';
    }
    return null;
  }

  static Future<User?> register(String name, String email, String phone, String password, String address) async {
    lastAuthError = null;
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'name': name.trim(),
          'email': email.trim(),
          'phone': phone.trim(),
          'password': password.trim(),
          'address': address.trim(),
          'role': 'Customer'
        }),
      );
      final data = json.decode(response.body);
      if (response.statusCode == 201) {
        _token = data['token'];
        return User.fromJson(data['user']);
      } else {
        lastAuthError = data['error'] ?? 'Registration failed (${response.statusCode})';
      }
    } catch (e) {
      print('Register error: $e');
      lastAuthError = 'Network connection failed: $e';
    }
    return null;
  }

  static Future<User?> updateUser(String userId, {String? name, String? phone, String? address, String? profileImage}) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/users/$userId'),
        headers: _headers,
        body: json.encode({
          if (name != null) 'name': name.trim(),
          if (phone != null) 'phone': phone.trim(),
          if (address != null) 'address': address.trim(),
          if (profileImage != null) 'profileImage': profileImage.trim(),
        }),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return User.fromJson(data);
      }
    } catch (e) {
      print('Update user error: $e');
    }
    return null;
  }

  static String? lastOrderError;

  static Future<Order?> placeOrder(List<Map<String, dynamic>> cartItems, User user, double tip, String paymentMethod) async {
    lastOrderError = null;
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/orders'),
        headers: _headers,
        body: json.encode({
          'userId': user.id,
          'storeId': cartItems.isNotEmpty ? cartItems.first['storeId'] : 'store_1',
          'items': cartItems,
          'customerDetails': {
            'name': user.name,
            'phone': user.phone,
            'address': user.address
          }
        }),
      );
      if (response.statusCode == 201) {
        return Order.fromJson(json.decode(response.body));
      } else {
        try {
          final data = json.decode(response.body);
          if (data is Map && data['error'] != null) {
            lastOrderError = data['error'].toString();
          }
        } catch (_) {}
      }
    } catch (e) {
      print('Order error: $e');
      lastOrderError = 'Network error: Please check your connection.';
    }
    return null;
  }

  static Future<List<Order>> getOrders({String? userId}) async {
    try {
      final url = (userId != null && userId.isNotEmpty) ? '$baseUrl/orders?userId=$userId' : '$baseUrl/orders';
      final response = await http.get(Uri.parse(url), headers: _headers);
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Order.fromJson(json)).toList();
      }
    } catch (e) {
      print('Orders error: $e');
    }
    return [];
  }

  static Future<bool> updateOrderStatus(String orderId, String status) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/orders/$orderId/status'),
        headers: _headers,
        body: json.encode({'status': status}),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Update order error: $e');
      return false;
    }
  }

  static Future<List<BannerItem>> getBanners({bool forceRefresh = false}) async {
    if (!forceRefresh && _cachedBanners != null && _cachedBanners!.isNotEmpty) {
      _fetchBannersFromNetwork().then((fresh) {
        if (fresh.isNotEmpty) _cachedBanners = fresh;
      }).catchError((_) {});
      return _cachedBanners!;
    }
    return await _fetchBannersFromNetwork();
  }

  static Future<List<BannerItem>> _fetchBannersFromNetwork() async {
    try {
      final response = await _getWithFallback('/banners');
      if (response != null && response.statusCode == 200) {
        final dynamic data = json.decode(response.body);
        if (data is List) {
          final list = data
              .map((item) => BannerItem.fromJson(item is Map<String, dynamic> ? item : Map<String, dynamic>.from(item)))
              .where((b) => b.active)
              .toList();
          if (list.isNotEmpty) {
            _cachedBanners = list;
            return list;
          }
        }
      }
    } catch (e) {
      print('Banners error: $e');
    }
    return [
      BannerItem(
        id: 'banner_fallback_1',
        title: 'Flat 50% Off On Fresh Vegetables',
        subtitle: 'Farm fresh arrivals delivered in 8 mins',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
        targetType: 'category',
        targetValue: 'cat_2',
        displayOrder: 1,
      ),
      BannerItem(
        id: 'banner_fallback_2',
        title: 'Dairy & Morning Essentials',
        subtitle: 'Fresh milk, bread & eggs straight to your door',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80',
        targetType: 'category',
        targetValue: 'cat_1',
        displayOrder: 2,
      ),
    ];
  }

  static Future<Order?> getOrderDetails(String orderId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/orders/$orderId'), headers: _headers);
      if (response.statusCode == 200) {
        return Order.fromJson(json.decode(response.body));
      }
    } catch (e) {
      print('Get order details error: $e');
    }
    return null;
  }

  static Future<List<StoreBranch>> getStores() async {
    try {
      final response = await _getWithFallback('/stores');
      if (response != null && response.statusCode == 200) {
        final dynamic data = json.decode(response.body);
        if (data is List) {
          return data
              .map((item) => StoreBranch.fromJson(item is Map<String, dynamic> ? item : Map<String, dynamic>.from(item)))
              .toList();
        }
      }
    } catch (e) {
      print('Get stores error: $e');
    }
    return [
      StoreBranch(id: 'store_1', name: 'Sector 14 Hub', address: 'Main Market, Sector 14', city: 'Gurugram'),
      StoreBranch(id: 'store_2', name: 'Cyber City Hub', address: 'DLF Phase 2', city: 'Gurugram'),
    ];
  }

  static Future<List<Product>> searchByImage({String? imageBase64, String? visualHint, String? storeId}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/products/image-search'),
        headers: _headers,
        body: json.encode({
          'image': imageBase64 ?? '',
          'visualHint': visualHint ?? '',
          'storeId': storeId ?? 'store_1',
        }),
      );
      if (response.statusCode == 200) {
        final dynamic data = json.decode(response.body);
        if (data is Map && data['products'] is List) {
          return (data['products'] as List)
              .map((p) => Product.fromJson(p is Map<String, dynamic> ? p : Map<String, dynamic>.from(p)))
              .toList();
        }
      }
    } catch (e) {
      print('Image search error: $e');
    }
    return [];
  }
}
