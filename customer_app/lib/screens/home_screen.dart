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
  String selectedCategory = 'ALL';
  String searchQuery = '';

  @override
  void initState() {
    super.initState();
    loadData();
  }

  Future<void> loadData() async {
    final prods = await ApiService.getProducts();
    final cats = await ApiService.getCategories();
    setState(() {
      products = prods;
      categories = cats;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    var filteredProducts = products;
    if (selectedCategory != 'ALL') {
      filteredProducts = filteredProducts.where((p) => p.categoryId == selectedCategory).toList();
    }
    if (searchQuery.isNotEmpty) {
      filteredProducts = filteredProducts.where((p) => 
        p.name.toLowerCase().contains(searchQuery.toLowerCase()) || 
        p.categoryName.toLowerCase().contains(searchQuery.toLowerCase())
      ).toList();
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.flash_on, color: AppTheme.secondary, size: 20),
            ),
            const SizedBox(width: 12),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Delivery in 8 mins', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                Text('Home - B-12, Sector 14, Metro...', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle_outlined, size: 28),
            onPressed: () {},
          )
        ],
      ),
      body: isLoading 
          ? const Center(child: CircularProgressIndicator(color: AppTheme.accent))
          : RefreshIndicator(
              color: AppTheme.accent,
              onRefresh: loadData,
              child: CustomScrollView(
                slivers: [
                  // Search Bar
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                      child: TextField(
                        onChanged: (val) => setState(() => searchQuery = val),
                        decoration: InputDecoration(
                          hintText: 'Search "milk", "chips", "tomatoes"...',
                          prefixIcon: const Icon(Icons.search, color: AppTheme.textSecondary),
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide(color: Colors.grey.shade200),
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Categories
                  SliverToBoxAdapter(
                    child: SizedBox(
                      height: 50,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: categories.length + 1,
                        itemBuilder: (context, index) {
                          final isAll = index == 0;
                          final catId = isAll ? 'ALL' : categories[index - 1].id;
                          final isSelected = selectedCategory == catId;
                          final label = isAll ? 'All Items' : '${categories[index - 1].icon} ${categories[index - 1].name}';

                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: FilterChip(
                              label: Text(label, style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: isSelected ? AppTheme.surface : AppTheme.textPrimary
                              )),
                              selected: isSelected,
                              onSelected: (_) => setState(() => selectedCategory = catId),
                              backgroundColor: Colors.white,
                              selectedColor: AppTheme.secondary,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: BorderSide(color: isSelected ? AppTheme.secondary : Colors.grey.shade200),
                              ),
                              elevation: 0,
                              pressElevation: 2,
                            ),
                          );
                        },
                      ),
                    ),
                  ),

                  // Banner
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Container(
                        height: 120,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          gradient: const LinearGradient(
                            colors: [AppTheme.primary, Color(0xFFF59E0B)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          boxShadow: [
                            BoxShadow(color: AppTheme.primary.withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 5))
                          ]
                        ),
                        padding: const EdgeInsets.all(20),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.black,
                                      borderRadius: BorderRadius.circular(8)
                                    ),
                                    child: const Text('SUPER SAVER', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                                  ),
                                  const SizedBox(height: 8),
                                  const Text('Get 20% OFF\non Fresh Fruits', style: TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.w900, height: 1.2)),
                                ],
                              ),
                            ),
                            const Icon(Icons.local_florist, size: 60, color: Colors.black12),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // Section Title
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Instant Products', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                          Text('${filteredProducts.length} items', style: const TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),

                  // Product Grid
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: SliverGrid(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.65,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => _ProductCard(product: filteredProducts[index]),
                        childCount: filteredProducts.length,
                      ),
                    ),
                  ),
                  const SliverToBoxAdapter(child: SizedBox(height: 40)),
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
            blurRadius: 15,
            offset: const Offset(0, 5),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          Expanded(
            child: Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                  child: Image.network(
                    product.image,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (c,e,s) => Container(color: Colors.grey.shade100, child: const Icon(Icons.image, size: 50, color: Colors.grey)),
                  ),
                ),
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.accent,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.timer, size: 10, color: Colors.white),
                        const SizedBox(width: 4),
                        const Text('8 MINS', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Details
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product.unit, style: TextStyle(color: Colors.grey.shade600, fontSize: 11, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(
                  product.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, height: 1.2, color: AppTheme.textPrimary),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('₹${product.price}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                        if (product.mrp > product.price)
                          Text('₹${product.mrp}', style: TextStyle(decoration: TextDecoration.lineThrough, color: Colors.grey.shade500, fontSize: 11, fontWeight: FontWeight.bold)),
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
            height: 36,
            decoration: BoxDecoration(
              color: AppTheme.accent.withOpacity(0.1),
              border: Border.all(color: AppTheme.accent, width: 1.5),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => cart.remove(product),
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: Icon(Icons.remove, size: 16, color: AppTheme.accent),
                  ),
                ),
                Text('$inCart', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: AppTheme.accent)),
                GestureDetector(
                  onTap: () => cart.add(product),
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: Icon(Icons.add, size: 16, color: AppTheme.accent),
                  ),
                ),
              ],
            ),
          );
        }
        return SizedBox(
          height: 36,
          child: OutlinedButton(
            onPressed: () => cart.add(product),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('ADD', style: TextStyle(color: AppTheme.accent, fontWeight: FontWeight.w900)),
          ),
        );
      },
    );
  }
}
