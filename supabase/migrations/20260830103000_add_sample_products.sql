/*
# Add Sample Products

Inserts realistic fashion products with image URLs for demo purposes.
*/

INSERT INTO products (id, title, description, image_url, regular_price, discounted_price, sizes, category, stock) VALUES
-- Men's Products
(
  gen_random_uuid(),
  'Classic Cotton T-Shirt',
  'Premium quality cotton t-shirt with a comfortable fit. Perfect for casual wear.',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop',
  999,
  499,
  ARRAY['S', 'M', 'L', 'XL'],
  'Men',
  50
),
(
  gen_random_uuid(),
  'Slim Fit Denim Jeans',
  'Classic blue denim jeans with slim fit. Durable fabric with stretch comfort.',
  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=600&fit=crop',
  1999,
  999,
  ARRAY['30', '32', '34', '36'],
  'Men',
  35
),
(
  gen_random_uuid(),
  'Casual Polo Shirt',
  'Soft cotton polo shirt with collar. Ideal for semi-formal occasions.',
  'https://images.unsplash.com/photo-1625910513413-5fc45a9979f9?w=500&h=600&fit=crop',
  1299,
  699,
  ARRAY['S', 'M', 'L', 'XL'],
  'Men',
  40
),
(
  gen_random_uuid(),
  'Oversized Hoodie',
  'Comfortable oversized hoodie with kangaroo pocket. Perfect for winter.',
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=600&fit=crop',
  1499,
  799,
  ARRAY['M', 'L', 'XL'],
  'Men',
  25
),
(
  gen_random_uuid(),
  'Formal Dress Shirt',
  'Crisp white formal shirt for professional wear. Premium cotton fabric.',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop',
  1799,
  999,
  ARRAY['S', 'M', 'L', 'XL'],
  'Men',
  30
),
(
  gen_random_uuid(),
  'Track Pants',
  'Comfortable track pants for workouts and casual wear. Breathable fabric.',
  'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&h=600&fit=crop',
  1199,
  599,
  ARRAY['S', 'M', 'L', 'XL'],
  'Men',
  45
),
(
  gen_random_uuid(),
  'Linen Summer Shirt',
  'Lightweight linen shirt perfect for hot weather. Breathable and stylish.',
  'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&h=600&fit=crop',
  1599,
  899,
  ARRAY['S', 'M', 'L'],
  'Men',
  28
),
(
  gen_random_uuid(),
  'Cargo Shorts',
  'Multi-pocket cargo shorts for outdoor activities. Durable and functional.',
  'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=600&fit=crop',
  1099,
  599,
  ARRAY['S', 'M', 'L', 'XL'],
  'Men',
  38
),

-- Women's Products
(
  gen_random_uuid(),
  'Floral Maxi Dress',
  'Beautiful floral print maxi dress with flowing silhouette. Perfect for summer.',
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=600&fit=crop',
  2499,
  1299,
  ARRAY['S', 'M', 'L'],
  'Women',
  22
),
(
  gen_random_uuid(),
  'High-Waist Jeans',
  'Stylish high-waist jeans with flattering fit. Stretch denim for comfort.',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=600&fit=crop',
  2199,
  1199,
  ARRAY['26', '28', '30', '32'],
  'Women',
  32
),
(
  gen_random_uuid(),
  'Crop Top',
  'Trendy crop top with modern design. Perfect for casual outings.',
  'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&h=600&fit=crop',
  899,
  499,
  ARRAY['S', 'M', 'L'],
  'Women',
  45
),
(
  gen_random_uuid(),
  'A-Line Skirt',
  'Classic A-line skirt with elegant design. Versatile for various occasions.',
  'https://images.unsplash.com/photo-1583496661160-fb5886a0uj9a?w=500&h=600&fit=crop',
  1499,
  799,
  ARRAY['S', 'M', 'L'],
  'Women',
  28
),
(
  gen_random_uuid(),
  'Blouse with Ruffles',
  'Elegant blouse with ruffle details. Perfect for office wear.',
  'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=500&h=600&fit=crop',
  1799,
  999,
  ARRAY['S', 'M', 'L', 'XL'],
  'Women',
  25
),
(
  gen_random_uuid(),
  'Yoga Leggings',
  'High-quality yoga leggings with moisture-wicking fabric. Perfect for workouts.',
  'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&h=600&fit=crop',
  1299,
  699,
  ARRAY['S', 'M', 'L', 'XL'],
  'Women',
  50
),
(
  gen_random_uuid(),
  'Cardigan Sweater',
  'Cozy cardigan sweater for layering. Soft knit fabric.',
  'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=600&fit=crop',
  1899,
  999,
  ARRAY['S', 'M', 'L'],
  'Women',
  20
),
(
  gen_random_uuid(),
  'Wrap Dress',
  'Flattering wrap dress with V-neck. Suitable for various body types.',
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=600&fit=crop',
  2299,
  1199,
  ARRAY['S', 'M', 'L'],
  'Women',
  18
),

-- Trendy Products
(
  gen_random_uuid(),
  'Streetwear Hoodie',
  'Trendy oversized hoodie with bold graphics. Street style essential.',
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=600&fit=crop',
  1999,
  1099,
  ARRAY['M', 'L', 'XL', 'XXL'],
  'Trendy',
  30
),
(
  gen_random_uuid(),
  'Graphic Print T-Shirt',
  'Eye-catching graphic print t-shirt. Unique designs for fashion-forward individuals.',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=600&fit=crop',
  899,
  499,
  ARRAY['S', 'M', 'L', 'XL'],
  'Trendy',
  55
),
(
  gen_random_uuid(),
  'Cargo Joggers',
  'Fashionable cargo joggers with multiple pockets. Comfort meets style.',
  'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&h=600&fit=crop',
  1599,
  899,
  ARRAY['S', 'M', 'L', 'XL'],
  'Trendy',
  35
),
(
  gen_random_uuid(),
  'Bucket Hat',
  'Trendy bucket hat for street style. Available in various colors.',
  'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=500&h=600&fit=crop',
  699,
  399,
  ARRAY['One Size'],
  'Trendy',
  60
),
(
  gen_random_uuid(),
  'Oversized Bomber Jacket',
  'Stylish oversized bomber jacket. Perfect for layering.',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=600&fit=crop',
  2999,
  1599,
  ARRAY['M', 'L', 'XL'],
  'Trendy',
  22
),
(
  gen_random_uuid(),
  'Chunky Sneakers',
  'Trendy chunky sneakers with bold design. Comfortable and stylish.',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&h=600&fit=crop',
  3499,
  1999,
  ARRAY['6', '7', '8', '9', '10'],
  'Trendy',
  40
),
(
  gen_random_uuid(),
  'Crossbody Bag',
  'Fashionable crossbody bag with modern design. Perfect for daily use.',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=600&fit=crop',
  1299,
  699,
  ARRAY['One Size'],
  'Trendy',
  45
),
(
  gen_random_uuid(),
  'Statement Earrings',
  'Bold statement earrings for trendy looks. Various designs available.',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=600&fit=crop',
  499,
  299,
  ARRAY['One Size'],
  'Trendy',
  70
);
