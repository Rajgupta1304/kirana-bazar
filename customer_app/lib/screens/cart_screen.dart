import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../cart_provider.dart';
import '../theme.dart';
import '../api_service.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    if (cart.items.isEmpty) {
      return Scaffold(
        backgroundColor: AppTheme.background,
        appBar: AppBar(title: const Text('Checkout')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.shopping_bag_outlined, size: 80, color: Colors.grey.shade300),
              const SizedBox(height: 16),
              const Text('Your cart is empty', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
              const SizedBox(height: 8),
              Text('Browse products and add them to cart', style: TextStyle(color: Colors.grey.shade600)),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('Checkout')),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.timer, color: AppTheme.accent),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Delivery in 8 mins', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                          Text('Shipment of 1 item', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final item = cart.items[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(item.product.image, width: 60, height: 60, fit: BoxFit.cover, errorBuilder: (c,e,s) => Container(width: 60, height: 60, color: Colors.grey.shade200, child: const Icon(Icons.image))),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.product.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            const SizedBox(height: 4),
                            Text(item.product.unit, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                            const SizedBox(height: 4),
                            Text('₹${item.product.price}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                          ],
                        ),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: AppTheme.accent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(icon: const Icon(Icons.remove, color: Colors.white, size: 16), constraints: const BoxConstraints(), padding: const EdgeInsets.all(8), onPressed: () => cart.remove(item.product)),
                            Text('${item.quantity}', style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white)),
                            IconButton(icon: const Icon(Icons.add, color: Colors.white, size: 16), constraints: const BoxConstraints(), padding: const EdgeInsets.all(8), onPressed: () => cart.add(item.product)),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
              childCount: cart.items.length,
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Bill Details', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Column(
                      children: [
                        _BillRow(title: 'Item Total', amount: cart.totalAmount),
                        const _BillRow(title: 'Delivery Fee', amount: 15),
                        const _BillRow(title: 'Handling Fee', amount: 5),
                        const Divider(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('To Pay', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                            Text('₹${cart.totalAmount + 20}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
        ),
        child: ElevatedButton(
          onPressed: () async {
            if (cart.currentUser == null) {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please login from Profile tab to checkout')));
              return;
            }
            
            showDialog(context: context, barrierDismissible: false, builder: (_) => const Center(child: CircularProgressIndicator(color: AppTheme.accent)));

            final orderItems = cart.items.map((i) => {
              'id': i.product.id,
              'name': i.product.name,
              'price': i.product.price,
              'quantity': i.quantity,
              'storeId': i.product.storeId // Changed to storeId as per new architecture
            }).toList();

            final order = await ApiService.placeOrder(orderItems, cart.currentUser!, 0, 'UPI');
            Navigator.pop(context); // pop loading

            if (order != null) {
              cart.clear();
              // Show Scratch Card Coupon Dialog
              showDialog(
                context: context,
                builder: (BuildContext ctx) {
                  return AlertDialog(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    backgroundColor: Colors.white,
                    contentPadding: const EdgeInsets.all(24),
                    content: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.celebration, size: 64, color: AppTheme.accent),
                        const SizedBox(height: 16),
                        const Text('Order Placed Successfully!', 
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)
                        ),
                        const SizedBox(height: 12),
                        const Text('Track your delivery live in the Orders tab.', 
                          textAlign: TextAlign.center,
                          style: TextStyle(color: AppTheme.textSecondary)
                        ),
                        const SizedBox(height: 24),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFFFFD700), Color(0xFFF59E0B)]
                            ),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.amber.shade200, width: 2),
                          ),
                          child: const Column(
                            children: [
                              Text('🎉 SCRATCH & WIN 🎉', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.black87)),
                              SizedBox(height: 8),
                              Text('You won a mystery coupon!', style: TextStyle(fontSize: 12, color: Colors.black54, fontWeight: FontWeight.bold)),
                              SizedBox(height: 16),
                              Text('FLAT50', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: 2)),
                              Text('Save ₹50 on your next order', style: TextStyle(fontSize: 10, color: Colors.black54, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => Navigator.pop(ctx),
                            child: const Text('Awesome!'),
                          ),
                        )
                      ],
                    ),
                  );
                }
              );
            } else {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to place order'), backgroundColor: Colors.red));
            }
          },
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('₹${cart.totalAmount + 20}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                  const Text('TOTAL', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
              const Row(
                children: [
                  Text('Place Order', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                  SizedBox(width: 8),
                  Icon(Icons.arrow_forward_ios, size: 16),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}

class _BillRow extends StatelessWidget {
  final String title;
  final double amount;
  const _BillRow({required this.title, required this.amount});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
          Text('₹$amount', style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
