import 'dart:convert';
import 'package:http/http.dart' as http;
import 'models.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';
  static String? _token;
  
  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  static Future<List<Product>> getProducts({String? storeId}) async {
    try {
      final url = storeId != null ? '$baseUrl/products?storeId=$storeId' : '$baseUrl/products';
      final response = await http.get(Uri.parse(url), headers: _headers);
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Product.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error fetching products: $e');
    }
    return [];
  }

  static Future<List<Category>> getCategories() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/categories'), headers: _headers);
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Category.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error fetching categories: $e');
    }
    return [];
  }

  static Future<User?> login(String phone, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'emailOrPhone': phone, 'password': password}),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _token = data['token'];
        return User.fromJson(data['user']);
      }
    } catch (e) {
      print('Login error: $e');
    }
    return null;
  }

  static Future<User?> register(String name, String email, String phone, String password, String address) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'name': name,
          'email': email,
          'phone': phone,
          'password': password,
          'address': address,
          'role': 'Customer'
        }),
      );
      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        _token = data['token'];
        return User.fromJson(data['user']);
      }
    } catch (e) {
      print('Register error: $e');
    }
    return null;
  }


  static Future<Order?> placeOrder(List<Map<String, dynamic>> cartItems, User user, double tip, String paymentMethod) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/orders'),
        headers: _headers,
        body: json.encode({
          'storeId': cartItems.isNotEmpty ? cartItems.first['storeId'] : '',
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
      }
    } catch (e) {
      print('Order error: $e');
    }
    return null;
  }

  static Future<List<Order>> getOrders({String? userId}) async {
    try {
      // We no longer need to pass userId in the URL, the backend uses the JWT token!
      final url = '$baseUrl/orders';
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
}
