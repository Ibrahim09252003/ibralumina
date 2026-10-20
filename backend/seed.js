require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/Product");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const products = [
  { id: 1,  name: "Aurora ANC Wireless Headphones", price: 149.99, category: "Audio",       description: "Premium over-ear headphones with hybrid active noise cancellation, 40-hour battery life, and studio-tuned 40mm drivers. Memory-foam ear cushions keep you comfortable on long flights.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop", stock: 25, rating: 4.8 },
  { id: 2,  name: "Pulse Fitness Tracker",          price: 79.99,  category: "Wearables",   description: "Track steps, heart rate, blood oxygen and sleep quality on a bright AMOLED display. Waterproof to 50m with a 10-day battery.", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop", stock: 42, rating: 4.5 },
  { id: 3,  name: "Nomad Leather Backpack",         price: 89.99,  category: "Accessories", description: "Handcrafted full-grain leather backpack with a padded 16\" laptop sleeve, five compartments and a water-resistant lining. Ages beautifully.", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", stock: 18, rating: 4.7 },
  { id: 4,  name: "Vertex 4K Action Camera",        price: 199.99, category: "Photography", description: "Shoot 4K60fps with 6-axis gyro stabilisation, a 155° wide lens and a waterproof housing rated to 40m. Includes two batteries and a mounting kit.", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop", stock: 12, rating: 4.4 },
  { id: 5,  name: "Ergoflex Mesh Office Chair",     price: 249.99, category: "Workspace",   description: "Breathable mesh back with adjustable lumbar support, 4D armrests, a synchro-tilt mechanism and a Class-4 gas lift. Built for 10-hour days.", image: "https://images.unsplash.com/photo-1596162954151-cdcb4c0f70a8?w=600&h=600&fit=crop", stock: 8, rating: 4.6 },
  { id: 6,  name: "Hydrokeep Insulated Bottle 750ml", price: 34.99, category: "Accessories", description: "Double-walled vacuum insulation keeps drinks hot for 12 hours or ice-cold for 24. Food-grade 18/8 stainless steel with a leak-proof bamboo cap.", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop", stock: 55, rating: 4.3 },
  { id: 7,  name: "Lumen Smart Desk Lamp",          price: 59.99,  category: "Workspace",   description: "Eye-care LED panel with 5 colour temperatures, stepless dimming, a built-in wireless charger and a USB-A port. Touch controls with memory.", image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=600&fit=crop", stock: 30, rating: 4.7 },
  { id: 8,  name: "NovaBook Pro 14\"",              price: 1099.0, category: "Workspace",   description: "14-inch Liquid Retina display, 16GB unified memory, 512GB SSD and up to 18 hours of battery. The compact powerhouse for creators on the move.", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop", stock: 6, rating: 4.9 },
  { id: 9,  name: "EchoBuds Mini True Wireless",    price: 49.99,  category: "Audio",       description: "Featherweight 4.1g buds with Bluetooth 5.3, touch controls, IPX5 sweat resistance and 28 hours total playtime with the pocket charging case.", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop", stock: 60, rating: 4.2 },
  { id: 10, name: "Terra Ceramic Mug Set (4 pc)",   price: 29.99,  category: "Home",        description: "Hand-glazed stoneware mugs in warm earthy tones. Microwave and dishwasher safe, 350ml each. Each piece is subtly one of a kind.", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop", stock: 40, rating: 4.6 },
  { id: 11, name: "Skyline Drone X2",               price: 329.99, category: "Photography", description: "Foldable 4K drone with 3-axis gimbal, 35-minute flight time, GPS return-to-home and obstacle sensing on all four sides. Under 249g.", image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=600&fit=crop", stock: 9, rating: 4.5 },
  { id: 12, name: "ZenFlow Yoga Mat 6mm",           price: 44.99,  category: "Fitness",     description: "Non-slip natural rubber mat with alignment lines and 6mm cushioning for joint support. Includes a carry strap. Free of PVC and latex.", image: "https://images.unsplash.com/photo-1591291621164-2c6367723315?w=600&h=600&fit=crop", stock: 35, rating: 4.4 },
  { id: 13, name: "Chrono Minimal Watch",           price: 129.99, category: "Wearables",   description: "Sapphire-coated 40mm case, Japanese quartz movement and an Italian leather strap. 5ATM water resistance in a clean, timeless silhouette.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop", stock: 22, rating: 4.8 },
  { id: 14, name: "AeroRun Knit Sneakers",          price: 99.99,  category: "Fashion",     description: "Breathable flyknit upper on a responsive foam midsole. Only 218g per shoe with a recycled-rubber outsole. Made for daily miles.", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop", stock: 28, rating: 4.6 },
  { id: 15, name: "KeyForge 75 Mechanical Keyboard", price: 119.99, category: "Workspace",  description: "Hot-swappable 75% layout with gasket mounting, pre-lubed linear switches, doubleshot PBT keycaps and tri-mode connectivity (BT / 2.4G / USB-C).", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop", stock: 16, rating: 4.7 },
  { id: 16, name: "PureAir Desk Purifier",          price: 89.99,  category: "Home",        description: "True HEPA H13 filtration with an activated-carbon layer. Whisper-quiet at 22dB, covers up to 30m², with a 360° intake and USB-C power.", image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop", stock: 14, rating: 4.3 },
  { id: 17, name: "Solstice Polarised Sunglasses",  price: 64.99,  category: "Fashion",     description: "Lightweight acetate frame with UV400 polarised lenses that cut glare without dulling colour. Includes a hard case and microfibre cloth.", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop", stock: 26, rating: 4.5 },
  { id: 18, name: "BoomBox Portable Speaker",       price: 79.99,  category: "Audio",       description: "360° sound with a passive bass radiator, IP67 waterproofing and 24-hour battery. Pair two for true stereo. Doubles as a power bank.", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop", stock: 33, rating: 4.6 },
];

const DEMO_PASSWORDS = {
  admin:   "admin123",
  manager: "manager123",
  buyer:   "buyer123",
};

const demoUsers = [
  { id: 1, firstName: "Admin",   lastName: "User",     name: "Admin User",     username: "admin",   role: "admin",   email: "admin@ibralumina.shop",   phone: "+63 917 000 0001" },
  { id: 2, firstName: "Manager", lastName: "User",     name: "Manager User",   username: "manager", role: "manager", email: "manager@ibralumina.shop", phone: "+63 917 000 0002" },
  { id: 3, firstName: "Juan",    lastName: "Dela Cruz", name: "Juan Dela Cruz", username: "buyer",   role: "buyer",   email: "buyer@ibralumina.shop",   phone: "+63 917 000 0003" },
];

const run = async () => {
  await connectDB();

  // ── Products ──
  await Product.deleteMany();
  console.log("🗑️  Cleared existing products");
  const insertedProducts = await Product.insertMany(products);
  console.log(`✅ Seeded ${insertedProducts.length} products`);

  // ── Users ──
  await User.deleteMany();
  console.log("🗑️  Cleared existing users");

  const usersWithHashes = await Promise.all(
    demoUsers.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(DEMO_PASSWORDS[u.username], 10),
    }))
  );
  const insertedUsers = await User.insertMany(usersWithHashes);
  console.log(`✅ Seeded ${insertedUsers.length} users`);
  console.log("   → admin / admin123");
  console.log("   → manager / manager123");
  console.log("   → buyer / buyer123");

  await mongoose.connection.close();
  console.log("🔌 Connection closed");
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});