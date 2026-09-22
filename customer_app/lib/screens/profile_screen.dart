import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../cart_provider.dart';
import '../api_service.dart';
import '../theme.dart';
import '../models.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool isLogin = true;
  bool isLoading = false;
  bool obscurePassword = true;
  
  final phoneCtrl = TextEditingController(text: 'rahul@example.com');
  final pwdCtrl = TextEditingController(text: 'user123');
  final nameCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final addressCtrl = TextEditingController();

  @override
  void dispose() {
    phoneCtrl.dispose();
    pwdCtrl.dispose();
    nameCtrl.dispose();
    emailCtrl.dispose();
    addressCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitLogin() async {
    if (phoneCtrl.text.trim().isEmpty || pwdCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill out all login fields'), backgroundColor: Colors.redAccent),
      );
      return;
    }

    setState(() => isLoading = true);
    User? user;
    if (isLogin) {
      user = await ApiService.login(phoneCtrl.text.trim(), pwdCtrl.text.trim());
    } else {
      if (nameCtrl.text.trim().isEmpty) {
        setState(() => isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter your full name'), backgroundColor: Colors.redAccent),
        );
        return;
      }
      user = await ApiService.register(
        nameCtrl.text.trim(),
        emailCtrl.text.trim(),
        phoneCtrl.text.trim(),
        pwdCtrl.text.trim(),
        addressCtrl.text.trim().isNotEmpty ? addressCtrl.text.trim() : 'Shop 10, Main Market',
      );
    }
    setState(() => isLoading = false);

    if (user != null && mounted) {
      context.read<CartProvider>().setUser(user);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(isLogin ? 'Welcome back, ${user.name}!' : 'Account created successfully!'),
          backgroundColor: AppTheme.accent,
        ),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(isLogin ? 'Invalid credentials. Please check phone/password.' : 'Registration failed. User may already exist.'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  Future<void> _quickDemoLogin() async {
    setState(() => isLoading = true);
    final user = await ApiService.login('rahul@example.com', 'user123');
    setState(() => isLoading = false);
    if (user != null && mounted) {
      context.read<CartProvider>().setUser(user);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Welcome, ${user.name}!'), backgroundColor: AppTheme.accent),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Demo login failed. Make sure backend is running.'), backgroundColor: Colors.redAccent),
      );
    }
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
              const SizedBox(height: 16),
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
      return _buildLoginView();
    }

    return _buildProfileView(user);
  }

  Widget _buildLoginView() {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Top Branded Hero
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppTheme.primary.withOpacity(0.3),
                      const Color(0xFFF8FAFC),
                    ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(40),
                    bottomRight: Radius.circular(40),
                  ),
                ),
                child: Column(
                  children: [
                    Container(
                      width: 76,
                      height: 76,
                      decoration: BoxDecoration(
                        color: AppTheme.primary,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.amber.withOpacity(0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          )
                        ],
                      ),
                      child: const Center(
                        child: Icon(Icons.shopping_basket_rounded, size: 40, color: Color(0xFF0F172A)),
                      ),
                    ),
                    const SizedBox(height: 14),
                    const Text(
                      'Kirana Bazar',
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0F172A),
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Quick Grocery • Instant 8-Minute Delivery',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),

              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Tab Selector: Login vs Register
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => isLogin = true),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(
                                  color: isLogin ? Colors.white : Colors.transparent,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: isLogin
                                      ? [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)]
                                      : [],
                                ),
                                child: Text(
                                  'Sign In',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontWeight: isLogin ? FontWeight.w800 : FontWeight.w600,
                                    color: isLogin ? const Color(0xFF0F172A) : const Color(0xFF64748B),
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => isLogin = false),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(
                                  color: !isLogin ? Colors.white : Colors.transparent,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: !isLogin
                                      ? [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)]
                                      : [],
                                ),
                                child: Text(
                                  'Create Account',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontWeight: !isLogin ? FontWeight.w800 : FontWeight.w600,
                                    color: !isLogin ? const Color(0xFF0F172A) : const Color(0xFF64748B),
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Register-only fields
                    if (!isLogin) ...[
                      TextField(
                        controller: nameCtrl,
                        decoration: const InputDecoration(
                          hintText: 'Full Name',
                          prefixIcon: Icon(Icons.person_outline),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: emailCtrl,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          hintText: 'Email Address',
                          prefixIcon: Icon(Icons.email_outlined),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: addressCtrl,
                        decoration: const InputDecoration(
                          hintText: 'Delivery Address (Apartment, Area)',
                          prefixIcon: Icon(Icons.location_on_outlined),
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],

                    // Phone or Email Field
                    TextField(
                      controller: phoneCtrl,
                      keyboardType: TextInputType.text,
                      decoration: InputDecoration(
                        hintText: isLogin ? 'Email or Phone (+91)' : 'Phone Number (+91)',
                        prefixIcon: const Icon(Icons.phone_android_outlined),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Password Field
                    TextField(
                      controller: pwdCtrl,
                      obscureText: obscurePassword,
                      decoration: InputDecoration(
                        hintText: 'Password',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          icon: Icon(obscurePassword ? Icons.visibility_off : Icons.visibility),
                          onPressed: () => setState(() => obscurePassword = !obscurePassword),
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Submit Button
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: isLoading ? null : _submitLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.secondary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: isLoading
                            ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                            : Text(
                                isLogin ? 'Sign In' : 'Register & Start Shopping',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // One-Tap Demo Login Button
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: OutlinedButton.icon(
                        onPressed: isLoading ? null : _quickDemoLogin,
                        icon: const Icon(Icons.flash_on, size: 18, color: Color(0xFFD97706)),
                        label: const Text(
                          '⚡ One-Tap Demo Login (Rahul Sharma)',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFFF59E0B), width: 1.5),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          backgroundColor: const Color(0xFFFFFBEB),
                        ),
                      ),
                    ),

                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
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
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Color(0xFFFFD700), Color(0xFFF59E0B)]),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 12, offset: const Offset(0, 4))
                          ],
                        ),
                        child: Center(
                          child: Text(
                            avatarLetter,
                            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                          ),
                        ),
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
