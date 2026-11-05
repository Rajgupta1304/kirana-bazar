import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../api_service.dart';
import '../models.dart';
import '../theme.dart';
import '../cart_provider.dart';
import '../widgets/app_image.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Product> products = [];
  List<Category> categories = [];
  List<BannerItem> banners = [];
  List<StoreBranch> stores = [];
  bool isLoading = true;
  String searchQuery = '';
  int _lastTab = 0;
  String _lastSelectedCat = 'ALL';
  String _lastStoreId = 'store_1';
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();

  // Active Banner Auto-Slide Controller & Timer
  final PageController _bannerPageController = PageController();
  int _currentBannerIndex = 0;
  Timer? _bannerSliderTimer;

  @override
  void initState() {
    super.initState();
    loadData();
  }

  void _setupBannerSlider() {
    _bannerSliderTimer?.cancel();
    if (banners.length <= 1) return;
    _bannerSliderTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (!mounted || !_bannerPageController.hasClients || banners.isEmpty) return;
      final nextIndex = (_currentBannerIndex + 1) % banners.length;
      _bannerPageController.animateToPage(
        nextIndex,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final cart = context.watch<CartProvider>();
    final currentTab = cart.selectedTabIndex;
    final currentCat = cart.selectedCategory;
    final currentStoreId = cart.selectedStoreId;

    if (currentStoreId != _lastStoreId) {
      _lastStoreId = currentStoreId;
      Future.microtask(() {
        if (mounted) loadData();
      });
    }

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
    final cart = context.read<CartProvider>();
    final storeId = cart.selectedStoreId;

    // Fast Startup: Pre-populate from in-memory cache immediately if available
    final cachedProds = ApiService.cachedProducts;
    final cachedCats = ApiService.cachedCategories;
    final cachedBns = ApiService.cachedBanners;

    if (cachedProds.isNotEmpty && products.isEmpty) {
      final inStoreProds = cachedProds.where((p) => p.inStore).toList();
      products = inStoreProds.isNotEmpty ? inStoreProds : cachedProds;
    }
    if (cachedCats.isNotEmpty && categories.isEmpty) {
      categories = cachedCats;
    }
    if (cachedBns != null && cachedBns.isNotEmpty && banners.isEmpty) {
      banners = cachedBns;
    }

    final hasContent = products.isNotEmpty || categories.isNotEmpty;
    if (!hasContent) {
      setState(() => isLoading = true);
    }

    try {
      final results = await Future.wait([
        ApiService.getProducts(storeId: storeId),
        ApiService.getCategories(),
        ApiService.getBanners(),
        ApiService.getStores(),
      ]);

      final prods = results[0] as List<Product>;
      final cats = results[1] as List<Category>;
      final bns = results[2] as List<BannerItem>;
      final strs = results[3] as List<StoreBranch>;

      if (mounted) {
        cart.setCategories(cats);
        setState(() {
          // Display products based on customer's location/branch
          final inStoreProds = prods.where((p) => p.inStore).toList();
          products = inStoreProds.isNotEmpty ? inStoreProds : prods;
          if (products.isEmpty) {
            products = ApiService.defaultProducts;
          }
          categories = cats.isNotEmpty ? cats : ApiService.defaultCategories;
          banners = bns;
          stores = strs;
          isLoading = false;
        });
        _setupBannerSlider();
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          if (products.isEmpty) products = ApiService.defaultProducts;
          if (categories.isEmpty) categories = ApiService.defaultCategories;
          isLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _bannerSliderTimer?.cancel();
    _bannerPageController.dispose();
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
  IconData _resolveCategoryIcon(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('grocer') || lower.contains('atta') || lower.contains('dal') || lower.contains('rice')) {
      return Icons.storefront_outlined;
    }
    if (lower.contains('dairy') || lower.contains('milk') || lower.contains('bread') || lower.contains('butter')) {
      return Icons.breakfast_dining_outlined;
    }
    if (lower.contains('vegetable') || lower.contains('fruit')) {
      return Icons.eco_outlined;
    }
    if (lower.contains('snack') || lower.contains('munch') || lower.contains('biscuit') || lower.contains('chip')) {
      return Icons.cookie_outlined;
    }
    if (lower.contains('drink') || lower.contains('beverage') || lower.contains('juice') || lower.contains('soda')) {
      return Icons.local_drink_outlined;
    }
    if (lower.contains('instant') || lower.contains('noodle') || lower.contains('pasta')) {
      return Icons.ramen_dining_outlined;
    }
    if (lower.contains('tea') || lower.contains('coffee')) {
      return Icons.coffee_outlined;
    }
    if (lower.contains('oil') || lower.contains('ghee')) {
      return Icons.oil_barrel_outlined;
    }
    if (lower.contains('bakery') || lower.contains('cake') || lower.contains('chocolat')) {
      return Icons.cake_outlined;
    }
    if (lower.contains('dry fruit') || lower.contains('nut')) {
      return Icons.lunch_dining_outlined;
    }
    if (lower.contains('pharmacy') || lower.contains('wellness') || lower.contains('health')) {
      return Icons.medical_services_outlined;
    }
    if (lower.contains('beauty') || lower.contains('personal') || lower.contains('skin')) {
      return Icons.face_retouching_natural_outlined;
    }
    if (lower.contains('ice cream') || lower.contains('dessert')) {
      return Icons.icecream_outlined;
    }
    if (lower.contains('paan')) {
      return Icons.spa_outlined;
    }
    return Icons.shopping_bag_outlined;
  }

  void _openVoiceSearchModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _VoiceSearchBottomSheet(
        onSearchSelected: (term) {
          _searchController.text = term;
          setState(() => searchQuery = term);
        },
      ),
    );
  }

  Future<void> _openImageSearchModal(BuildContext context) async {
    final picker = ImagePicker();

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) {
          bool isSearching = false;

          Future<void> performSearch(String hint, {String? base64Data}) async {
            setModalState(() => isSearching = true);
            final cart = context.read<CartProvider>();
            final matched = await ApiService.searchByImage(
              imageBase64: base64Data,
              visualHint: hint,
              storeId: cart.selectedStoreId,
            );
            if (mounted) {
              Navigator.pop(ctx);
              setState(() {
                if (matched.isNotEmpty) {
                  products = matched;
                  searchQuery = hint.isNotEmpty ? hint : 'Visual Search';
                  _searchController.text = searchQuery;
                } else {
                  searchQuery = hint;
                  _searchController.text = hint;
                }
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Visual Search: Found ${matched.length} matching products'),
                  backgroundColor: const Color(0xFF0C831F),
                ),
              );
            }
          }

          return Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: Color(0xFFEFF6FF),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.camera_alt, color: Color(0xFF0C8CE9), size: 24),
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'Visual Product Search',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                const Text(
                  'Take a photo or upload product packaging to find items in our store',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                ),
                const SizedBox(height: 20),

                if (isSearching)
                  const Padding(
                    padding: EdgeInsets.all(20),
                    child: Column(
                      children: [
                        CircularProgressIndicator(color: AppTheme.blinkitGreen),
                        SizedBox(height: 12),
                        Text('Analyzing packaging & visual features...', style: TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                  )
                else ...[
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            try {
                              final XFile? photo = await picker.pickImage(source: ImageSource.camera, maxWidth: 800);
                              if (photo != null) {
                                final bytes = await photo.readAsBytes();
                                final b64 = base64Encode(bytes);
                                await performSearch(photo.name, base64Data: b64);
                              }
                            } catch (e) {
                              await performSearch('Groceries');
                            }
                          },
                          icon: const Icon(Icons.photo_camera, color: Colors.white),
                          label: const Text('Take Photo', style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0C8CE9),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () async {
                            try {
                              final XFile? image = await picker.pickImage(source: ImageSource.gallery, maxWidth: 800);
                              if (image != null) {
                                final bytes = await image.readAsBytes();
                                final b64 = base64Encode(bytes);
                                await performSearch(image.name, base64Data: b64);
                              }
                            } catch (e) {
                              await performSearch('Groceries');
                            }
                          },
                          icon: const Icon(Icons.photo_library, color: Color(0xFF0C8CE9)),
                          label: const Text('Upload Photo', style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF0C8CE9))),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFF0C8CE9), width: 1.5),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'OR SEARCH BY PACKAGING SAMPLES:',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 0.5),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      'Milk Pouch 🥛',
                      'Atta Bag 🌾',
                      'Cooking Oil 🛢️',
                      'Tea Box ☕',
                      'Chips Packet 🍿',
                      'Chocolates 🍫',
                    ].map((sample) {
                      final cleanName = sample.split(' ').first;
                      return ActionChip(
                        backgroundColor: Colors.grey.shade100,
                        label: Text(sample, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        onPressed: () => performSearch(cleanName),
                      );
                    }).toList(),
                  ),
                ],
                const SizedBox(height: 10),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildBannerCarousel() {
    if (banners.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 6),
      child: Column(
        children: [
          SizedBox(
            height: 120,
            child: PageView.builder(
              controller: _bannerPageController,
              onPageChanged: (idx) => setState(() => _currentBannerIndex = idx),
              itemCount: banners.length,
              itemBuilder: (context, index) {
                final b = banners[index];
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      )
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(18),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        AppImage(
                          imageUrl: b.image,
                          fit: BoxFit.cover,
                          width: double.infinity,
                          errorWidget: Container(
                            color: const Color(0xFF0284C7),
                            child: const Icon(Icons.campaign, color: Colors.white, size: 40),
                          ),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.black.withOpacity(0.75),
                                Colors.black.withOpacity(0.2),
                                Colors.transparent,
                              ],
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                b.title,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: -0.3,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              if (b.subtitle.isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Text(
                                  b.subtitle,
                                  style: const TextStyle(
                                    color: Colors.white70,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFDE047),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Text(
                                  'Special Offer ✦',
                                  style: TextStyle(
                                    color: Colors.black,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          if (banners.length > 1) ...[
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: banners.asMap().entries.map((entry) {
                final isSelected = entry.key == _currentBannerIndex;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: isSelected ? 16 : 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF0C8CE9) : Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(3),
                  ),
                );
              }).toList(),
            ),
          ],
        ],
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
                                        clipBehavior: Clip.antiAlias,
                                        child: cart.currentUser != null && cart.currentUser!.profileImage.isNotEmpty
                                            ? AppImage(
                                                imageUrl: cart.currentUser!.profileImage,
                                                width: 38,
                                                height: 38,
                                                fit: BoxFit.cover,
                                                errorWidget: const Icon(Icons.person, color: Colors.white, size: 22),
                                              )
                                            : const Icon(Icons.person, color: Colors.white, size: 22),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),

                            const SizedBox(height: 12),

                            // 3-Method Search Bar: Text, Voice, and Visual Image Search
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
                              child: Row(
                                children: [
                                  const Padding(
                                    padding: EdgeInsets.only(left: 12, right: 8),
                                    child: Icon(Icons.search, color: Colors.black87, size: 22),
                                  ),
                                  Expanded(
                                    child: TextField(
                                      controller: _searchController,
                                      onChanged: (val) => setState(() => searchQuery = val),
                                      decoration: const InputDecoration(
                                        hintText: 'Search "milk", "tea", "dal", "chips"...',
                                        hintStyle: TextStyle(color: Colors.black45, fontSize: 13, fontWeight: FontWeight.w500),
                                        border: InputBorder.none,
                                        isDense: true,
                                        contentPadding: EdgeInsets.symmetric(vertical: 12),
                                      ),
                                    ),
                                  ),
                                  if (searchQuery.isNotEmpty)
                                    IconButton(
                                      icon: const Icon(Icons.close, color: Colors.black54, size: 20),
                                      onPressed: () {
                                        _searchController.clear();
                                        setState(() => searchQuery = '');
                                      },
                                    ),
                                  // Method B: Voice Search
                                  IconButton(
                                    icon: const Icon(Icons.mic, color: Color(0xFFEF4444), size: 22),
                                    tooltip: 'Voice Search',
                                    onPressed: () => _openVoiceSearchModal(context),
                                  ),
                                  // Method C: Image / Camera Visual Search
                                  IconButton(
                                    icon: const Icon(Icons.camera_alt, color: Color(0xFF0C8CE9), size: 22),
                                    tooltip: 'Photo / Visual Search',
                                    onPressed: () => _openImageSearchModal(context),
                                  ),
                                  const SizedBox(width: 4),
                                ],
                              ),
                            ),

                            const SizedBox(height: 8),

                            // Dynamic Circular Category Buttons (Synced across app & with Categories tab)
                            SizedBox(
                              height: 74,
                              child: Builder(
                                builder: (context) {
                                  final displayCategories = cart.categories.isNotEmpty ? cart.categories : categories;
                                  return ListView(
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
                                      ...displayCategories.map((cat) {
                                        return _HeaderCircleCategoryItem(
                                          icon: _resolveCategoryIcon(cat.name),
                                          label: cat.name,
                                          isSelected: selectedCategory == cat.id,
                                          onTap: () {
                                            _searchController.clear();
                                            setState(() => searchQuery = '');
                                            cart.setSelectedCategory(cat.id);
                                          },
                                        );
                                      }),
                                    ],
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Show Dynamic Active Banner Slider & Frequently Bought ONLY when on 'ALL' category and not searching
                    if (selectedCategory == 'ALL' && searchQuery.trim().isEmpty) ...[
                      // Active Promotional Banner Slider (Admin Managed with auto-slide & manual swipe)
                      SliverToBoxAdapter(
                        child: _buildBannerCarousel(),
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
                        child: AppImage(
                          imageUrl: img1,
                          fit: BoxFit.cover,
                          errorWidget: const Icon(Icons.store, size: 20, color: Colors.grey),
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
                        child: AppImage(
                          imageUrl: img2,
                          fit: BoxFit.cover,
                          errorWidget: const Icon(Icons.store, size: 20, color: Colors.grey),
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

class _Interactive3DViewer extends StatefulWidget {
  final Product product;
  const _Interactive3DViewer({required this.product});

  @override
  State<_Interactive3DViewer> createState() => _Interactive3DViewerState();
}

class _Interactive3DViewerState extends State<_Interactive3DViewer> with SingleTickerProviderStateMixin {
  double _rotX = 0.0;
  double _rotY = 0.0;
  bool _autoSpin = false;
  AnimationController? _spinController;

  @override
  void initState() {
    super.initState();
    _spinController = AnimationController(vsync: this, duration: const Duration(seconds: 8))
      ..addListener(() {
        if (_autoSpin && mounted) {
          setState(() {
            _rotY = _spinController!.value * 2 * 3.1415926535;
          });
        }
      });
  }

  @override
  void dispose() {
    _spinController?.dispose();
    super.dispose();
  }

  void _toggleAutoSpin() {
    setState(() {
      _autoSpin = !_autoSpin;
      if (_autoSpin) {
        _spinController?.repeat();
      } else {
        _spinController?.stop();
      }
    });
  }

  void _resetRotation() {
    setState(() {
      _autoSpin = false;
      _spinController?.stop();
      _rotX = 0.0;
      _rotY = 0.0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        GestureDetector(
          onPanUpdate: (details) {
            if (_autoSpin) {
              setState(() => _autoSpin = false);
              _spinController?.stop();
            }
            setState(() {
              _rotY += details.delta.dx * 0.015;
              _rotX -= details.delta.dy * 0.015;
              if (_rotX > 0.6) _rotX = 0.6;
              if (_rotX < -0.6) _rotX = -0.6;
            });
          },
          child: Container(
            height: 240,
            width: double.infinity,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              gradient: RadialGradient(
                colors: [
                  const Color(0xFF7C3AED).withOpacity(0.12),
                  const Color(0xFF0F172A).withOpacity(0.02),
                  Colors.transparent,
                ],
                radius: 0.85,
              ),
            ),
            child: Transform(
              alignment: FractionalOffset.center,
              transform: Matrix4.identity()
                ..setEntry(3, 2, 0.0016)
                ..rotateX(_rotX)
                ..rotateY(_rotY),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF7C3AED).withOpacity(0.35),
                      blurRadius: 28,
                      spreadRadius: 2,
                      offset: Offset(-_rotY * 12, 12 + _rotX * 12),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: AppImage(
                    imageUrl: widget.product.image,
                    width: 200,
                    height: 200,
                    fit: BoxFit.contain,
                    errorWidget: Container(
                      width: 200,
                      height: 200,
                      color: Colors.grey.shade100,
                      child: const Icon(Icons.image, size: 64, color: Colors.grey),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Row(
                children: [
                  Icon(Icons.touch_app_outlined, size: 13, color: Color(0xFF64748B)),
                  SizedBox(width: 4),
                  Text('Drag to rotate in 3D', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF64748B))),
                ],
              ),
            ),
            const SizedBox(width: 8),
            TextButton.icon(
              onPressed: _toggleAutoSpin,
              style: TextButton.styleFrom(
                visualDensity: VisualDensity.compact,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                backgroundColor: _autoSpin ? const Color(0xFFEDE9FE) : const Color(0xFFF1F5F9),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
              icon: Icon(
                _autoSpin ? Icons.pause_circle : Icons.play_circle_outline,
                size: 15,
                color: _autoSpin ? const Color(0xFF7C3AED) : const Color(0xFF475569),
              ),
              label: Text(
                _autoSpin ? 'Spinning' : 'Auto-Spin',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: _autoSpin ? const Color(0xFF7C3AED) : const Color(0xFF475569),
                ),
              ),
            ),
            const SizedBox(width: 6),
            IconButton(
              icon: const Icon(Icons.restart_alt, size: 18, color: Color(0xFF64748B)),
              tooltip: 'Reset View',
              onPressed: _resetRotation,
              visualDensity: VisualDensity.compact,
            ),
          ],
        ),
      ],
    );
  }
}

void _showProductDetailsModal(BuildContext context, Product product) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (product.isAnimation)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF8B5CF6), Color(0xFF6D28D9)],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.view_in_ar_rounded, size: 14, color: Colors.white),
                      SizedBox(width: 5),
                      Text(
                        '3D Perspective View',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 11),
                      ),
                    ],
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.blinkitGreen.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.bolt, size: 14, color: AppTheme.blinkitGreen),
                      SizedBox(width: 4),
                      Text(
                        '8 MINS DELIVERY',
                        style: TextStyle(color: AppTheme.blinkitGreen, fontWeight: FontWeight.w900, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
            ],
          ),
          const SizedBox(height: 12),
          if (product.isAnimation)
            _Interactive3DViewer(product: product)
          else
            Center(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(18),
                child: AppImage(
                  imageUrl: product.image,
                  width: 220,
                  height: 220,
                  fit: BoxFit.contain,
                ),
              ),
            ),
          const SizedBox(height: 16),
          Text(
            product.unit,
            style: TextStyle(color: Colors.grey.shade600, fontSize: 12, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            product.name,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '₹${product.price.truncateToDouble() == product.price ? product.price.toInt() : product.price.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                  ),
                  if (product.mrp > product.price)
                    Text(
                      'MRP ₹${product.mrp.truncateToDouble() == product.mrp ? product.mrp.toInt() : product.mrp.toStringAsFixed(2)}',
                      style: TextStyle(
                        decoration: TextDecoration.lineThrough,
                        color: Colors.grey.shade500,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
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
  );
}

class _ProductCard extends StatelessWidget {
  final Product product;
  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showProductDetailsModal(context, product),
      behavior: HitTestBehavior.opaque,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: product.isAnimation
              ? Border.all(color: const Color(0xFF8B5CF6).withOpacity(0.35), width: 1.2)
              : null,
          boxShadow: [
            BoxShadow(
              color: product.isAnimation
                  ? const Color(0xFF7C3AED).withOpacity(0.12)
                  : Colors.black.withOpacity(0.04),
              blurRadius: product.isAnimation ? 16 : 12,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with 8 MINS Badge & 3D Indicator
            Expanded(
              child: Stack(
                children: [
                  Positioned.fill(
                    child: AppImage(
                      imageUrl: product.image,
                      width: double.infinity,
                      height: double.infinity,
                      fit: BoxFit.cover,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                      errorWidget: Container(
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
                        color: product.stock > 0 ? AppTheme.blinkitGreen : const Color(0xFFDC2626),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(product.stock > 0 ? Icons.timer : Icons.block, size: 10, color: Colors.white),
                          const SizedBox(width: 4),
                          Text(
                            product.stock > 0 ? '8 MINS' : 'OUT OF STOCK',
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (product.isAnimation)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3.5),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF8B5CF6), Color(0xFF6D28D9)],
                          ),
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF6D28D9).withOpacity(0.4),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            )
                          ],
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.view_in_ar_rounded, size: 11, color: Colors.white),
                            SizedBox(width: 3),
                            Text(
                              '3D',
                              style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.5),
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
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFFCA5A5)),
            ),
            child: const Text(
              'OUT OF STOCK',
              style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w900, fontSize: 10),
            ),
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

class _VoiceSearchBottomSheet extends StatefulWidget {
  final ValueChanged<String> onSearchSelected;

  const _VoiceSearchBottomSheet({required this.onSearchSelected});

  @override
  State<_VoiceSearchBottomSheet> createState() => _VoiceSearchBottomSheetState();
}

class _VoiceSearchBottomSheetState extends State<_VoiceSearchBottomSheet>
    with SingleTickerProviderStateMixin {
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isAvailable = false;
  bool _isListening = false;
  String _recognizedWords = '';
  String _statusMessage = 'Initializing microphone...';
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  final List<String> _suggestions = const [
    'Milk',
    'Bread',
    'Eggs',
    'Atta',
    'Sugar',
    'Oil',
    'Maggi',
    'Tea',
    'Rice',
    'Butter',
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.22).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _initSpeech();
  }

  Future<void> _initSpeech() async {
    try {
      final available = await _speech.initialize(
        onStatus: (status) {
          if (!mounted) return;
          if (status == 'listening') {
            setState(() {
              _isListening = true;
              _statusMessage = 'Listening... Speak now';
            });
          } else if (status == 'notListening' || status == 'done') {
            setState(() {
              _isListening = false;
              if (_recognizedWords.isEmpty) {
                _statusMessage = 'Tap the microphone to speak';
              } else {
                _statusMessage = 'Tap to speak again';
              }
            });
          }
        },
        onError: (errorNotification) {
          if (!mounted) return;
          setState(() {
            _isListening = false;
            _statusMessage = 'Could not catch that. Tap microphone to try again.';
          });
        },
      );

      if (!mounted) return;
      setState(() {
        _isAvailable = available;
        if (available) {
          _statusMessage = 'Listening... Speak now';
        } else {
          _statusMessage = 'Microphone permission denied or voice recognition unavailable.';
        }
      });

      if (available) {
        _startListening();
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isAvailable = false;
        _isListening = false;
        _statusMessage = 'Voice search not supported on this platform/browser.';
      });
    }
  }

  Future<void> _startListening() async {
    if (!_isAvailable) {
      await _initSpeech();
      if (!_isAvailable) return;
    }

    setState(() {
      _recognizedWords = '';
      _isListening = true;
      _statusMessage = 'Listening... Speak now';
    });

    try {
      await _speech.listen(
        onResult: (result) {
          if (!mounted) return;
          setState(() {
            _recognizedWords = result.recognizedWords;
          });
          if (result.finalResult && _recognizedWords.trim().isNotEmpty) {
            Future.delayed(const Duration(milliseconds: 500), () {
              if (mounted && _recognizedWords.trim().isNotEmpty) {
                widget.onSearchSelected(_recognizedWords.trim());
                Navigator.of(context).pop();
              }
            });
          }
        },
        listenOptions: stt.SpeechListenOptions(
          listenMode: stt.ListenMode.search,
          cancelOnError: true,
          partialResults: true,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isListening = false;
        _statusMessage = 'Error listening: $e';
      });
    }
  }

  Future<void> _stopListening() async {
    try {
      await _speech.stop();
    } catch (_) {}
    if (mounted) {
      setState(() {
        _isListening = false;
      });
    }
  }

  void _submitSearch(String query) {
    if (query.trim().isEmpty) return;
    _stopListening();
    widget.onSearchSelected(query.trim());
    Navigator.of(context).pop();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    try {
      if (_speech.isListening) {
        _speech.stop();
      }
    } catch (_) {}
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Container(
      padding: EdgeInsets.fromLTRB(20, 16, 20, 20 + bottomInset),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Drag handle
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            // Header
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Voice Search',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E293B),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Search for groceries by speaking in Hindi or English',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.grey),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Mic button with ripple pulse
            GestureDetector(
              onTap: () {
                if (_isListening) {
                  _stopListening();
                } else {
                  _startListening();
                }
              },
              child: AnimatedBuilder(
                animation: _pulseAnimation,
                builder: (context, child) {
                  return Stack(
                    alignment: Alignment.center,
                    children: [
                      if (_isListening)
                        Transform.scale(
                          scale: _pulseAnimation.value,
                          child: Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: const Color(0xFFEF4444).withOpacity(0.2),
                            ),
                          ),
                        ),
                      Container(
                        width: 76,
                        height: 76,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(
                            colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFFEF4444).withOpacity(_isListening ? 0.45 : 0.25),
                              blurRadius: _isListening ? 18 : 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Icon(
                          _isListening ? Icons.mic : Icons.mic_none,
                          color: Colors.white,
                          size: 38,
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
            const SizedBox(height: 16),

            // Status / listening label
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: Text(
                _statusMessage,
                key: ValueKey<String>(_statusMessage),
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: _isListening ? const Color(0xFFEF4444) : Colors.grey.shade700,
                ),
              ),
            ),

            // Live recognized words
            if (_recognizedWords.isNotEmpty) ...[
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.record_voice_over, size: 20, color: Color(0xFF0C8CE9)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _recognizedWords,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.arrow_forward, color: Color(0xFF0C8CE9)),
                      onPressed: () => _submitSearch(_recognizedWords),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 44,
                child: ElevatedButton.icon(
                  onPressed: () => _submitSearch(_recognizedWords),
                  icon: const Icon(Icons.search, size: 18),
                  label: Text('Search for "$_recognizedWords"'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0C8CE9),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ),
            ],

            const SizedBox(height: 20),

            // Suggestions Chips
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Popular Searches',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey.shade600,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _suggestions.map((suggestion) {
                return ActionChip(
                  label: Text(suggestion),
                  labelStyle: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF334155),
                  ),
                  backgroundColor: const Color(0xFFF1F5F9),
                  side: BorderSide(color: Colors.grey.shade300, width: 0.8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  onPressed: () => _submitSearch(suggestion),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}
