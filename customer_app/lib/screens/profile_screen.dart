import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../cart_provider.dart';
import '../api_service.dart';
import '../theme.dart';
import '../models.dart';
import '../widgets/app_image.dart';
import 'auth_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {

  Future<void> _pickAndUploadProfileImage(User user) async {
    final picker = ImagePicker();
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Update Profile Picture', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              ListTile(
                leading: const Icon(Icons.camera_alt, color: Color(0xFF0C831F)),
                title: const Text('Take Photo with Camera'),
                onTap: () => Navigator.pop(ctx, ImageSource.camera),
              ),
              ListTile(
                leading: const Icon(Icons.photo_library, color: Color(0xFF0C8CE9)),
                title: const Text('Choose from Gallery'),
                onTap: () => Navigator.pop(ctx, ImageSource.gallery),
              ),
            ],
          ),
        ),
      ),
    );

    if (source == null) return;
    try {
      final picked = await picker.pickImage(source: source, maxWidth: 512, maxHeight: 512, imageQuality: 80);
      if (picked == null) return;
      final bytes = await picked.readAsBytes();
      final base64Str = 'data:image/jpeg;base64,${base64Encode(bytes)}';

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Updating profile image...'), duration: Duration(seconds: 1)),
        );
      }
      final updated = await ApiService.updateUser(user.id, profileImage: base64Str);
      if (mounted) {
        if (updated != null) {
          context.read<CartProvider>().updateUser(updated);
        } else {
          context.read<CartProvider>().updateProfileImage(base64Str);
        }
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile picture updated successfully!'), backgroundColor: AppTheme.accent),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update picture: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _showMapLocationSelector(User user) {
    String selectedLocation = user.address.isNotEmpty ? user.address : 'Sector 14, Main Market, Gurugram';
    final customAddrCtrl = TextEditingController(text: selectedLocation);
    bool isSaving = false;

    final presetLocations = [
      {'title': 'Current GPS Location', 'desc': 'Main Market, Sector 14, Gurugram - 122001', 'icon': Icons.my_location, 'color': const Color(0xFF0C8CE9)},
      {'title': 'Home', 'desc': 'Flat 402, Metro Heights, Sector 104, Gurugram', 'icon': Icons.home, 'color': const Color(0xFF0C831F)},
      {'title': 'Work / Office', 'desc': 'Tower B, DLF Cyber City, Phase 2, Gurugram', 'icon': Icons.business, 'color': const Color(0xFF7C3AED)},
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          padding: EdgeInsets.only(
            top: 20,
            left: 20,
            right: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
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
                  const Row(
                    children: [
                      Icon(Icons.map_outlined, color: Color(0xFF0C8CE9), size: 24),
                      SizedBox(width: 8),
                      Text('Select on Map / GPS', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                    ],
                  ),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 12),

              // Visual Map Simulator Card
              Container(
                height: 120,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFBFDBFE)),
                ),
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.12), blurRadius: 8, offset: const Offset(0, 3)),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.location_pin, color: Color(0xFFDC2626), size: 20),
                        SizedBox(width: 6),
                        Text('Selected GPS Pin Location', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: Color(0xFF0F172A))),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 14),
              const Text('QUICK LOCATIONS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 0.5)),
              const SizedBox(height: 8),

              ...presetLocations.map((item) {
                final isSelected = selectedLocation == item['desc'];
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
                    dense: true,
                    onTap: () {
                      setModalState(() {
                        selectedLocation = item['desc'] as String;
                        customAddrCtrl.text = selectedLocation;
                      });
                    },
                    leading: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: (item['color'] as Color).withOpacity(0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(item['icon'] as IconData, color: item['color'] as Color, size: 18),
                    ),
                    title: Text(item['title'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    subtitle: Text(item['desc'] as String, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                    trailing: isSelected ? const Icon(Icons.check_circle, color: Color(0xFF0C8CE9), size: 20) : null,
                  ),
                );
              }),

              const SizedBox(height: 8),
              TextField(
                controller: customAddrCtrl,
                maxLines: 2,
                decoration: const InputDecoration(
                  labelText: 'Selected Detailed Address',
                  prefixIcon: Icon(Icons.edit_location_alt_outlined),
                ),
              ),
              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: isSaving ? null : () async {
                    final addr = customAddrCtrl.text.trim();
                    if (addr.isEmpty) return;
                    setModalState(() => isSaving = true);
                    final updated = await ApiService.updateUser(user.id, address: addr);
                    if (mounted) {
                      if (updated != null) {
                        context.read<CartProvider>().updateUser(updated);
                      } else {
                        context.read<CartProvider>().updateUser(
                          User(
                            id: user.id,
                            name: user.name,
                            phone: user.phone,
                            email: user.email,
                            address: addr,
                            role: user.role,
                            profileImage: user.profileImage,
                          ),
                        );
                      }
                      context.read<CartProvider>().setDeliveryAddress(addr);
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Address saved from Map!'), backgroundColor: AppTheme.accent),
                      );
                    }
                  },
                  child: isSaving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Save & Confirm Location', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showEditProfileDialog(User user) {
    final editNameCtrl = TextEditingController(text: user.name);
    final editPhoneCtrl = TextEditingController(text: user.phone);
    bool isSaving = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          padding: EdgeInsets.only(
            top: 24,
            left: 24,
            right: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
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
                  const Text('Edit Profile', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                controller: editNameCtrl,
                decoration: const InputDecoration(labelText: 'Full Name', prefixIcon: Icon(Icons.person_outline)),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: editPhoneCtrl,
                decoration: const InputDecoration(labelText: 'Phone Number', prefixIcon: Icon(Icons.phone_outlined)),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: isSaving ? null : () async {
                    setModalState(() => isSaving = true);
                    final updated = await ApiService.updateUser(
                      user.id,
                      name: editNameCtrl.text.trim(),
                      phone: editPhoneCtrl.text.trim(),
                    );
                    if (updated != null && mounted) {
                      context.read<CartProvider>().updateUser(updated);
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Profile updated!'), backgroundColor: AppTheme.accent),
                      );
                    } else {
                      setModalState(() => isSaving = false);
                      Navigator.pop(ctx);
                      // Fallback local update
                      context.read<CartProvider>().updateUser(
                        User(
                          id: user.id,
                          name: editNameCtrl.text.trim(),
                          phone: editPhoneCtrl.text.trim(),
                          email: user.email,
                          address: user.address,
                          role: user.role,
                        ),
                      );
                    }
                  },
                  child: isSaving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAddressDialog(User user) {
    final addrCtrl = TextEditingController(text: user.address);
    bool isSaving = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          padding: EdgeInsets.only(
            top: 24,
            left: 24,
            right: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
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
                  const Text('Delivery Address', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    _showMapLocationSelector(user);
                  },
                  icon: const Icon(Icons.my_location, color: Color(0xFF0C8CE9), size: 18),
                  label: const Text('📍 Select Location on Map / Use GPS', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0C8CE9))),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF0C8CE9), width: 1.5),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: addrCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Street, Building, Flat No & Pincode',
                  alignLabelWithHint: true,
                  prefixIcon: Icon(Icons.location_on_outlined),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: isSaving ? null : () async {
                    setModalState(() => isSaving = true);
                    final updated = await ApiService.updateUser(
                      user.id,
                      address: addrCtrl.text.trim(),
                    );
                    if (updated != null && mounted) {
                      context.read<CartProvider>().updateUser(updated);
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Address updated!'), backgroundColor: AppTheme.accent),
                      );
                    } else {
                      setModalState(() => isSaving = false);
                      Navigator.pop(ctx);
                      context.read<CartProvider>().updateUser(
                        User(
                          id: user.id,
                          name: user.name,
                          phone: user.phone,
                          email: user.email,
                          address: addrCtrl.text.trim(),
                          role: user.role,
                        ),
                      );
                    }
                  },
                  child: isSaving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Update Delivery Address', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showHelpSupportDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Customer Support & Help', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
            const SizedBox(height: 8),
            const Text('We are available 24/7 for instant delivery queries.', style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
            const SizedBox(height: 20),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.phone_in_talk, color: AppTheme.accent),
              ),
              title: const Text('Call Helpline', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: const Text('+91 99999 88888 • Instant Response'),
              onTap: () => Navigator.pop(ctx),
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.email_outlined, color: Colors.blue),
              ),
              title: const Text('Email Support', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: const Text('support@kiranabazar.com'),
              onTap: () => Navigator.pop(ctx),
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.chat_bubble_outline, color: Colors.amber),
              ),
              title: const Text('Live Chat with Support', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: const Text('Typical response in 2 mins'),
              onTap: () => Navigator.pop(ctx),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<CartProvider>().currentUser;

    if (user == null) {
      return const AuthScreen();
    }

    return _buildProfileView(user);
  }


  Widget _buildProfileView(User user) {
    final avatarLetter = user.name.isNotEmpty ? user.name[0].toUpperCase() : 'C';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          // Profile Hero Banner
          SliverAppBar(
            expandedHeight: 200.0,
            floating: false,
            pinned: true,
            backgroundColor: const Color(0xFF0F172A),
            elevation: 0,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: SafeArea(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Profile Image with Camera badge
                      Stack(
                        children: [
                          GestureDetector(
                            onTap: () => _pickAndUploadProfileImage(user),
                            child: Container(
                              width: 76,
                              height: 76,
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(colors: [Color(0xFFFFD700), Color(0xFFF59E0B)]),
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 3),
                                boxShadow: [
                                  BoxShadow(color: Colors.black.withOpacity(0.25), blurRadius: 14, offset: const Offset(0, 4))
                                ],
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: user.profileImage.isNotEmpty
                                  ? AppImage(
                                      imageUrl: user.profileImage,
                                      width: 76,
                                      height: 76,
                                      fit: BoxFit.cover,
                                      errorWidget: Center(
                                        child: Text(
                                          avatarLetter,
                                          style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                                        ),
                                      ),
                                    )
                                  : Center(
                                      child: Text(
                                        avatarLetter,
                                        style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                                      ),
                                    ),
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: GestureDetector(
                              onTap: () => _pickAndUploadProfileImage(user),
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0C8CE9),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white, width: 2),
                                  boxShadow: [
                                    BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 4),
                                  ],
                                ),
                                child: const Icon(Icons.camera_alt, color: Colors.white, size: 14),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        user.name,
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user.phone.isNotEmpty ? user.phone : (user.email.isNotEmpty ? user.email : 'Customer Account'),
                        style: TextStyle(color: Colors.white.withOpacity(0.75), fontSize: 13, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Content List
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Wallet / Kirana Cash Cards
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.grey.shade100),
                            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
                          ),
                          child: const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.account_balance_wallet, color: AppTheme.accent, size: 20),
                                  SizedBox(width: 8),
                                  Text('Kirana Cash', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B))),
                                ],
                              ),
                              SizedBox(height: 8),
                              Text('₹250', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => context.read<CartProvider>().goToOrders(),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.grey.shade100),
                              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
                            ),
                            child: const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(Icons.receipt_long, color: Color(0xFF3B82F6), size: 20),
                                    SizedBox(width: 8),
                                    Text('Orders', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B))),
                                  ],
                                ),
                                SizedBox(height: 8),
                                Text('View Live ➔', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF3B82F6))),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),
                  const Text('Account Settings', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                  const SizedBox(height: 12),

                  _buildMenuItem(
                    icon: Icons.person_outline,
                    title: 'Edit Profile',
                    subtitle: 'Update name, phone number',
                    onTap: () => _showEditProfileDialog(user),
                  ),

                  _buildMenuItem(
                    icon: Icons.location_on_outlined,
                    title: 'Saved Delivery Address',
                    subtitle: user.address,
                    onTap: () => _showAddressDialog(user),
                  ),

                  _buildMenuItem(
                    icon: Icons.shopping_bag_outlined,
                    title: 'Order History & Receipts',
                    subtitle: 'Track live dispatch or view past orders',
                    onTap: () => context.read<CartProvider>().goToOrders(),
                  ),

                  _buildMenuItem(
                    icon: Icons.support_agent_outlined,
                    title: 'Help & Customer Support',
                    subtitle: '24/7 Helpline, chat and FAQs',
                    onTap: _showHelpSupportDialog,
                  ),

                  const SizedBox(height: 24),

                  // Logout Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            title: const Text('Sign Out?', style: TextStyle(fontWeight: FontWeight.w800)),
                            content: const Text('Are you sure you want to sign out of your account?'),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                              ElevatedButton(
                                onPressed: () {
                                  Navigator.pop(ctx);
                                  context.read<CartProvider>().logout();
                                },
                                style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
                                child: const Text('Sign Out', style: TextStyle(color: Colors.white)),
                              ),
                            ],
                          ),
                        );
                      },
                      icon: const Icon(Icons.logout, size: 18, color: Colors.redAccent),
                      label: const Text('Sign Out of Account', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.redAccent.withOpacity(0.4)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                  ),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.015), blurRadius: 8)],
      ),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)),
          child: Icon(icon, color: const Color(0xFF0F172A), size: 20),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A))),
        subtitle: subtitle != null
            ? Text(subtitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)))
            : null,
        trailing: const Icon(Icons.chevron_right, size: 20, color: Color(0xFF94A3B8)),
      ),
    );
  }
}
