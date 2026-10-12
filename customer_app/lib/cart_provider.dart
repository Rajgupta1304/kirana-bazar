import 'package:flutter/material.dart';
import 'models.dart';

class CartItem {
  final Product product;
  int quantity;

  CartItem({required this.product, this.quantity = 1});
}

class CartProvider with ChangeNotifier {
  final List<CartItem> _items = [];
  User? _currentUser;
  int _selectedTabIndex = 0;
  int _ordersVersion = 0;
  Order? _recentlyPlacedOrder;

  String _selectedCategory = 'ALL';
  final List<String> _savedAddresses = [
    'House no 10 sector 104, Metro Heights',
    'Tower B, Tech Park, Sector 62',
    'Flat 402, Green Avenue, DLF Phase 1',
  ];

  List<CartItem> get items => _items;
  User? get currentUser => _currentUser;
  int get selectedTabIndex => _selectedTabIndex;
  int get ordersVersion => _ordersVersion;
  Order? get recentlyPlacedOrder => _recentlyPlacedOrder;
  String get selectedCategory => _selectedCategory;
  List<String> get savedAddresses => List.unmodifiable(_savedAddresses);

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
    } else {
      _currentUser = User(
        id: 'usr_1',
        name: 'Guest Customer',
        email: 'customer@kiranabazar.com',
        phone: '+91 98765 43210',
        address: address.trim(),
        role: 'Customer',
      );
    }
    notifyListeners();
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
    _selectedTabIndex = index;
    notifyListeners();
  }

  void goToHome({String? categoryId}) {
    if (categoryId != null) _selectedCategory = categoryId;
    setTab(0);
  }

  void goToCategories() => setTab(1);
  void goToCart() => setTab(2);
  void goToOrders() => setTab(3);
  void goToProfile() => setTab(4);

  void setUser(User user) {
    _currentUser = user;
    _selectedTabIndex = 0;
    if (user.address.isNotEmpty && !_savedAddresses.contains(user.address)) {
      _savedAddresses.insert(0, user.address);
    }
    notifyListeners();
  }

  void continueAsGuest() {
    _currentUser = User(
      id: 'usr_guest',
      name: 'Guest Shopper',
      email: 'guest@kiranabazar.com',
      phone: '+91 98765 43210',
      address: _savedAddresses.isNotEmpty ? _savedAddresses.first : 'House no 10 sector 104, Metro Heights',
      role: 'Customer',
    );
    _selectedTabIndex = 0;
    notifyListeners();
  }

  void updateUser(User user) {
    _currentUser = user;
    if (user.address.isNotEmpty && !_savedAddresses.contains(user.address)) {
      _savedAddresses.insert(0, user.address);
    }
    notifyListeners();
  }

  void logout() {
    _currentUser = null;
    _selectedTabIndex = 0;
    _items.clear();
    notifyListeners();
  }

  void add(Product product) {
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
    }
  }

  void clear() {
    _items.clear();
    notifyListeners();
  }
}
