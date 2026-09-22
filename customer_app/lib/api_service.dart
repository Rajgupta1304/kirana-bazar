import 'dart:convert';
import 'package:http/http.dart' as http;
import 'models.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';
  static String? _token;
  
  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  static void setToken(String? token) {
    _token = token;
  }

  static final List<Category> defaultCategories = [
    // Grocery & Kitchen
    Category(
      id: 'cat_2',
      name: 'Vegetables & Fruits',
      icon: '🥦',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=300&q=80',
      section: 'Grocery & Kitchen',
    ),
    Category(
      id: 'cat_7',
      name: 'Atta, Rice & Dal',
      icon: '🌾',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80',
      section: 'Grocery & Kitchen',
    ),
    Category(
      id: 'cat_8',
      name: 'Oil, Ghee & Masala',
      icon: '🛢️',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80',
      section: 'Grocery & Kitchen',
    ),
    Category(
      id: 'cat_1',
      name: 'Dairy, Bread & Eggs',
      icon: '🥛',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80',
      section: 'Grocery & Kitchen',
    ),
    Category(
      id: 'cat_9',
      name: 'Bakery & Biscuits',
      icon: '🍪',
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80',
      section: 'Grocery & Kitchen',
    ),
    Category(
      id: 'cat_10',
      name: 'Dry Fruits & Cereals',
      icon: '🥜',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80',
      section: 'Grocery & Kitchen',
    ),
    Category(
      id: 'cat_11',
      name: 'Chicken, Meat & Fish',
      icon: '🍗',
      image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=300&q=80',
      section: 'Grocery & Kitchen',
    ),
    Category(
      id: 'cat_12',
      name: 'Kitchenware & Appliances',
      icon: '🍳',
      image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=300&q=80',
      section: 'Grocery & Kitchen',
    ),

    // Snacks & Drinks
    Category(
      id: 'cat_3',
      name: 'Chips & Namkeen',
      icon: '🍿',
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&q=80',
      section: 'Snacks & Drinks',
    ),
    Category(
      id: 'cat_13',
      name: 'Sweets & Chocolates',
      icon: '🍫',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=300&q=80',
      section: 'Snacks & Drinks',
    ),
    Category(
      id: 'cat_4',
      name: 'Drinks & Juices',
      icon: '🥤',
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80',
      section: 'Snacks & Drinks',
    ),
    Category(
      id: 'cat_14',
      name: 'Tea, Coffee & Milk Drinks',
      icon: '☕',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80',
      section: 'Snacks & Drinks',
    ),
    Category(
      id: 'cat_5',
      name: 'Instant Food',
      icon: '🍜',
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=300&q=80',
      section: 'Snacks & Drinks',
    ),
    Category(
      id: 'cat_15',
      name: 'Sauces & Spreads',
      icon: '🥫',
      image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=300&q=80',
      section: 'Snacks & Drinks',
    ),
    Category(
      id: 'cat_16',
      name: 'Ice Creams & More',
      icon: '🍦',
      image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=300&q=80',
      section: 'Snacks & Drinks',
    ),
    Category(
      id: 'cat_17',
      name: 'Paan & Mukhwas',
      icon: '🍃',
      image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=300&q=80',
      section: 'Snacks & Drinks',
    ),
  ];

  static final List<Product> defaultProducts = [
    // Dairy, Bread & Egg (cat_1)
    Product(
      id: 'prod_1',
      name: 'Amul Taaza Toned Fresh Milk',
      categoryId: 'cat_1',
      categoryName: 'Dairy, Bread & Egg',
      unit: '500 ml',
      price: 27.0,
      mrp: 30.0,
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
      stock: 43,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_2',
      name: 'Harvest Gold White Bread',
      categoryId: 'cat_1',
      categoryName: 'Dairy, Bread & Egg',
      unit: '400 g',
      price: 45.0,
      mrp: 50.0,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
      stock: 30,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_3',
      name: 'Farm Fresh Organic Eggs (6 Pcs)',
      categoryId: 'cat_1',
      categoryName: 'Dairy, Bread & Egg',
      unit: '6 units',
      price: 64.0,
      mrp: 75.0,
      image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80',
      stock: 22,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_1_4',
      name: 'Amul Pasteurized Butter',
      categoryId: 'cat_1',
      categoryName: 'Dairy, Bread & Egg',
      unit: '100 g',
      price: 56.0,
      mrp: 60.0,
      image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80',
      stock: 35,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_1_5',
      name: 'Mother Dairy Fresh Paneer',
      categoryId: 'cat_1',
      categoryName: 'Dairy, Bread & Egg',
      unit: '200 g',
      price: 90.0,
      mrp: 105.0,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80',
      stock: 20,
      storeId: 'store_1',
      inStore: true,
    ),

    // Fruits & Vegetables (cat_2)
    Product(
      id: 'prod_4',
      name: 'Fresh Hydroponic Tomatoes',
      categoryId: 'cat_2',
      categoryName: 'Fruits & Vegetables',
      unit: '500 g',
      price: 32.0,
      mrp: 40.0,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
      stock: 17,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_5',
      name: 'Crisp Green Farm Broccoli',
      categoryId: 'cat_2',
      categoryName: 'Fruits & Vegetables',
      unit: '1 pc (approx 350g)',
      price: 79.0,
      mrp: 99.0,
      image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=400&q=80',
      stock: 15,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_2_3',
      name: 'Fresh Red Hybrid Onions',
      categoryId: 'cat_2',
      categoryName: 'Fruits & Vegetables',
      unit: '1 kg',
      price: 48.0,
      mrp: 60.0,
      image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=400&q=80',
      stock: 40,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_2_4',
      name: 'Fresh Shimla Royal Apples',
      categoryId: 'cat_2',
      categoryName: 'Fruits & Vegetables',
      unit: '4 pcs (approx 500g)',
      price: 120.0,
      mrp: 150.0,
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
      stock: 25,
      storeId: 'store_1',
      inStore: true,
    ),

    // Munchies & Snacks (cat_3)
    Product(
      id: 'prod_6',
      name: "Lay's India's Magic Masala Chips",
      categoryId: 'cat_3',
      categoryName: 'Chips & Namkeen',
      unit: '115 g',
      price: 50.0,
      mrp: 50.0,
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80',
      stock: 52,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_7',
      name: 'Doritos Nacho Cheese Tortilla',
      categoryId: 'cat_3',
      categoryName: 'Chips & Namkeen',
      unit: '150 g',
      price: 85.0,
      mrp: 90.0,
      image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=400&q=80',
      stock: 39,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_3_3',
      name: "Kurkure Masala Munch Crunchy Snacks",
      categoryId: 'cat_3',
      categoryName: 'Chips & Namkeen',
      unit: '90 g',
      price: 20.0,
      mrp: 20.0,
      image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=400&q=80',
      stock: 60,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_3_4',
      name: "Haldiram's Nagpur Bhujia Sev",
      categoryId: 'cat_3',
      categoryName: 'Chips & Namkeen',
      unit: '200 g',
      price: 65.0,
      mrp: 70.0,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
      stock: 45,
      storeId: 'store_1',
      inStore: true,
    ),

    // Drinks & Juices (cat_4)
    Product(
      id: 'prod_8',
      name: 'Coca-Cola Zero Sugar Can',
      categoryId: 'cat_4',
      categoryName: 'Drinks & Juices',
      unit: '300 ml',
      price: 40.0,
      mrp: 40.0,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
      stock: 55,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_4_2',
      name: 'Real Fruit Power Mixed Fruit Juice',
      categoryId: 'cat_4',
      categoryName: 'Drinks & Juices',
      unit: '1 L',
      price: 115.0,
      mrp: 130.0,
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80',
      stock: 30,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_4_3',
      name: 'Red Bull Energy Drink',
      categoryId: 'cat_4',
      categoryName: 'Drinks & Juices',
      unit: '250 ml',
      price: 125.0,
      mrp: 130.0,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80',
      stock: 40,
      storeId: 'store_1',
      inStore: true,
    ),

    // Instant Food (cat_5)
    Product(
      id: 'prod_5_1',
      name: 'Maggi 2-Minute Masala Instant Noodles',
      categoryId: 'cat_5',
      categoryName: 'Instant Food',
      unit: '280 g (Pack of 4)',
      price: 56.0,
      mrp: 60.0,
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=80',
      stock: 75,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_5_2',
      name: 'Sunfeast YiPPee! Magic Masala Noodles',
      categoryId: 'cat_5',
      categoryName: 'Instant Food',
      unit: '240 g (Pack of 4)',
      price: 48.0,
      mrp: 52.0,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
      stock: 45,
      storeId: 'store_1',
      inStore: true,
    ),

    // Atta, Rice & Dal (cat_7)
    Product(
      id: 'prod_1787675778746',
      name: 'Tata Sampann Unpolished Yellow Dal',
      categoryId: 'cat_7',
      categoryName: 'Atta, Rice & Dal',
      unit: '500 g',
      price: 100.0,
      mrp: 120.0,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      stock: 24,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_7_2',
      name: 'Aashirvaad Superior MP Shudh Chakki Atta',
      categoryId: 'cat_7',
      categoryName: 'Atta, Rice & Dal',
      unit: '5 kg',
      price: 265.0,
      mrp: 310.0,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
      stock: 35,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_7_3',
      name: 'Fortune Rozana Basmati Rice',
      categoryId: 'cat_7',
      categoryName: 'Atta, Rice & Dal',
      unit: '1 kg',
      price: 89.0,
      mrp: 110.0,
      image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=400&q=80',
      stock: 40,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_7_4',
      name: 'Tata Sampann Organic Rajma Red',
      categoryId: 'cat_7',
      categoryName: 'Atta, Rice & Dal',
      unit: '500 g',
      price: 85.0,
      mrp: 100.0,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      stock: 28,
      storeId: 'store_1',
      inStore: true,
    ),

    // Oil, Ghee & Masala (cat_8)
    Product(
      id: 'prod_8_1',
      name: 'Fortune Sunlite Refined Sunflower Oil',
      categoryId: 'cat_8',
      categoryName: 'Oil, Ghee & Masala',
      unit: '1 L',
      price: 145.0,
      mrp: 170.0,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
      stock: 35,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_8_2',
      name: 'Amul Pure Cow Ghee Tin',
      categoryId: 'cat_8',
      categoryName: 'Oil, Ghee & Masala',
      unit: '500 ml',
      price: 330.0,
      mrp: 360.0,
      image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80',
      stock: 20,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_8_3',
      name: 'MDH Deggi Mirch Powder',
      categoryId: 'cat_8',
      categoryName: 'Oil, Ghee & Masala',
      unit: '100 g',
      price: 88.0,
      mrp: 95.0,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
      stock: 50,
      storeId: 'store_1',
      inStore: true,
    ),

    // Bakery & Biscuits (cat_9)
    Product(
      id: 'prod_9_1',
      name: 'Parle-G Original Glucose Biscuits',
      categoryId: 'cat_9',
      categoryName: 'Bakery & Biscuits',
      unit: '250 g',
      price: 30.0,
      mrp: 35.0,
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
      stock: 80,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_9_2',
      name: 'Britannia Good Day Butter Cookies',
      categoryId: 'cat_9',
      categoryName: 'Bakery & Biscuits',
      unit: '200 g',
      price: 45.0,
      mrp: 50.0,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
      stock: 60,
      storeId: 'store_1',
      inStore: true,
    ),

    // Dry Fruits & Cereals (cat_10)
    Product(
      id: 'prod_10_1',
      name: 'California Crunchy Almonds',
      categoryId: 'cat_10',
      categoryName: 'Dry Fruits & Cereals',
      unit: '250 g',
      price: 240.0,
      mrp: 300.0,
      image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=400&q=80',
      stock: 30,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_10_2',
      name: "Kellogg's Corn Flakes Real Almond Honey",
      categoryId: 'cat_10',
      categoryName: 'Dry Fruits & Cereals',
      unit: '475 g',
      price: 195.0,
      mrp: 225.0,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
      stock: 25,
      storeId: 'store_1',
      inStore: true,
    ),

    // Chicken, Meat & Fish (cat_11)
    Product(
      id: 'prod_11_1',
      name: 'Fresh Farm Tender Chicken Curry Cut',
      categoryId: 'cat_11',
      categoryName: 'Chicken, Meat & Fish',
      unit: '500 g',
      price: 165.0,
      mrp: 190.0,
      image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=400&q=80',
      stock: 18,
      storeId: 'store_1',
      inStore: true,
    ),

    // Kitchenware & Appliances (cat_12)
    Product(
      id: 'prod_12_1',
      name: 'Pigeon Granite Non-Stick Frying Pan',
      categoryId: 'cat_12',
      categoryName: 'Kitchenware & Appliances',
      unit: '24 cm (1 pc)',
      price: 499.0,
      mrp: 795.0,
      image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
      stock: 12,
      storeId: 'store_1',
      inStore: true,
    ),

    // Sweets & Chocolates (cat_13)
    Product(
      id: 'prod_13_1',
      name: 'Cadbury Dairy Milk Silk Chocolate Bar',
      categoryId: 'cat_13',
      categoryName: 'Sweets & Chocolates',
      unit: '150 g',
      price: 175.0,
      mrp: 190.0,
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80',
      stock: 50,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_13_2',
      name: 'Haldiram’s Royal Gulab Jamun',
      categoryId: 'cat_13',
      categoryName: 'Sweets & Chocolates',
      unit: '1 kg Tin',
      price: 225.0,
      mrp: 250.0,
      image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=400&q=80',
      stock: 22,
      storeId: 'store_1',
      inStore: true,
    ),

    // Tea, Coffee & Milk Drinks (cat_14)
    Product(
      id: 'prod_14_1',
      name: 'NESCAFÉ Classic Rich Blend Coffee',
      categoryId: 'cat_14',
      categoryName: 'Tea, Coffee & Milk Drinks',
      unit: '100 g Jar',
      price: 340.0,
      mrp: 380.0,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
      stock: 45,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_14_2',
      name: 'NESCAFÉ Choco Latte Chilled Cold Coffee',
      categoryId: 'cat_14',
      categoryName: 'Tea, Coffee & Milk Drinks',
      unit: '180 ml Can',
      price: 55.0,
      mrp: 65.0,
      image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=400&q=80',
      stock: 60,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_14_3',
      name: 'Tata Tea Gold Aromatic Leaf Tea',
      categoryId: 'cat_14',
      categoryName: 'Tea, Coffee & Milk Drinks',
      unit: '500 g',
      price: 310.0,
      mrp: 350.0,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80',
      stock: 35,
      storeId: 'store_1',
      inStore: true,
    ),

    // Sauces & Spreads (cat_15)
    Product(
      id: 'prod_15_1',
      name: 'Kissan Fresh Tomato Ketchup',
      categoryId: 'cat_15',
      categoryName: 'Sauces & Spreads',
      unit: '950 g Squeezo',
      price: 120.0,
      mrp: 145.0,
      image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=400&q=80',
      stock: 35,
      storeId: 'store_1',
      inStore: true,
    ),
    Product(
      id: 'prod_15_2',
      name: 'Nutella Hazelnut Cocoa Spread',
      categoryId: 'cat_15',
      categoryName: 'Sauces & Spreads',
      unit: '350 g Jar',
      price: 365.0,
      mrp: 410.0,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
      stock: 28,
      storeId: 'store_1',
      inStore: true,
    ),

    // Ice Creams & More (cat_16)
    Product(
      id: 'prod_16_1',
      name: 'Amul Vanilla Gold Gourmet Ice Cream',
      categoryId: 'cat_16',
      categoryName: 'Ice Creams & More',
      unit: '1 L Tub',
      price: 180.0,
      mrp: 200.0,
      image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=80',
      stock: 25,
      storeId: 'store_1',
      inStore: true,
    ),

    // Paan & Mukhwas (cat_17)
    Product(
      id: 'prod_17_1',
      name: 'Pass Pass Magic Herbal Mukhwas',
      categoryId: 'cat_17',
      categoryName: 'Paan & Mukhwas',
      unit: '100 g',
      price: 40.0,
      mrp: 45.0,
      image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=400&q=80',
      stock: 40,
      storeId: 'store_1',
      inStore: true,
    ),
  ];

  static Future<http.Response?> _getWithFallback(String path) async {
    final hosts = [
      baseUrl,
      'http://127.0.0.1:5000/api',
    ];
    for (final host in hosts) {
      try {
        final res = await http
            .get(Uri.parse('$host$path'), headers: _headers)
            .timeout(const Duration(seconds: 4));
        return res;
      } catch (_) {
        continue;
      }
    }
    return null;
  }

  static Future<List<Product>> getProducts({String? storeId}) async {
    try {
      final path = storeId != null ? '/products?storeId=$storeId' : '/products';
      final response = await _getWithFallback(path);
      if (response != null && response.statusCode == 200) {
        final dynamic data = json.decode(response.body);
        if (data is List) {
          final list = <Product>[];
          for (final item in data) {
            try {
              if (item is Map<String, dynamic>) {
                list.add(Product.fromJson(item));
              } else if (item is Map) {
                list.add(Product.fromJson(Map<String, dynamic>.from(item)));
              }
            } catch (err) {
              print('Skipping malformed product item: $err');
            }
          }
          if (list.isNotEmpty) {
            // Merge with defaultProducts so all categories have products
            final Set<String> existingIds = list.map((p) => p.id).toSet();
            final List<Product> merged = [...list];
            for (final def in defaultProducts) {
              if (!existingIds.contains(def.id)) {
                merged.add(def);
              }
            }
            return merged;
          }
        }
      }
    } catch (e) {
      print('Error fetching products: $e');
    }
    return defaultProducts;
  }

  static Future<List<Category>> getCategories() async {
    try {
      final response = await _getWithFallback('/categories');
      if (response != null && response.statusCode == 200) {
        final dynamic data = json.decode(response.body);
        if (data is List) {
          final list = <Category>[];
          for (final item in data) {
            try {
              if (item is Map<String, dynamic>) {
                list.add(Category.fromJson(item));
              } else if (item is Map) {
                list.add(Category.fromJson(Map<String, dynamic>.from(item)));
              }
            } catch (err) {
              print('Skipping malformed category item: $err');
            }
          }
          if (list.isNotEmpty) return list;
        }
      }
    } catch (e) {
      print('Error fetching categories: $e');
    }
    return defaultCategories;
  }

  static Future<User?> login(String emailOrPhone, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'emailOrPhone': emailOrPhone.trim(), 'password': password.trim()}),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _token = data['token'];
        return User.fromJson(data['user']);
      }
    } catch (e) {
      print('Login error: $e');
    }
    return null;
  }

  static Future<User?> register(String name, String email, String phone, String password, String address) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'name': name.trim(),
          'email': email.trim(),
          'phone': phone.trim(),
          'password': password.trim(),
          'address': address.trim(),
          'role': 'Customer'
        }),
      );
      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        _token = data['token'];
        return User.fromJson(data['user']);
      }
    } catch (e) {
      print('Register error: $e');
    }
    return null;
  }

  static Future<User?> updateUser(String userId, {String? name, String? phone, String? address}) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/users/$userId'),
        headers: _headers,
        body: json.encode({
          if (name != null) 'name': name.trim(),
          if (phone != null) 'phone': phone.trim(),
          if (address != null) 'address': address.trim(),
        }),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return User.fromJson(data);
      }
    } catch (e) {
      print('Update user error: $e');
    }
    return null;
  }

  static String? lastOrderError;

  static Future<Order?> placeOrder(List<Map<String, dynamic>> cartItems, User user, double tip, String paymentMethod) async {
    lastOrderError = null;
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/orders'),
        headers: _headers,
        body: json.encode({
          'userId': user.id,
          'storeId': cartItems.isNotEmpty ? cartItems.first['storeId'] : 'store_1',
          'items': cartItems,
          'customerDetails': {
            'name': user.name,
            'phone': user.phone,
            'address': user.address
          }
        }),
      );
      if (response.statusCode == 201) {
        return Order.fromJson(json.decode(response.body));
      } else {
        try {
          final data = json.decode(response.body);
          if (data is Map && data['error'] != null) {
            lastOrderError = data['error'].toString();
          }
        } catch (_) {}
      }
    } catch (e) {
      print('Order error: $e');
      lastOrderError = 'Network error: Please check your connection.';
    }
    return null;
  }

  static Future<List<Order>> getOrders({String? userId}) async {
    try {
      final url = (userId != null && userId.isNotEmpty) ? '$baseUrl/orders?userId=$userId' : '$baseUrl/orders';
      final response = await http.get(Uri.parse(url), headers: _headers);
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Order.fromJson(json)).toList();
      }
    } catch (e) {
      print('Orders error: $e');
    }
    return [];
  }

  static Future<bool> updateOrderStatus(String orderId, String status) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/orders/$orderId/status'),
        headers: _headers,
        body: json.encode({'status': status}),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Update order error: $e');
      return false;
    }
  }
}
