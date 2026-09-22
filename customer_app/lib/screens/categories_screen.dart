import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api_service.dart';
import '../models.dart';
import '../theme.dart';
import '../cart_provider.dart';

class CategoriesScreen extends StatefulWidget {
  const CategoriesScreen({super.key});

  @override
  State<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  List<Category> categories = [];
  bool isLoading = true;
  String searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    loadCategories();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> loadCategories() async {
    setState(() => isLoading = true);
    try {
      final cats = await ApiService.getCategories();
      if (mounted) {
        setState(() {
          categories = cats.isNotEmpty ? cats : ApiService.defaultCategories;
          isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          categories = ApiService.defaultCategories;
          isLoading = false;
        });
      }
    }
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

    // Filter categories by search
    final filteredCategories = categories.where((cat) {
      if (searchQuery.isEmpty) return true;
      return cat.name.toLowerCase().contains(searchQuery.toLowerCase());
    }).toList();

    final groceryCategories = filteredCategories.where((c) => c.section == 'Grocery & Kitchen').toList();
    final snackCategories = filteredCategories.where((c) => c.section == 'Snacks & Drinks').toList();
    final otherCategories = filteredCategories.where((c) => c.section != 'Grocery & Kitchen' && c.section != 'Snacks & Drinks').toList();

    return Scaffold(
      backgroundColor: Colors.white,
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
        child: RefreshIndicator(
          color: AppTheme.blinkitGreen,
          onRefresh: loadCategories,
          child: CustomScrollView(
            slivers: [
              // Top Kirana Bazar Header
              SliverToBoxAdapter(
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF0C8CE9), Color(0xFF0272C9)],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                  padding: EdgeInsets.fromLTRB(16, MediaQuery.of(context).padding.top + 8, 16, 14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Top Row: Kirana Bazar in 8 mins & Wallet / Profile
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Kirana Bazar in',
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
                              // Wallet Pill
                              GestureDetector(
                                onTap: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Kirana Bazar Wallet: ₹0.00'),
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
                              // Profile Avatar
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
                              color: Colors.black.withOpacity(0.06),
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: TextField(
                          controller: _searchController,
                          onChanged: (val) => setState(() => searchQuery = val),
                          decoration: InputDecoration(
                            hintText: 'Search categories...',
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
                    ],
                  ),
                ),
              ),

              if (isLoading)
                const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator(color: AppTheme.blinkitGreen)),
                )
              else ...[
                // Section 1: Grocery & Kitchen
                if (groceryCategories.isNotEmpty) ...[
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
                      child: const Text(
                        'Grocery & Kitchen',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF1E293B),
                          letterSpacing: -0.3,
                        ),
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    sliver: SliverGrid(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 4,
                        childAspectRatio: 0.72,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 12,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => _CategoryGridCard(category: groceryCategories[index]),
                        childCount: groceryCategories.length,
                      ),
                    ),
                  ),
                ],

                // Section 2: Snacks & Drinks
                if (snackCategories.isNotEmpty) ...[
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 28, 16, 12),
                      child: const Text(
                        'Snacks & Drinks',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF1E293B),
                          letterSpacing: -0.3,
                        ),
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    sliver: SliverGrid(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 4,
                        childAspectRatio: 0.72,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 12,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => _CategoryGridCard(category: snackCategories[index]),
                        childCount: snackCategories.length,
                      ),
                    ),
                  ),
                ],

                // Other remaining categories
                if (otherCategories.isNotEmpty) ...[
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 28, 16, 12),
                      child: const Text(
                        'More Categories',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF1E293B),
                          letterSpacing: -0.3,
                        ),
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    sliver: SliverGrid(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 4,
                        childAspectRatio: 0.72,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 12,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => _CategoryGridCard(category: otherCategories[index]),
                        childCount: otherCategories.length,
                      ),
                    ),
                  ),
                ],

                SliverToBoxAdapter(
                  child: SizedBox(height: cart.totalItems > 0 ? 120 : 60),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _CategoryGridCard extends StatelessWidget {
  final Category category;
  const _CategoryGridCard({required this.category});

  Color _getCardColor(String id) {
    final colors = [
      const Color(0xFFE8F8F5), // Light mint
      const Color(0xFFEFF6FF), // Soft sky blue
      const Color(0xFFFEFCE8), // Cream yellow
      const Color(0xFFFFF1F2), // Soft rose
      const Color(0xFFF5F3FF), // Light lavender
      const Color(0xFFFFF7ED), // Light peach
    ];
    return colors[id.hashCode.abs() % colors.length];
  }

  @override
  Widget build(BuildContext context) {
    final cardBg = _getCardColor(category.id);

    return GestureDetector(
      onTap: () {
        context.read<CartProvider>().selectCategoryAndGoHome(category.id);
      },
      child: Column(
        children: [
          // Pastel Card Container with Category Visual
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.black.withOpacity(0.04), width: 1),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  )
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: category.image.isNotEmpty
                    ? Image.network(
                        category.image,
                        fit: BoxFit.cover,
                        errorBuilder: (c, e, s) => Center(
                          child: Text(category.icon, style: const TextStyle(fontSize: 32)),
                        ),
                      )
                    : Center(
                        child: Text(category.icon, style: const TextStyle(fontSize: 32)),
                      ),
              ),
            ),
          ),
          const SizedBox(height: 6),
          // Category Label Below
          SizedBox(
            height: 32,
            child: Text(
              category.name,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1E293B),
                height: 1.15,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
