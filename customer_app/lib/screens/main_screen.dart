import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../cart_provider.dart';
import 'home_screen.dart';
import 'categories_screen.dart';
import 'cart_screen.dart';
import 'orders_screen.dart';
import 'profile_screen.dart';
import '../theme.dart';

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final cartItemsCount = cart.totalItems;
    final currentIndex = cart.selectedTabIndex;

    return Scaffold(
      body: IndexedStack(
        index: currentIndex,
        children: const [
          HomeScreen(),
          CategoriesScreen(),
          CartScreen(),
          OrdersScreen(),
          ProfileScreen(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 18,
              offset: const Offset(0, -4),
            )
          ],
          border: Border(top: BorderSide(color: Colors.grey.shade100)),
        ),
        child: BottomNavigationBar(
          currentIndex: currentIndex,
          onTap: (index) {
            cart.setTab(index);
          },
          selectedItemColor: const Color(0xFF0F172A),
          unselectedItemColor: const Color(0xFF64748B),
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11),
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          backgroundColor: Colors.white,
          items: [
            const BottomNavigationBarItem(
              icon: Padding(
                padding: EdgeInsets.only(bottom: 2),
                child: Icon(Icons.home_outlined, size: 24),
              ),
              activeIcon: Padding(
                padding: EdgeInsets.only(bottom: 2),
                child: Icon(Icons.home_rounded, size: 24, color: Color(0xFFEAB308)),
              ),
              label: 'Home',
            ),
            const BottomNavigationBarItem(
              icon: Padding(
                padding: EdgeInsets.only(bottom: 2),
                child: Icon(Icons.grid_view_outlined, size: 24),
              ),
              activeIcon: Padding(
                padding: EdgeInsets.only(bottom: 2),
                child: Icon(Icons.grid_view_rounded, size: 24, color: Color(0xFF0F172A)),
              ),
              label: 'Categories',
            ),
            BottomNavigationBarItem(
              icon: Padding(
                padding: const EdgeInsets.only(bottom: 2),
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    const Icon(Icons.shopping_cart_outlined, size: 24),
                    if (cartItemsCount > 0)
                      Positioned(
                        right: -6,
                        top: -4,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.blinkitGreen,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.white, width: 1.5),
                          ),
                          child: Text(
                            '$cartItemsCount',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              activeIcon: Padding(
                padding: const EdgeInsets.only(bottom: 2),
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    const Icon(Icons.shopping_cart, size: 24, color: AppTheme.blinkitGreen),
                    if (cartItemsCount > 0)
                      Positioned(
                        right: -6,
                        top: -4,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.blinkitGreen,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.white, width: 1.5),
                          ),
                          child: Text(
                            '$cartItemsCount',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              label: 'Cart',
            ),
            const BottomNavigationBarItem(
              icon: Padding(
                padding: EdgeInsets.only(bottom: 2),
                child: Icon(Icons.receipt_long_outlined, size: 24),
              ),
              activeIcon: Padding(
                padding: EdgeInsets.only(bottom: 2),
                child: Icon(Icons.receipt_long, size: 24, color: Color(0xFF0F172A)),
              ),
              label: 'Orders',
            ),
            const BottomNavigationBarItem(
              icon: Padding(
                padding: EdgeInsets.only(bottom: 2),
                child: Icon(Icons.person_outline, size: 24),
              ),
              activeIcon: Padding(
                padding: EdgeInsets.only(bottom: 2),
                child: Icon(Icons.person, size: 24, color: Color(0xFF0F172A)),
              ),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
