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
  
  final phoneCtrl = TextEditingController(text: 'rahul@example.com');
  final pwdCtrl = TextEditingController(text: 'user123');
  final nameCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final addressCtrl = TextEditingController();

  Future<void> _submitLogin() async {
    setState(() => isLoading = true);
    User? user;
    if (isLogin) {
      user = await ApiService.login(phoneCtrl.text, pwdCtrl.text);
    } else {
      user = await ApiService.register(nameCtrl.text, emailCtrl.text, phoneCtrl.text, pwdCtrl.text, addressCtrl.text);
    }
    setState(() => isLoading = false);
    if (user != null) {
      context.read<CartProvider>().setUser(user);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(isLogin ? 'Invalid credentials' : 'Registration failed'), backgroundColor: Colors.red));
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<CartProvider>().currentUser;

    if (user == null) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              children: [
                Container(
                  width: double.infinity,
                  height: 260,
                  decoration: BoxDecoration(
                    color: AppTheme.primary.withOpacity(0.15),
                    borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(50), bottomRight: Radius.circular(50)),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withOpacity(0.3),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.shopping_basket_rounded, size: 80, color: AppTheme.secondary),
                      ),
                      const SizedBox(height: 16),
                      const Text('Kirana Bazar', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: AppTheme.secondary, letterSpacing: -0.5)),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(isLogin ? 'Welcome Back!' : 'Create Account', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppTheme.textPrimary, letterSpacing: -0.5)),
                      const SizedBox(height: 8),
                      Text(isLogin ? 'Login to continue your grocery shopping' : 'Sign up to get started', style: TextStyle(fontSize: 16, color: AppTheme.textSecondary)),
                      const SizedBox(height: 40),
                      if (!isLogin) ...[
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(color: AppTheme.secondary.withOpacity(0.05), blurRadius: 24, offset: const Offset(0, 8))
                            ]
                          ),
                          child: TextField(
                            controller: nameCtrl,
                            decoration: InputDecoration(
                              hintText: 'Full Name',
                              prefixIcon: const Icon(Icons.person, color: AppTheme.textSecondary),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
                              filled: true,
                              fillColor: Colors.white,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(color: AppTheme.secondary.withOpacity(0.05), blurRadius: 24, offset: const Offset(0, 8))
                            ]
                          ),
                          child: TextField(
                            controller: emailCtrl,
                            decoration: InputDecoration(
                              hintText: 'Email Address',
                              prefixIcon: const Icon(Icons.email_outlined, color: AppTheme.textSecondary),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
                              filled: true,
                              fillColor: Colors.white,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(color: AppTheme.secondary.withOpacity(0.05), blurRadius: 24, offset: const Offset(0, 8))
                            ]
                          ),
                          child: TextField(
                            controller: addressCtrl,
                            decoration: InputDecoration(
                              hintText: 'Delivery Address (Location)',
                              prefixIcon: const Icon(Icons.location_on_outlined, color: AppTheme.textSecondary),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
                              filled: true,
                              fillColor: Colors.white,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                      ],
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(color: AppTheme.secondary.withOpacity(0.05), blurRadius: 24, offset: const Offset(0, 8))
                          ]
                        ),
                        child: TextField(
                          controller: phoneCtrl,
                          decoration: InputDecoration(
                            hintText: isLogin ? 'Email or Phone Number' : 'Phone Number',
                            prefixIcon: Icon(isLogin ? Icons.person_outline : Icons.phone_android, color: AppTheme.textSecondary),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
                            filled: true,
                            fillColor: Colors.white,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(color: AppTheme.secondary.withOpacity(0.05), blurRadius: 24, offset: const Offset(0, 8))
                          ]
                        ),
                        child: TextField(
                          controller: pwdCtrl,
                          obscureText: true,
                          decoration: InputDecoration(
                            hintText: 'Password',
                            prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.textSecondary),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
                            filled: true,
                            fillColor: Colors.white,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                          ),
                        ),
                      ),
                      if (isLogin) ...[
                        const SizedBox(height: 12),
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: () {},
                            child: const Text('Forgot Password?', style: TextStyle(color: AppTheme.secondary, fontWeight: FontWeight.bold, fontSize: 15)),
                          ),
                        ),
                        const SizedBox(height: 12),
                      ] else ...[
                        const SizedBox(height: 32),
                      ],
                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: isLoading ? null : _submitLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.secondary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            elevation: 10,
                            shadowColor: AppTheme.secondary.withOpacity(0.3),
                          ),
                          child: isLoading 
                            ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3)) 
                            : Text(isLogin ? 'Login Now' : 'Register Now', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(height: 32),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(isLogin ? "Don't have an account? " : "Already have an account? ", style: const TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
                          GestureDetector(
                            onTap: () {
                              setState(() => isLogin = !isLogin);
                            },
                            child: Text(isLogin ? 'Sign Up' : 'Login', style: const TextStyle(color: AppTheme.accent, fontWeight: FontWeight.bold, fontSize: 16)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 250.0,
            floating: false,
            pinned: true,
            backgroundColor: AppTheme.secondary,
            elevation: 0,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.secondary, Color(0xFF1E293B)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  )
                ),
                child: SafeArea(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 90, height: 90,
                        decoration: BoxDecoration(
                          color: AppTheme.primary,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 4),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 15, offset: const Offset(0, 5))]
                        ),
                        child: Center(child: Text(user.name[0].toUpperCase(), style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: AppTheme.secondary))),
                      ),
                      const SizedBox(height: 16),
                      Text(user.name, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                      const SizedBox(height: 4),
                      Text(user.phone, style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 16, fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Container(
              transform: Matrix4.translationValues(0.0, -30.0, 0.0),
              decoration: const BoxDecoration(
                color: AppTheme.background,
                borderRadius: BorderRadius.only(topLeft: Radius.circular(32), topRight: Radius.circular(32)),
              ),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 8),
                    const Text('Dashboard', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppTheme.textPrimary, letterSpacing: -0.5)),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(child: _StatCard(icon: Icons.account_balance_wallet, title: 'Kirana Cash', value: '₹250', color: AppTheme.accent)),
                        const SizedBox(width: 16),
                        Expanded(child: _StatCard(icon: Icons.shopping_bag_rounded, title: 'Total Orders', value: '12', color: Colors.blueAccent)),
                      ],
                    ),
                    const SizedBox(height: 32),
                    const Text('Account Settings', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppTheme.textPrimary, letterSpacing: -0.5)),
                    const SizedBox(height: 20),
                    _ProfileMenuItem(icon: Icons.person_outline, title: 'Edit Profile', onTap: () {}),
                    _ProfileMenuItem(icon: Icons.location_on_outlined, title: 'Saved Addresses', subtitle: user.address, onTap: () {}),
                    _ProfileMenuItem(icon: Icons.notifications_outlined, title: 'Notifications', onTap: () {}),
                    _ProfileMenuItem(icon: Icons.security_outlined, title: 'Security & Password', onTap: () {}),
                    _ProfileMenuItem(icon: Icons.help_outline, title: 'Help & Support', onTap: () {}),
                    const SizedBox(height: 32),
                    SizedBox(
                      width: double.infinity,
                      height: 60,
                      child: ElevatedButton.icon(
                        onPressed: () => context.read<CartProvider>().logout(),
                        icon: const Icon(Icons.logout, color: Colors.white),
                        label: const Text('Logout', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.redAccent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          elevation: 0,
                        ),
                      ),
                    ),
                    const SizedBox(height: 60),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color color;

  const _StatCard({required this.icon, required this.title, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: AppTheme.secondary.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 16),
          Text(value, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppTheme.textPrimary, letterSpacing: -1)),
          const SizedBox(height: 4),
          Text(title, style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  const _ProfileMenuItem({required this.icon, required this.title, this.subtitle, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: AppTheme.secondary.withOpacity(0.03), blurRadius: 15, offset: const Offset(0, 5))],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(12), 
          decoration: BoxDecoration(color: AppTheme.background, borderRadius: BorderRadius.circular(16)), 
          child: Icon(icon, color: AppTheme.secondary, size: 24)
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textPrimary)),
        subtitle: subtitle != null ? Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(subtitle!, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
        ) : null,
        trailing: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: Colors.grey.shade50, shape: BoxShape.circle),
          child: const Icon(Icons.arrow_forward_ios, size: 14, color: AppTheme.secondary),
        ),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }
}

