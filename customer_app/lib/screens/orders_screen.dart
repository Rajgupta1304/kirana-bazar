import 'package:flutter/material.dart';
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
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    loadOrders();
  }

  Future<void> loadOrders() async {
    final fetched = await ApiService.getOrders();
    setState(() {
      orders = fetched;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('My Orders')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.accent))
          : RefreshIndicator(
              color: AppTheme.accent,
              onRefresh: loadOrders,
              child: orders.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.receipt_long, size: 80, color: Colors.grey.shade300),
                          const SizedBox(height: 16),
                          const Text('No orders yet', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: orders.length,
                      itemBuilder: (context, index) {
                        final order = orders[index];
                        final isActive = !['DELIVERED', 'CANCELLED', 'REJECTED'].contains(order.status);
                        
                        return Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: isActive ? AppTheme.accent.withOpacity(0.5) : Colors.grey.shade200),
                            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                decoration: BoxDecoration(
                                  color: isActive ? AppTheme.accent.withOpacity(0.1) : Colors.grey.shade50,
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                                  border: Border(bottom: BorderSide(color: Colors.grey.shade100)),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Order #${order.id.substring(order.id.length - 6)}', style: const TextStyle(fontWeight: FontWeight.w900)),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: isActive ? AppTheme.accent : Colors.grey.shade400,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(order.status, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(Icons.shopping_bag_outlined, color: AppTheme.textSecondary),
                                        const SizedBox(width: 8),
                                        Text('${order.items.length} items', style: const TextStyle(fontWeight: FontWeight.bold)),
                                        const Spacer(),
                                        Text('₹${order.grandTotal}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                                      ],
                                    ),
                                    if (isActive) ...[
                                      const SizedBox(height: 16),
                                      LinearProgressIndicator(
                                        value: _getProgress(order.status),
                                        backgroundColor: Colors.grey.shade200,
                                        color: AppTheme.accent,
                                        minHeight: 6,
                                        borderRadius: BorderRadius.circular(3),
                                      ),
                                      const SizedBox(height: 8),
                                      const Text('Arriving shortly. Track live status above.', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                                    ]
                                  ],
                                ),
                              )
                            ],
                          ),
                        );
                      },
                    ),
            ),
    );
  }

  double _getProgress(String status) {
    switch (status) {
      case 'Received': return 0.2;
      case 'PENDING': return 0.2;
      case 'ACCEPTED': return 0.4;
      case 'PREPARING': return 0.6;
      case 'READY': return 0.8;
      case 'OUT_FOR_DELIVERY': return 0.9;
      case 'DELIVERED': return 1.0;
      default: return 0.0;
    }
  }
}
