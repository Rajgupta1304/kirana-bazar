import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api_service.dart';
import '../models.dart';
import '../theme.dart';
import '../cart_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Product> products = [];
  List<Category> categories = [];
  bool isLoading = true;
  String searchQuery = '';
  int _lastTab = 0;
  String _lastSelectedCat = 'ALL';
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    loadData();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final cart = context.watch<CartProvider>();
    final currentTab = cart.selectedTabIndex;
    final currentCat = cart.selectedCategory;

    // When switching back to Home tab or switching category, reset search and scroll to top
    if (currentTab == 0 && (_lastTab != 0 || currentCat != _lastSelectedCat)) {
      if (_searchController.text.isNotEmpty) {
        _searchController.clear();
        searchQuery = '';
      }
      if (_scrollController.hasClients) {
        _scrollController.jumpTo(0);
      }
      if (products.isEmpty && !isLoading) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted && products.isEmpty && !isLoading) {
            loadData();
          }
        });
      }
    }
    _lastTab = currentTab;
    _lastSelectedCat = currentCat;
  }

  Future<void> loadData() async {
    setState(() => isLoading = true);
    try {
      var prods = await ApiService.getProducts(storeId: 'store_1');
      if (prods.isEmpty) {
        prods = await ApiService.getProducts();
      }
      final cats = await ApiService.getCategories();
      if (mounted) {
        setState(() {
          final inStoreProds = prods.where((p) => p.inStore).toList();
          products = inStoreProds.isNotEmpty ? inStoreProds : prods;
          if (products.isEmpty) {
            products = ApiService.defaultProducts;
          }
          categories = cats.isNotEmpty ? cats : ApiService.defaultCategories;
          isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          products = ApiService.defaultProducts;
          categories = ApiService.defaultCategories;
          isLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _showAddressSelectorSheet(BuildContext context, CartProvider cart) {
    final user = cart.currentUser;
    final savedAddresses = cart.savedAddresses;
    final currentAddress = cart.activeAddress;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.only(
          top: 20,
          left: 20,
          right: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.location_on, color: Color(0xFF0C8CE9), size: 24),
                    SizedBox(width: 8),
                    Text(
                      'Select Delivery Location',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.black54),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Text(
              'SAVED ADDRESSES',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 0.5),
            ),
            const SizedBox(height: 8),
            ...savedAddresses.map((addr) {
              final isSelected = addr == currentAddress;
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFFEFF6FF) : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? const Color(0xFF0C8CE9) : Colors.grey.shade200,
                    width: isSelected ? 1.5 : 1,
                  ),
                ),
                child: ListTile(
                  onTap: () async {
                    cart.setDeliveryAddress(addr);
                    if (user != null) {
                      ApiService.updateUser(user.id, address: addr);
                    }
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Delivery address set to: $addr'),
                        backgroundColor: const Color(0xFF0C831F),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF0C8CE9).withOpacity(0.15) : Colors.grey.shade100,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      addr.toLowerCase().contains('office') || addr.toLowerCase().contains('park') || addr.toLowerCase().contains('work')
                          ? Icons.business
                          : Icons.home,
                      color: isSelected ? const Color(0xFF0C8CE9) : Colors.grey.shade700,
                      size: 20,
                    ),
                  ),
                  title: Text(
                    addr,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                      color: isSelected ? const Color(0xFF0C8CE9) : const Color(0xFF1E293B),
                    ),
                  ),
                  trailing: isSelected
                      ? const Icon(Icons.check_circle, color: Color(0xFF0C8CE9), size: 22)
                      : null,
                ),
              );
            }),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              height: 46,
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.pop(ctx);
                  _showAddNewAddressDialog(context, cart);
                },
                icon: const Icon(Icons.add_location_alt_outlined, color: Color(0xFF0C8CE9)),
                label: const Text(
                  '+ Add or Edit Address',
                  style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF0C8CE9), fontSize: 14),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF0C8CE9), width: 1.5),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddNewAddressDialog(BuildContext context, CartProvider cart) {
    final addrCtrl = TextEditingController(text: cart.activeAddress);
    bool isSaving = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          padding: EdgeInsets.only(
            top: 24,
            left: 20,
            right: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Enter Delivery Address', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: addrCtrl,
                maxLines: 2,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'e.g. Flat 102, Metro Heights, Sector 104',
                  prefixIcon: const Icon(Icons.location_on_outlined),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: isSaving ? null : () async {
                    final text = addrCtrl.text.trim();
                    if (text.isEmpty) return;
                    setModalState(() => isSaving = true);
                    cart.setDeliveryAddress(text);
                    final user = cart.currentUser;
                    if (user != null) {
                      await ApiService.updateUser(user.id, address: text);
                    }
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Address updated successfully!'),
                        backgroundColor: Color(0xFF0C831F),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0C8CE9),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: isSaving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Save & Deliver Here', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final selectedCategory = cart.selectedCategory;

    var filteredProducts = products;
    if (searchQuery.trim().isNotEmpty) {
      final qTokens = searchQuery.trim().toLowerCase().split(RegExp(r'\s+')).where((t) => t.isNotEmpty).toList();
      filteredProducts = filteredProducts.where((p) {
        final searchable = '${p.name} ${p.categoryName} ${p.unit}'.toLowerCase();
        return qTokens.every((tok) => searchable.contains(tok));
      }).toList();
    } else if (selectedCategory != 'ALL') {
      filteredProducts = filteredProducts.where((p) {
        if (p.categoryId == selectedCategory) return true;
        final catObj = categories.cast<Category?>().firstWhere(
          (c) => c?.id == selectedCategory,
          orElse: () => null,
        );
        if (catObj != null) {
          final catName = catObj.name.toLowerCase();
          final prodCatName = p.categoryName.toLowerCase();
          return prodCatName == catName ||
                 prodCatName.contains(catName) ||
                 catName.contains(prodCatName);
        }
        return false;
      }).toList();
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      bottomSheet: cart.totalItems > 0
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppTheme.blinkitGreen,
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.blinkitGreen.withOpacity(0.35),
                    blurRadius: 15,
                    offset: const Offset(0, -4),
                  )
                ],
              ),
              child: SafeArea(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${cart.totalItems} ITEM${cart.totalItems == 1 ? '' : 'S'} • ₹${cart.totalAmount.toStringAsFixed(0)}',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13),
                        ),
                        const Text(
                          'Extra charges may apply at checkout',
                          style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () => cart.goToCart(),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Row(
                          children: [
                            Text(
                              'View Cart',
                              style: TextStyle(color: AppTheme.blinkitGreen, fontWeight: FontWeight.w900, fontSize: 13),
                            ),
                            SizedBox(width: 4),
                            Icon(Icons.arrow_forward, size: 14, color: AppTheme.blinkitGreen),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            )
          : null,
      body: SafeArea(
        top: false,
        child: isLoading 
            ? const Center(child: CircularProgressIndicator(color: AppTheme.blinkitGreen))
            : RefreshIndicator(
                color: AppTheme.blinkitGreen,
                onRefresh: loadData,
                child: CustomScrollView(
                  controller: _scrollController,
                  slivers: [
                    // Top Kirana Bazar Blue Header (Matching Blinkit UI)
                    SliverToBoxAdapter(
                      child: Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Color(0xFF0C8CE9), Color(0xFF0272C9)],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                        padding: EdgeInsets.fromLTRB(16, MediaQuery.of(context).padding.top + 8, 16, 8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Header Top Row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        "DMR Kirana's in",
                                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white70),
                                      ),
                                      const Text(
                                        '8 mins',
                                        style: TextStyle(
                                          fontSize: 24,
                                          fontWeight: FontWeight.w900,
                                          color: Colors.white,
                                          letterSpacing: -0.5,
                                          height: 1.1,
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      GestureDetector(
                                        onTap: () => _showAddressSelectorSheet(context, cart),
                                        behavior: HitTestBehavior.opaque,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: Colors.white.withOpacity(0.18),
                                            borderRadius: BorderRadius.circular(16),
                                            border: Border.all(color: Colors.white.withOpacity(0.35)),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              const Icon(Icons.location_on, color: Colors.white, size: 13),
                                              const SizedBox(width: 4),
                                              Flexible(
                                                child: Text(
                                                  'HOME - ${cart.activeAddress}',
                                                  style: const TextStyle(
                                                    fontSize: 11.5,
                                                    fontWeight: FontWeight.w700,
                                                    color: Colors.white,
                                                  ),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                              const SizedBox(width: 2),
                                              const Icon(Icons.arrow_drop_down, color: Colors.white, size: 18),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Row(
                                  children: [
                                    // Wallet Chip
                                    GestureDetector(
                                      onTap: () {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text("DMR Kirana's Wallet: ₹0.00 (No active coupons)"),
                                            duration: Duration(seconds: 2),
                                          ),
                                        );
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          borderRadius: BorderRadius.circular(20),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.black.withOpacity(0.08),
                                              blurRadius: 8,
                                              offset: const Offset(0, 2),
                                            )
                                          ],
                                        ),
                                        child: const Row(
                                          children: [
                                            Icon(Icons.account_balance_wallet, size: 16, color: Color(0xFFF59E0B)),
                                            SizedBox(width: 4),
                                            Text('₹0', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Colors.black)),
                                          ],
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    // Profile Circle Avatar
                                    GestureDetector(
                                      onTap: () => cart.goToProfile(),
                                      child: Container(
                                        width: 38,
                                        height: 38,
                                        decoration: BoxDecoration(
                                          color: Colors.black.withOpacity(0.25),
                                          shape: BoxShape.circle,
                                          border: Border.all(color: Colors.white38, width: 1.5),
                                        ),
                                        child: const Icon(Icons.person, color: Colors.white, size: 22),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),

                            const SizedBox(height: 12),

                            // Search Bar
                            Container(
                              height: 48,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(14),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.08),
                                    blurRadius: 10,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: TextField(
                                controller: _searchController,
                                onChanged: (val) => setState(() => searchQuery = val),
                                decoration: InputDecoration(
                                  hintText: 'Search "milk", "tea", "dal", "chips"...',
                                  hintStyle: const TextStyle(color: Colors.black45, fontSize: 13, fontWeight: FontWeight.w500),
                                  prefixIcon: const Icon(Icons.search, color: Colors.black87, size: 22),
                                  suffixIcon: searchQuery.isNotEmpty
                                      ? IconButton(
                                          icon: const Icon(Icons.close, color: Colors.black54, size: 20),
                                          onPressed: () {
                                            _searchController.clear();
                                            setState(() => searchQuery = '');
                                          },
                                        )
                                      : const Icon(Icons.mic_none, color: Colors.black87, size: 22),
                                  border: InputBorder.none,
                                  enabledBorder: InputBorder.none,
                                  focusedBorder: InputBorder.none,
                                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                                ),
                              ),
                            ),

                            const SizedBox(height: 8),

                            // Dynamic Circular Category Buttons (Matching reference screenshot)
                            SizedBox(
                              height: 74,
                              child: ListView(
                                scrollDirection: Axis.horizontal,
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                children: [
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.shopping_bag_outlined,
                                    label: 'All',
                                    isSelected: selectedCategory == 'ALL',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('ALL');
                                    },
                                  ),
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.storefront_outlined,
                                    label: 'Groceries',
                                    isSelected: selectedCategory == 'cat_7',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('cat_7');
                                    },
                                  ),
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.breakfast_dining_outlined,
                                    label: 'Dairy & Bread',
                                    isSelected: selectedCategory == 'cat_1',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('cat_1');
                                    },
                                  ),
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.eco_outlined,
                                    label: 'Vegetables',
                                    isSelected: selectedCategory == 'cat_2',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('cat_2');
                                    },
                                  ),
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.cookie_outlined,
                                    label: 'Snacks',
                                    isSelected: selectedCategory == 'cat_3',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('cat_3');
                                    },
                                  ),
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.local_drink_outlined,
                                    label: 'Drinks',
                                    isSelected: selectedCategory == 'cat_4',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('cat_4');
                                    },
                                  ),
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.ramen_dining_outlined,
                                    label: 'Instant Food',
                                    isSelected: selectedCategory == 'cat_5',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('cat_5');
                                    },
                                  ),
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.coffee_outlined,
                                    label: 'Tea & Coffee',
                                    isSelected: selectedCategory == 'cat_14',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('cat_14');
                                    },
                                  ),
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.oil_barrel_outlined,
                                    label: 'Oil & Ghee',
                                    isSelected: selectedCategory == 'cat_8',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('cat_8');
                                    },
                                  ),
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.bakery_dining_outlined,
                                    label: 'Bakery',
                                    isSelected: selectedCategory == 'cat_9',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('cat_9');
                                    },
                                  ),
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.cake_outlined,
                                    label: 'Chocolates',
                                    isSelected: selectedCategory == 'cat_13',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('cat_13');
                                    },
                                  ),
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.lunch_dining_outlined,
                                    label: 'Dry Fruits',
                                    isSelected: selectedCategory == 'cat_10',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('cat_10');
                                    },
                                  ),
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.medical_services_outlined,
                                    label: 'Pharmacy',
                                    isSelected: selectedCategory == 'cat_12',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('cat_12');
                                    },
                                  ),
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.face_retouching_natural_outlined,
                                    label: 'Beauty',
                                    isSelected: selectedCategory == 'cat_11',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('cat_11');
                                    },
                                  ),
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.icecream_outlined,
                                    label: 'Ice Creams',
                                    isSelected: selectedCategory == 'cat_16',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('cat_16');
                                    },
                                  ),
                                  _HeaderCircleCategoryItem(
                                    icon: Icons.spa_outlined,
                                    label: 'Paan Corner',
                                    isSelected: selectedCategory == 'cat_17',
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => searchQuery = '');
                                      cart.setSelectedCategory('cat_17');
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Show Banner & Frequently Bought ONLY when on 'ALL' category and not searching
                    if (selectedCategory == 'ALL' && searchQuery.trim().isEmpty) ...[
                      // Hero Promotional Banner (NESCAFE Cold Coffee) - Sleek & Compact
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(14, 10, 14, 6),
                          child: Container(
                            height: 90,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(16),
                              gradient: const LinearGradient(
                                colors: [Color(0xFF0284C7), Color(0xFF0369A1)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF0284C7).withOpacity(0.25),
                                  blurRadius: 10,
                                  offset: const Offset(0, 3),
                                )
                              ],
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            child: Row(
                              children: [
                                Expanded(
                                  flex: 3,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Text(
                                        'Enjoy Rich Creamy',
                                        style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                                      ),
                                      RichText(
                                        text: const TextSpan(
                                          children: [
                                            TextSpan(
                                              text: 'NESCAFÉ ',
                                              style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic),
                                            ),
                                            TextSpan(
                                              text: 'Cold Coffee',
                                              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Row(
                                        children: [
                                          const Text(
                                            'Up to 33% OFF',
                                            style: TextStyle(color: Color(0xFFFDE047), fontSize: 12, fontWeight: FontWeight.w900),
                                          ),
                                          const SizedBox(width: 8),
                                          GestureDetector(
                                            onTap: () {
                                              cart.setSelectedCategory('cat_14'); // Tea & Coffee
                                            },
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                              decoration: BoxDecoration(
                                                color: Colors.white,
                                                borderRadius: BorderRadius.circular(16),
                                              ),
                                              child: const Text(
                                                'Shop now',
                                                style: TextStyle(color: Color(0xFF0369A1), fontWeight: FontWeight.w900, fontSize: 10),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  width: 80,
                                  alignment: Alignment.centerRight,
                                  child: Image.network(
                                    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=240&q=80',
                                    height: 72,
                                    fit: BoxFit.contain,
                                    errorBuilder: (c, e, s) => const Icon(Icons.coffee, size: 40, color: Colors.white70),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),

                      // "Frequently bought" Section Header
                      const SliverToBoxAdapter(
                        child: Padding(
                          padding: EdgeInsets.fromLTRB(16, 10, 16, 6),
                          child: Text(
                            'Frequently bought',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF1E293B),
                              letterSpacing: -0.3,
                            ),
                          ),
                        ),
                      ),

                      // Horizontal "Frequently bought" Cards (Compact Carousel)
                      SliverToBoxAdapter(
                        child: SizedBox(
                          height: 112,
                          child: ListView(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            children: [
                              _FrequentCard(
                                label: 'Favourites',
                                extraCount: '+18 more',
                                img1: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=150&q=80',
                                img2: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&q=80',
                                bgColor: const Color(0xFFEFF6FF),
                                onTap: () => cart.setSelectedCategory('cat_1'),
                              ),
                              _FrequentCard(
                                label: 'Oil, Ghee & Masala',
                                extraCount: '+16 more',
                                img1: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=150&q=80',
                                img2: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=150&q=80',
                                bgColor: const Color(0xFFEBFBF5),
                                onTap: () => cart.setSelectedCategory('cat_8'),
                              ),
                              _FrequentCard(
                                label: 'Rice, Atta & more',
                                extraCount: '+9 more',
                                img1: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=150&q=80',
                                img2: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80',
                                bgColor: const Color(0xFFFEFCE8),
                                onTap: () => cart.setSelectedCategory('cat_7'),
                              ),
                              _FrequentCard(
                                label: 'Rajma, Chole & Dal',
                                extraCount: '+5 more',
                                img1: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80',
                                img2: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=150&q=80',
                                bgColor: const Color(0xFFEBFBF5),
                                onTap: () => cart.setSelectedCategory('cat_7'),
                              ),
                              _FrequentCard(
                                label: 'Tea & Coffee',
                                extraCount: '+4 more',
                                img1: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=150&q=80',
                                img2: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=150&q=80',
                                bgColor: const Color(0xFFFEFCE8),
                                onTap: () => cart.setSelectedCategory('cat_14'),
                              ),
                              _FrequentCard(
                                label: 'Dry Fruits & Cereals',
                                extraCount: '+6 more',
                                img1: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=150&q=80',
                                img2: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=150&q=80',
                                bgColor: const Color(0xFFEFF6FF),
                                onTap: () => cart.setSelectedCategory('cat_10'),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // "See all products >" Pill Button
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(14, 8, 14, 8),
                          child: GestureDetector(
                            onTap: () => cart.goToCategories(),
                            child: Container(
                              height: 38,
                              decoration: BoxDecoration(
                                color: const Color(0xFFE0F2FE),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(0xFFBAE6FD)),
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 14),
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text('🛍️ 🥦 🥛', style: TextStyle(fontSize: 13)),
                                  SizedBox(width: 8),
                                  Text(
                                    'See all categories',
                                    style: TextStyle(
                                      color: Color(0xFF0369A1),
                                      fontWeight: FontWeight.w800,
                                      fontSize: 12,
                                    ),
                                  ),
                                  SizedBox(width: 4),
                                  Icon(Icons.chevron_right, color: Color(0xFF0369A1), size: 16),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],

                    // Category Banner / Search Header
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 6, 16, 10),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Row(
                                children: [
                                  Flexible(
                                    child: Text(
                                      searchQuery.trim().isNotEmpty
                                          ? 'Search Results'
                                          : (selectedCategory != 'ALL'
                                              ? (categories.cast<Category?>().firstWhere((c) => c?.id == selectedCategory, orElse: () => null)?.name ?? 'Category Items')
                                              : 'Instant Products'),
                                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  if (selectedCategory != 'ALL' || searchQuery.trim().isNotEmpty) ...[
                                    const SizedBox(width: 8),
                                    GestureDetector(
                                      onTap: () {
                                        _searchController.clear();
                                        setState(() => searchQuery = '');
                                        cart.setSelectedCategory('ALL');
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: Colors.red.shade50,
                                          borderRadius: BorderRadius.circular(12),
                                          border: Border.all(color: Colors.red.shade200),
                                        ),
                                        child: const Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text('Clear Filter', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.red)),
                                            SizedBox(width: 3),
                                            Icon(Icons.close, size: 12, color: Colors.red),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            Text(
                              '${filteredProducts.length} items',
                              style: const TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Product Grid or Empty State
                    if (filteredProducts.isNotEmpty)
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        sliver: SliverGrid(
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.66,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 14,
                          ),
                          delegate: SliverChildBuilderDelegate(
                            (context, index) => _ProductCard(product: filteredProducts[index]),
                            childCount: filteredProducts.length,
                          ),
                        ),
                      )
                    else
                      SliverToBoxAdapter(
                        child: Container(
                          margin: const EdgeInsets.all(24),
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.grey.shade200),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.02),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            children: [
                              const Icon(Icons.inventory_2_outlined, size: 52, color: AppTheme.textSecondary),
                              const SizedBox(height: 12),
                              const Text(
                                'No products found',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                searchQuery.isNotEmpty
                                    ? 'No items matched "$searchQuery". Try searching something else.'
                                    : 'No items found in this section.',
                                textAlign: TextAlign.center,
                                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton.icon(
                                onPressed: () {
                                  cart.setSelectedCategory('ALL');
                                  setState(() => searchQuery = '');
                                  loadData();
                                },
                                icon: const Icon(Icons.refresh, size: 16),
                                label: const Text('Reset & Show All Items'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.blinkitGreen,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    SliverToBoxAdapter(child: SizedBox(height: cart.totalItems > 0 ? 120 : 60)),
                  ],
                ),
              ),
      ),
    );
  }
}

class _HeaderCircleCategoryItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _HeaderCircleCategoryItem({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 7),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: isSelected ? Colors.white : Colors.white.withOpacity(0.24),
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? Colors.white : Colors.white.withOpacity(0.38),
                  width: 1.5,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.18),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        )
                      ]
                    : null,
              ),
              child: Icon(
                icon,
                size: 22,
                color: isSelected ? const Color(0xFF0C8CE9) : Colors.white,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                color: Colors.white,
                letterSpacing: -0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FrequentCard extends StatelessWidget {
  final String label;
  final String extraCount;
  final String img1;
  final String img2;
  final Color bgColor;
  final VoidCallback onTap;

  const _FrequentCard({
    required this.label,
    required this.extraCount,
    required this.img1,
    required this.img2,
    required this.bgColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        width: 120,
        margin: const EdgeInsets.only(right: 10),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.black.withOpacity(0.04)),
        ),
        padding: const EdgeInsets.all(8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Row of 2 Thumbnails
            Expanded(
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: const EdgeInsets.all(3),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          img1,
                          fit: BoxFit.cover,
                          errorBuilder: (c, e, s) => const Icon(Icons.store, size: 20, color: Colors.grey),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: const EdgeInsets.all(3),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          img2,
                          fit: BoxFit.cover,
                          errorBuilder: (c, e, s) => const Icon(Icons.store, size: 20, color: Colors.grey),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 5),
            // Count pill (e.g. +18 more)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                extraCount,
                style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Color(0xFF0284C7)),
              ),
            ),
            const SizedBox(height: 3),
            // Card Title
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF1E293B)),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Product product;
  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image with 8 MINS Badge
          Expanded(
            child: Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                  child: Image.network(
                    product.image,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (c, e, s) => Container(
                      color: Colors.grey.shade100,
                      child: const Icon(Icons.image, size: 50, color: Colors.grey),
                    ),
                  ),
                ),
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                    decoration: BoxDecoration(
                      color: product.stock > 0 ? AppTheme.blinkitGreen : Colors.red.shade700,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        Icon(product.stock > 0 ? Icons.timer : Icons.block, size: 10, color: Colors.white),
                        const SizedBox(width: 4),
                        Text(
                          product.stock > 0 ? '8 MINS' : 'SOLD OUT',
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Product Details
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.unit,
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  product.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                    height: 1.2,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '₹${product.price.truncateToDouble() == product.price ? product.price.toInt() : product.price.toStringAsFixed(2)}',
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                        ),
                        if (product.mrp > product.price)
                          Text(
                            '₹${product.mrp.truncateToDouble() == product.mrp ? product.mrp.toInt() : product.mrp.toStringAsFixed(2)}',
                            style: TextStyle(
                              decoration: TextDecoration.lineThrough,
                              color: Colors.grey.shade500,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                      ],
                    ),
                    _AddToCartButton(product: product),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AddToCartButton extends StatelessWidget {
  final Product product;
  const _AddToCartButton({required this.product});

  @override
  Widget build(BuildContext context) {
    return Consumer<CartProvider>(
      builder: (context, cart, child) {
        final inCart = cart.items.where((i) => i.product.id == product.id).fold(0, (sum, i) => sum + i.quantity);
        if (inCart > 0) {
          return Container(
            height: 34,
            decoration: BoxDecoration(
              color: AppTheme.blinkitGreen.withOpacity(0.12),
              border: Border.all(color: AppTheme.blinkitGreen, width: 1.5),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => cart.remove(product),
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 7),
                    child: Icon(Icons.remove, size: 15, color: AppTheme.blinkitGreen),
                  ),
                ),
                Text('$inCart', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppTheme.blinkitGreen)),
                GestureDetector(
                  onTap: () => cart.add(product),
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 7),
                    child: Icon(Icons.add, size: 15, color: AppTheme.blinkitGreen),
                  ),
                ),
              ],
            ),
          );
        }
        if (product.stock <= 0) {
          return Container(
            height: 34,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: const Text('SOLD OUT', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 10)),
          );
        }
        return SizedBox(
          height: 34,
          child: OutlinedButton(
            onPressed: () {
              if (cart.items.isNotEmpty && cart.items.first.product.storeId != product.storeId) {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    title: const Text('Clear cart and switch store?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    content: const Text('Your cart contains items from another store. Do you want to discard them and add items from this store?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: Colors.grey))),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: AppTheme.blinkitGreen, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                        onPressed: () {
                          cart.clear();
                          cart.add(product);
                          Navigator.pop(ctx);
                        }, 
                        child: const Text('Switch Store', style: TextStyle(color: Colors.white))
                      ),
                    ]
                  )
                );
              } else {
                cart.add(product);
              }
            },
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.blinkitGreen,
              side: const BorderSide(color: AppTheme.blinkitGreen, width: 1.5),
              padding: const EdgeInsets.symmetric(horizontal: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('ADD', style: TextStyle(color: AppTheme.blinkitGreen, fontWeight: FontWeight.w900, fontSize: 12)),
          ),
        );
      },
    );
  }
}
