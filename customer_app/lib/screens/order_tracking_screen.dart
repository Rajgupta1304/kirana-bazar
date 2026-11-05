import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models.dart';
import '../api_service.dart';
import '../theme.dart';

class OrderTrackingScreen extends StatefulWidget {
  final Order order;
  const OrderTrackingScreen({super.key, required this.order});

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> with SingleTickerProviderStateMixin {
  late Order currentOrder;
  Timer? _pollingTimer;
  bool _isLoading = false;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    currentOrder = widget.order;

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    // Initial fetch to get latest status, OTP, and ETA
    _fetchLatestOrder();

    // Poll every 5 seconds for live rider movement and status transitions
    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (mounted && currentOrder.status != 'DELIVERED' && currentOrder.status != 'CANCELLED') {
        _fetchLatestOrder(silent: true);
      }
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _fetchLatestOrder({bool silent = false}) async {
    if (!silent) setState(() => _isLoading = true);
    try {
      final updated = await ApiService.getOrderDetails(currentOrder.id);
      if (updated != null && mounted) {
        setState(() {
          currentOrder = updated;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (!silent && mounted) setState(() => _isLoading = false);
    }
  }

  void _callRider(String phone) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF0C831F).withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.phone, color: Color(0xFF0C831F)),
            ),
            const SizedBox(width: 10),
            const Text('Call Rider', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Delivery Partner: ${currentOrder.driverName}', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text('Contact Number: $phone', style: const TextStyle(fontSize: 15, color: Color(0xFF0C8CE9), fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            const Text('In a real device, this dials directly via phone app.', style: TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close'),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0C831F),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              Clipboard.setData(ClipboardData(text: phone));
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Rider phone number ($phone) copied to clipboard!'),
                  backgroundColor: const Color(0xFF0C831F),
                ),
              );
            },
            icon: const Icon(Icons.copy, size: 16, color: Colors.white),
            label: const Text('Copy & Dial', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDelivered = currentOrder.status == 'DELIVERED';
    final isCancelled = currentOrder.status == 'CANCELLED';
    final isOutForDelivery = currentOrder.status == 'OUT_FOR_DELIVERY';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Order & Live Delivery',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
            ),
            Text(
              'Order #${currentOrder.id}',
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: _isLoading 
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0F172A)))
                : const Icon(Icons.refresh, color: Color(0xFF0F172A)),
            onPressed: _isLoading ? null : () => _fetchLatestOrder(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => _fetchLatestOrder(),
        color: AppTheme.blinkitGreen,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Live ETA Hero Card (Blinkit-Style)
              _buildLiveEtaHero(isDelivered, isOutForDelivery, isCancelled),

              const SizedBox(height: 14),

              // 2. Customer Delivery OTP Card (Prominent requirement)
              if (!isDelivered && !isCancelled)
                _buildDeliveryOtpCard(),

              const SizedBox(height: 14),

              // 3. Interactive Route & Live GPS Map Visualizer
              _buildLiveRouteMap(isDelivered, isOutForDelivery),

              const SizedBox(height: 14),

              // 4. Delivery Partner / Rider Card
              if (!isCancelled)
                _buildRiderCard(),

              const SizedBox(height: 14),

              // 5. Order Tracking Stepper Timeline
              _buildTrackingStepper(),

              const SizedBox(height: 14),

              // 6. Delivery Address Card
              _buildAddressCard(),

              const SizedBox(height: 14),

              // 7. Order Items & Price Summary
              _buildOrderSummaryCard(),

              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLiveEtaHero(bool isDelivered, bool isOutForDelivery, bool isCancelled) {
    if (isDelivered) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF059669), Color(0xFF047857)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF059669).withOpacity(0.3),
              blurRadius: 15,
              offset: const Offset(0, 6),
            )
          ],
        ),
        child: Column(
          children: [
            const Icon(Icons.check_circle, color: Colors.white, size: 48),
            const SizedBox(height: 8),
            const Text(
              'Order Delivered Successfully!',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              currentOrder.deliveredAt.isNotEmpty
                  ? 'Delivered at ${currentOrder.deliveredAt}'
                  : 'Verified & received with Delivery OTP',
              style: const TextStyle(fontSize: 13, color: Colors.white70, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      );
    }

    if (isCancelled) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: const Color(0xFFFEF2F2),
          border: Border.all(color: const Color(0xFFF87171)),
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Row(
          children: [
            Icon(Icons.cancel, color: Color(0xFFDC2626), size: 36),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Order Cancelled', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF991B1B))),
                  Text('This order was cancelled. Payment has been refunded.', style: TextStyle(fontSize: 12, color: Color(0xFF7F1D1D))),
                ],
              ),
            ),
          ],
        ),
      );
    }

    final eta = currentOrder.etaMinutes > 0 ? currentOrder.etaMinutes : 8;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isOutForDelivery 
              ? [const Color(0xFF0C831F), const Color(0xFF096317)] 
              : [const Color(0xFF0284C7), const Color(0xFF0369A1)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: (isOutForDelivery ? const Color(0xFF0C831F) : const Color(0xFF0284C7)).withOpacity(0.35),
            blurRadius: 16,
            offset: const Offset(0, 6),
          )
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(color: Color(0xFFFDE047), shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        isOutForDelivery ? 'OUT FOR DELIVERY' : 'STORE PACKING',
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Arriving in $eta mins',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  isOutForDelivery
                      ? 'Rider is on the way to your address'
                      : 'Packing fresh at ${currentOrder.storeName}',
                  style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          ScaleTransition(
            scale: _pulseAnimation,
            child: Container(
              width: 58,
              height: 58,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.15),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  )
                ],
              ),
              child: Icon(
                isOutForDelivery ? Icons.electric_scooter : Icons.inventory_2,
                color: isOutForDelivery ? const Color(0xFF0C831F) : const Color(0xFF0284C7),
                size: 32,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryOtpCard() {
    final otp = currentOrder.deliveryOtp.isNotEmpty ? currentOrder.deliveryOtp : '4821';
    final digits = otp.split('');

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFFDE68A), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFF59E0B).withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const FittedBox(
            fit: BoxFit.scaleDown,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.shield_outlined, color: Color(0xFFD97706), size: 18),
                SizedBox(width: 6),
                Text(
                  'CUSTOMER DELIVERY OTP',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFFB45309),
                    letterSpacing: 1.0,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: digits.map((digit) {
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 5),
                  width: 52,
                  height: 58,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFF59E0B), width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFF59E0B).withOpacity(0.12),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      )
                    ],
                  ),
                  child: Text(
                    digit,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            '⚠️ Share this 4-digit OTP with your rider ONLY after receiving and inspecting all items at your door.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w700,
              color: Color(0xFF92400E),
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLiveRouteMap(bool isDelivered, bool isOutForDelivery) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          )
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Live Delivery Route',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.gps_fixed, size: 12, color: Color(0xFF2563EB)),
                    const SizedBox(width: 4),
                    Text(
                      currentOrder.riderLat != 0.0
                          ? 'GPS Live (${currentOrder.riderLat.toStringAsFixed(4)}, ${currentOrder.riderLng.toStringAsFixed(4)})'
                          : 'Live Two-Wheeler Route',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Route Visualizer (Store -> Scooter in Transit -> Customer)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Row(
              children: [
                // Store Node
                Column(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: const BoxDecoration(color: Color(0xFF0284C7), shape: BoxShape.circle),
                      child: const Icon(Icons.storefront, color: Colors.white, size: 20),
                    ),
                    const SizedBox(height: 4),
                    const Text('Dark Store', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF0284C7))),
                  ],
                ),

                // Connecting Animated Line with Scooter
                Expanded(
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        child: Row(
                          children: [
                            Expanded(
                              flex: isDelivered ? 10 : (isOutForDelivery ? 6 : 2),
                              child: Container(height: 3, color: AppTheme.blinkitGreen),
                            ),
                            Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: isDelivered ? AppTheme.blinkitGreen : const Color(0xFFF59E0B),
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 4,
                                  )
                                ],
                              ),
                              child: Icon(
                                isDelivered ? Icons.check : Icons.electric_scooter,
                                size: 16,
                                color: Colors.white,
                              ),
                            ),
                            Expanded(
                              flex: isDelivered ? 0 : (isOutForDelivery ? 4 : 8),
                              child: Container(height: 3, color: Colors.grey.shade300),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        isDelivered 
                            ? 'Delivered' 
                            : (isOutForDelivery ? 'On the way to your door' : 'Preparing at store'),
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.black54),
                      ),
                    ],
                  ),
                ),

                // Customer Node
                Column(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: isDelivered ? const Color(0xFF059669) : const Color(0xFF0F172A),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.home, color: Colors.white, size: 20),
                    ),
                    const SizedBox(height: 4),
                    const Text('You', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRiderCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          )
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0C831F), Color(0xFF0284C7)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF0C831F).withOpacity(0.2),
                  blurRadius: 8,
                )
              ],
            ),
            child: const Icon(Icons.two_wheeler, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      currentOrder.driverName.isNotEmpty ? currentOrder.driverName : 'Vikram Sharma',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.star, size: 10, color: Color(0xFFD97706)),
                          SizedBox(width: 2),
                          Text('4.9', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFFB45309))),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                const Text(
                  'Delivery Partner • EV Scooter',
                  style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                ),
                Text(
                  currentOrder.driverPhone.isNotEmpty ? currentOrder.driverPhone : '+91 98765 12345',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF0C8CE9), fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          ElevatedButton.icon(
            onPressed: () => _callRider(currentOrder.driverPhone.isNotEmpty ? currentOrder.driverPhone : '+91 98765 12345'),
            icon: const Icon(Icons.phone, size: 16, color: Colors.white),
            label: const Text('Call', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Colors.white)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0C831F),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrackingStepper() {
    final status = currentOrder.status;

    final steps = [
      {'title': 'Order Placed', 'subtitle': 'We have received your order', 'status': 'PLACED', 'done': true},
      {
        'title': 'Order Packed',
        'subtitle': 'Items picked & quality checked',
        'status': 'PACKED',
        'done': ['PACKED', 'READY_FOR_PICKUP', 'ASSIGNED_TO_RIDER', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'].contains(status)
      },
      {
        'title': 'Out for Delivery',
        'subtitle': 'Rider is carrying your package',
        'status': 'OUT_FOR_DELIVERY',
        'done': ['OUT_FOR_DELIVERY', 'DELIVERED'].contains(status)
      },
      {
        'title': 'Delivered',
        'subtitle': 'Verified with 4-digit OTP',
        'status': 'DELIVERED',
        'done': status == 'DELIVERED'
      },
    ];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Order Status Progress',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
          ),
          const SizedBox(height: 14),
          ...steps.asMap().entries.map((entry) {
            final idx = entry.key;
            final step = entry.value;
            final isDone = step['done'] as bool;
            final isLast = idx == steps.length - 1;

            return IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    children: [
                      Container(
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          color: isDone ? const Color(0xFF0C831F) : Colors.grey.shade300,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          isDone ? Icons.check : Icons.circle,
                          size: 13,
                          color: Colors.white,
                        ),
                      ),
                      if (!isLast)
                        Expanded(
                          child: Container(
                            width: 2,
                            color: isDone ? const Color(0xFF0C831F) : Colors.grey.shade300,
                            margin: const EdgeInsets.symmetric(vertical: 4),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            step['title'] as String,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: isDone ? const Color(0xFF0F172A) : Colors.grey.shade500,
                            ),
                          ),
                          Text(
                            step['subtitle'] as String,
                            style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildAddressCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Delivery Address',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
          ),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF0C8CE9).withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.location_on, color: Color(0xFF0C8CE9), size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      currentOrder.customerName.isNotEmpty ? currentOrder.customerName : 'Delivery Destination',
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      currentOrder.address.isNotEmpty ? currentOrder.address : 'B-12, Sector 14, Metro Heights',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.3),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOrderSummaryCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Order Summary',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
              ),
              Text(
                '${currentOrder.items.length} items',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...currentOrder.items.map((item) {
            final name = item['name']?.toString() ?? 'Item';
            final qty = item['quantity'] ?? 1;
            final price = item['unitPrice'] ?? item['price'] ?? 0;

            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      '$qty × $name',
                      style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Text(
                    '₹${qty * price}',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
            );
          }),
          const Divider(height: 22, color: Color(0xFFF1F5F9)),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Delivery Fee', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
              Text('FREE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0C831F))),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total Amount Paid', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
              Text(
                '₹${currentOrder.grandTotal.toStringAsFixed(0)}',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0C831F)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
