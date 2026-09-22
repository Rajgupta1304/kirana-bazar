import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../cart_provider.dart';
import '../api_service.dart';
import '../models.dart';
import '../theme.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  List<Order> orders = [];
  bool isLoading = false;
  String selectedFilter = 'ALL'; // 'ALL', 'LIVE', 'COMPLETED'
  User? _lastUser;
  int? _lastTabIndex;
  int _lastOrdersVersion = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      loadOrders();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final cart = context.watch<CartProvider>();
    final user = cart.currentUser;
    final currentTab = cart.selectedTabIndex;
    final ordersVersion = cart.ordersVersion;
    final recentlyPlaced = cart.recentlyPlacedOrder;

    final userChanged = _lastUser?.id != user?.id;
    final tabBecameOrders = currentTab == 3 && _lastTabIndex != 3;
    final versionChanged = _lastOrdersVersion != ordersVersion;

    _lastUser = user;
    _lastTabIndex = currentTab;
    _lastOrdersVersion = ordersVersion;

    // Immediately insert the newly placed order at the top if not present yet
    if (recentlyPlaced != null && !orders.any((o) => o.id == recentlyPlaced.id)) {
      orders.insert(0, recentlyPlaced);
    }

    if (userChanged || (currentTab == 2 && (tabBecameOrders || versionChanged))) {
      Future.microtask(() {
        if (mounted) {
          loadOrders(silent: orders.isNotEmpty);
        }
      });
    }
  }

  Future<void> loadOrders({bool silent = false}) async {
    if (!mounted) return;
    final user = context.read<CartProvider>().currentUser;
    if (user == null) {
      setState(() {
        orders = [];
        isLoading = false;
      });
      return;
    }

    if (!silent) {
      setState(() => isLoading = true);
    }
    final fetched = await ApiService.getOrders(userId: user.id);
    if (mounted) {
      setState(() {
        orders = fetched;
        isLoading = false;
      });
    }
  }

  Future<void> _quickDemoLogin() async {
    setState(() => isLoading = true);
    final user = await ApiService.login('rahul@example.com', 'user123');
    if (user != null && mounted) {
      context.read<CartProvider>().setUser(user);
      await loadOrders();
    } else if (mounted) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Demo login failed. Make sure backend is running.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<CartProvider>().currentUser;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: AppTheme.primary.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.receipt_long_rounded, color: Colors.black87, size: 20),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'My Orders',
                  style: TextStyle(
                    color: Color(0xFF0F172A),
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.4,
                  ),
                ),
                Text(
                  'Live delivery status & history',
                  style: TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          if (user != null)
            IconButton(
              icon: const Icon(Icons.refresh_rounded, color: Color(0xFF0F172A)),
              tooltip: 'Refresh orders',
              onPressed: isLoading ? null : loadOrders,
            ),
        ],
      ),
      body: user == null ? _buildGuestView() : _buildAuthenticatedView(),
    );
  }

  Widget _buildGuestView() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        child: Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: Colors.grey.shade100),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 24,
                offset: const Offset(0, 10),
              )
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.18),
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Icon(Icons.shopping_bag_outlined, size: 40, color: Color(0xFFB45309)),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Track Deliveries Live',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A),
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Log in to see active delivery status, rider coordinates, and receipt invoices for your past orders.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                  height: 1.4,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 24),
              
              // Primary Action: Navigate to Profile / Login Tab
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: () {
                    context.read<CartProvider>().goToProfile();
                  },
                  icon: const Icon(Icons.login_rounded, size: 18),
                  label: const Text(
                    'Sign In to Your Account',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.black87,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Secondary Action: Instant Demo Customer Login
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton.icon(
                  onPressed: isLoading ? null : _quickDemoLogin,
                  icon: isLoading
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0F172A)),
                        )
                      : const Icon(Icons.flash_on, size: 18, color: Color(0xFFD97706)),
                  label: const Text(
                    'One-Tap Demo Login (Rahul Sharma)',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: Colors.grey.shade300),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAuthenticatedView() {
    if (isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: AppTheme.accent),
            SizedBox(height: 16),
            Text(
              'Fetching your orders...',
              style: TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      );
    }

    // Filter list based on selected segment
    final liveOrders = orders.where((o) => !['DELIVERED', 'CANCELLED', 'REJECTED'].contains(o.status)).toList();
    final completedOrders = orders.where((o) => ['DELIVERED', 'CANCELLED', 'REJECTED'].contains(o.status)).toList();

    List<Order> displayOrders = orders;
    if (selectedFilter == 'LIVE') {
      displayOrders = liveOrders;
    } else if (selectedFilter == 'COMPLETED') {
      displayOrders = completedOrders;
    }

    return RefreshIndicator(
      color: AppTheme.accent,
      onRefresh: loadOrders,
      child: CustomScrollView(
        slivers: [
          // Filter Chips Header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Row(
                children: [
                  _buildFilterChip('ALL', 'All (${orders.length})'),
                  const SizedBox(width: 8),
                  _buildFilterChip('LIVE', 'Active (${liveOrders.length})'),
                  const SizedBox(width: 8),
                  _buildFilterChip('COMPLETED', 'Past (${completedOrders.length})'),
                ],
              ),
            ),
          ),

          // Orders List or Empty State
          displayOrders.isEmpty
              ? SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.receipt_outlined, size: 36, color: Colors.grey.shade400),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'No orders in this section',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          selectedFilter == 'LIVE'
                              ? 'You have no deliveries currently in progress.'
                              : 'Place an order to see it listed here.',
                          style: TextStyle(fontSize: 13, color: Colors.grey.shade500),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: () => context.read<CartProvider>().goToHome(),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            foregroundColor: Colors.black87,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          ),
                          child: const Text('Start Shopping', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                )
              : SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        return _buildOrderCard(displayOrders[index]);
                      },
                      childCount: displayOrders.length,
                    ),
                  ),
                ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = selectedFilter == key;
    return GestureDetector(
      onTap: () => setState(() => selectedFilter = key),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0F172A) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF0F172A) : Colors.grey.shade200,
          ),
          boxShadow: isSelected
              ? [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 8, offset: const Offset(0, 3))]
              : [],
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            color: isSelected ? Colors.white : const Color(0xFF64748B),
          ),
        ),
      ),
    );
  }

  Widget _buildOrderCard(Order order) {
    final isActive = !['DELIVERED', 'CANCELLED', 'REJECTED'].contains(order.status);
    final shortId = order.id.length >= 6 ? order.id.substring(order.id.length - 6) : order.id;

    Color statusColor;
    Color statusBgColor;
    String statusLabel = order.status;

    switch (order.status) {
      case 'DELIVERED':
        statusColor = const Color(0xFF059669);
        statusBgColor = const Color(0xFFECFDF5);
        statusLabel = 'Delivered';
        break;
      case 'CANCELLED':
        statusColor = const Color(0xFFDC2626);
        statusBgColor = const Color(0xFFFEF2F2);
        statusLabel = 'Cancelled';
        break;
      case 'OUT_FOR_DELIVERY':
        statusColor = const Color(0xFFD97706);
        statusBgColor = const Color(0xFFFFFBEB);
        statusLabel = 'Out for Delivery';
        break;
      case 'READY_FOR_PICKUP':
      case 'PICKED_UP':
      case 'ASSIGNED_TO_RIDER':
        statusColor = const Color(0xFF2563EB);
        statusBgColor = const Color(0xFFEFF6FF);
        statusLabel = 'Rider Dispatched';
        break;
      case 'PICKING':
      case 'PACKED':
      case 'PREPARING':
        statusColor = const Color(0xFF7C3AED);
        statusBgColor = const Color(0xFFF5F3FF);
        statusLabel = 'Packing in Store';
        break;
      default:
        statusColor = const Color(0xFF0284C7);
        statusBgColor = const Color(0xFFF0F9FF);
        statusLabel = 'Order Placed';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isActive ? AppTheme.accent.withOpacity(0.3) : Colors.grey.shade200,
          width: isActive ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 14,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Order Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isActive ? AppTheme.accent.withOpacity(0.06) : Colors.grey.shade50,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(19)),
              border: Border(bottom: BorderSide(color: Colors.grey.shade100)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(
                      '#$shortId',
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 14,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '${order.items.length} item${order.items.length == 1 ? '' : 's'}',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black54),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusBgColor,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: statusColor.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (isActive) ...[
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                        ),
                        const SizedBox(width: 6),
                      ],
                      Text(
                        statusLabel,
                        style: TextStyle(
                          color: statusColor,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Order Body
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Item Preview List
                ...order.items.take(3).map((item) {
                  final itemName = item['name']?.toString() ?? 'Item';
                  final qty = item['quantity'] ?? 1;
                  final price = item['unitPrice'] ?? item['price'] ?? 0;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '$qty × $itemName',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF334155),
                              fontWeight: FontWeight.w500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          '₹${qty * price}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
                  );
                }),

                if (order.items.length > 3)
                  Text(
                    '+ ${order.items.length - 3} more items',
                    style: TextStyle(fontSize: 11, color: Colors.grey.shade500, fontStyle: FontStyle.italic),
                  ),

                const Divider(height: 20, color: Color(0xFFF1F5F9)),

                // Total Price Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Total Paid',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF64748B),
                      ),
                    ),
                    Text(
                      '₹${order.grandTotal.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 18,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                  ],
                ),

                // Live Delivery Progress Tracker
                if (isActive) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.grey.shade100),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.electric_scooter, size: 18, color: AppTheme.accent),
                            const SizedBox(width: 8),
                            const Text(
                              'Estimated Delivery in 8-10 Mins',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            const Spacer(),
                            Text(
                              '${(_getProgress(order.status) * 100).toInt()}%',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w900,
                                color: AppTheme.accent,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: _getProgress(order.status),
                            backgroundColor: Colors.grey.shade200,
                            color: AppTheme.accent,
                            minHeight: 6,
                          ),
                        ),
                      ],
                    ),
                  ),

                  if (['PLACED', 'CONFIRMED'].contains(order.status)) ...[
                    const SizedBox(height: 12),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton.icon(
                        onPressed: () async {
                          final confirm = await showDialog<bool>(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                              title: const Text('Cancel Order?', style: TextStyle(fontWeight: FontWeight.w800)),
                              content: const Text('Are you sure you want to cancel this order?'),
                              actions: [
                                TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')),
                                ElevatedButton(
                                  onPressed: () => Navigator.pop(ctx, true),
                                  style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
                                  child: const Text('Yes, Cancel', style: TextStyle(color: Colors.white)),
                                ),
                              ],
                            ),
                          );

                          if (confirm == true) {
                            final ok = await ApiService.updateOrderStatus(order.id, 'CANCELLED');
                            if (ok) {
                              loadOrders();
                            }
                          }
                        },
                        icon: const Icon(Icons.close, size: 14, color: Colors.red),
                        label: const Text(
                          'Cancel Order',
                          style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                    ),
                  ],
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  double _getProgress(String status) {
    switch (status) {
      case 'PLACED':
        return 0.25;
      case 'CONFIRMED':
      case 'PREPARING':
      case 'PICKING':
        return 0.50;
      case 'PACKED':
      case 'READY_FOR_PICKUP':
      case 'ASSIGNED_TO_RIDER':
      case 'PICKED_UP':
        return 0.75;
      case 'OUT_FOR_DELIVERY':
        return 0.90;
      case 'DELIVERED':
        return 1.0;
      default:
        return 0.1;
    }
  }
}
