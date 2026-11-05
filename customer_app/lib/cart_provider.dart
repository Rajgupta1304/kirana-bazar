import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'models.dart';
import 'api_service.dart';

class CartItem {
  final Product product;
  int quantity;

  CartItem({required this.product, this.quantity = 1});

  Map<String, dynamic> toJson() => {
    'product': product.toJson(),
    'quantity': quantity,
  };

  factory CartItem.fromJson(Map<String, dynamic> json) => CartItem(
    product: Product.fromJson(Map<String, dynamic>.from(json['product'] as Map)),
    quantity: json['quantity'] as int? ?? 1,
  );
}

class CartProvider with ChangeNotifier {
  static const String _keyUser = 'kirana_customer_user';
  static const String _keyToken = 'kirana_customer_token';
  static const String _keyStoreId = 'kirana_selected_store_id';
  static const String _keyStoreName = 'kirana_selected_store_name';
  static const String _keyAddresses = 'kirana_saved_addresses';
  static const String _keyCart = 'kirana_saved_cart_items';

  final List<CartItem> _items = [];
  User? _currentUser;
  int _selectedTabIndex = 0;
  final List<int> _tabHistory = [0];
  int _ordersVersion = 0;
  Order? _recentlyPlacedOrder;

  String _selectedStoreId = 'store_1';
  String _selectedStoreName = 'Sector 14 Hub';

  String _selectedCategory = 'ALL';
  List<Category> _categories = [];
  final List<String> _savedAddresses = [
    'House no 10 sector 104, Metro Heights',
    'Tower B, Tech Park, Sector 62',
    'Flat 402, Green Avenue, DLF Phase 1',
  ];

  List<CartItem> get items => _items;
  User? get currentUser => _currentUser;
  int get selectedTabIndex => _selectedTabIndex;
  List<int> get tabHistory => List.unmodifiable(_tabHistory);
  int get ordersVersion => _ordersVersion;
  Order? get recentlyPlacedOrder => _recentlyPlacedOrder;
  String get selectedCategory => _selectedCategory;
  List<Category> get categories => List.unmodifiable(_categories);
  List<String> get savedAddresses => List.unmodifiable(_savedAddresses);
  String get selectedStoreId => _selectedStoreId;
  String get selectedStoreName => _selectedStoreName;

  void setCategories(List<Category> cats) {
    if (cats.isNotEmpty) {
      _categories = cats;
      notifyListeners();
    }
  }

  Future<void> _persistCart() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (_items.isEmpty) {
        await prefs.remove(_keyCart);
      } else {
        final list = _items.map((i) => i.toJson()).toList();
        await prefs.setString(_keyCart, jsonEncode(list));
      }
    } catch (e) {
      debugPrint('Error persisting cart: $e');
    }
  }

  Future<void> initSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString(_keyUser);
      final savedToken = prefs.getString(_keyToken);
      final savedStoreId = prefs.getString(_keyStoreId);
      final savedStoreName = prefs.getString(_keyStoreName);
      final addresses = prefs.getStringList(_keyAddresses);
      final cartJson = prefs.getString(_keyCart);

      if (savedStoreId != null && savedStoreId.isNotEmpty) {
        _selectedStoreId = savedStoreId;
      }
      if (savedStoreName != null && savedStoreName.isNotEmpty) {
        _selectedStoreName = savedStoreName;
      }
      if (addresses != null && addresses.isNotEmpty) {
        _savedAddresses.clear();
        _savedAddresses.addAll(addresses);
      }

      if (userJson != null && userJson.isNotEmpty) {
        final Map<String, dynamic> decoded = jsonDecode(userJson);
        _currentUser = User.fromJson(decoded);
        if (savedToken != null && savedToken.isNotEmpty) {
          ApiService.setToken(savedToken);
        }
        debugPrint('Persistent customer session restored: ${_currentUser?.name}');
      }

      // Restore saved cart items across app restarts
      if (cartJson != null && cartJson.isNotEmpty) {
        try {
          final List decoded = jsonDecode(cartJson);
          _items.clear();
          for (var item in decoded) {
            if (item is Map) {
              _items.add(CartItem.fromJson(Map<String, dynamic>.from(item)));
            }
          }
          debugPrint('Restored ${_items.length} items to cart from local storage');
        } catch (e) {
          debugPrint('Error restoring cart items: $e');
        }
      }
    } catch (e) {
      debugPrint('Error restoring customer session: $e');
    }
  }

  void setStore(String storeId, String storeName) {
    if (_selectedStoreId != storeId) {
      _selectedStoreId = storeId;
      _selectedStoreName = storeName;
      _items.clear();
      notifyListeners();

      SharedPreferences.getInstance().then((prefs) {
        prefs.setString(_keyStoreId, storeId);
        prefs.setString(_keyStoreName, storeName);
      }).catchError((_) {});
    }
  }

  String get activeAddress {
    if (_currentUser != null && _currentUser!.address.trim().isNotEmpty) {
      return _currentUser!.address;
    }
    return _savedAddresses.isNotEmpty ? _savedAddresses.first : 'House no 10 sector 104';
  }

  void setDeliveryAddress(String address) {
    if (address.trim().isEmpty) return;
    if (!_savedAddresses.contains(address.trim())) {
      _savedAddresses.insert(0, address.trim());
    }
    if (_currentUser != null) {
      _currentUser = User(
        id: _currentUser!.id,
        name: _currentUser!.name,
        email: _currentUser!.email,
        phone: _currentUser!.phone,
        address: address.trim(),
        role: _currentUser!.role,
      );
      updateUser(_currentUser!);
    } else {
      _currentUser = User(
        id: 'usr_1',
        name: 'Guest Customer',
        email: 'customer@kiranabazar.com',
        phone: '+91 98765 43210',
        address: address.trim(),
        role: 'Customer',
      );
      updateUser(_currentUser!);
    }
    notifyListeners();

    SharedPreferences.getInstance().then((prefs) {
      prefs.setStringList(_keyAddresses, _savedAddresses);
    }).catchError((_) {});
  }

  int get totalItems => _items.fold(0, (sum, item) => sum + item.quantity);
  
  double get totalAmount => _items.fold(0, (sum, item) => sum + (item.product.price * item.quantity));

  void notifyOrderPlaced([Order? order]) {
    _recentlyPlacedOrder = order;
    _ordersVersion++;
    notifyListeners();
  }

  void setSelectedCategory(String catId) {
    _selectedCategory = catId;
    notifyListeners();
  }

  void clearCategoryFilter() {
    _selectedCategory = 'ALL';
    notifyListeners();
  }

  void selectCategoryAndGoHome(String catId) {
    _selectedCategory = catId;
    setTab(0);
  }

  void setTab(int index) {
    if (_selectedTabIndex == index && index == 3) {
      _ordersVersion++;
    }
    if (_selectedTabIndex != index) {
      _tabHistory.add(index);
    }
    _selectedTabIndex = index;
    notifyListeners();
  }

  bool popTab() {
    if (_tabHistory.length > 1) {
      _tabHistory.removeLast();
      _selectedTabIndex = _tabHistory.last;
      notifyListeners();
      return true;
    } else if (_selectedTabIndex != 0) {
      _selectedTabIndex = 0;
      _tabHistory.clear();
      _tabHistory.add(0);
      notifyListeners();
      return true;
    }
    return false;
  }

  void goToHome({String? categoryId}) {
    if (categoryId != null) _selectedCategory = categoryId;
    setTab(0);
  }

  void goToCategories() => setTab(1);
  void goToCart() => setTab(2);
  void goToOrders() => setTab(3);
  void goToProfile() => setTab(4);

  void setUser(User user, {String? token}) {
    _currentUser = user;
    _selectedTabIndex = 0;
    if (user.address.isNotEmpty && !_savedAddresses.contains(user.address)) {
      _savedAddresses.insert(0, user.address);
    }
    notifyListeners();

    SharedPreferences.getInstance().then((prefs) {
      prefs.setString(_keyUser, jsonEncode(user.toJson()));
      final activeToken = token ?? ApiService.token;
      if (activeToken != null && activeToken.isNotEmpty) {
        ApiService.setToken(activeToken);
        prefs.setString(_keyToken, activeToken);
      }
      prefs.setStringList(_keyAddresses, _savedAddresses);
    }).catchError((e) {
      debugPrint('Error persisting user session: $e');
    });
  }

  void continueAsGuest() {
    final guest = User(
      id: 'usr_guest',
      name: 'Guest Shopper',
      email: 'guest@kiranabazar.com',
      phone: '+91 98765 43210',
      address: _savedAddresses.isNotEmpty ? _savedAddresses.first : 'House no 10 sector 104, Metro Heights',
      role: 'Customer',
    );
    setUser(guest);
  }

  void updateUser(User user) {
    _currentUser = user;
    if (user.address.isNotEmpty && !_savedAddresses.contains(user.address)) {
      _savedAddresses.insert(0, user.address);
    }
    notifyListeners();

    SharedPreferences.getInstance().then((prefs) {
      prefs.setString(_keyUser, jsonEncode(user.toJson()));
      prefs.setStringList(_keyAddresses, _savedAddresses);
    }).catchError((e) {
      debugPrint('Error updating user session: $e');
    });
  }

  void logout() {
    _currentUser = null;
    _selectedTabIndex = 0;
    _items.clear();
    ApiService.setToken(null);
    notifyListeners();

    SharedPreferences.getInstance().then((prefs) {
      prefs.remove(_keyUser);
      prefs.remove(_keyToken);
    }).catchError((e) {
      debugPrint('Error clearing persistent session: $e');
    });
  }

  void updateProfileImage(String base64Image) {
    if (_currentUser == null) return;
    _currentUser = User(
      id: _currentUser!.id,
      name: _currentUser!.name,
      phone: _currentUser!.phone,
      email: _currentUser!.email,
      address: _currentUser!.address,
      role: _currentUser!.role,
      profileImage: base64Image,
    );
    updateUser(_currentUser!);
  }

  void add(Product product) {
    if (product.isOutOfStock) {
      return;
    }
    if (_items.isNotEmpty && _items.first.product.storeId != product.storeId) {
      // Must be handled by UI check before calling add
      return;
    }

    var existingIndex = _items.indexWhere((i) => i.product.id == product.id);
    if (existingIndex >= 0) {
      _items[existingIndex].quantity += 1;
    } else {
      _items.add(CartItem(product: product));
    }
    notifyListeners();
    _persistCart();
  }

  void remove(Product product) {
    var existingIndex = _items.indexWhere((i) => i.product.id == product.id);
    if (existingIndex >= 0) {
      if (_items[existingIndex].quantity > 1) {
        _items[existingIndex].quantity -= 1;
      } else {
        _items.removeAt(existingIndex);
      }
      notifyListeners();
      _persistCart();
    }
  }

  void clear() {
    _items.clear();
    notifyListeners();
    _persistCart();
  }
}
