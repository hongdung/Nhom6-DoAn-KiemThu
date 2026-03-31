const fs = require("fs");
const path = require("path");

const dataDirectory = path.join(__dirname, "..", "data");
const publicDirectory = path.join(__dirname, "..", "public");
const seedFile = path.join(dataDirectory, "seed.json");
const runtimeFile = path.join(dataDirectory, "runtime.json");
const imageExtensions = ["webp", "jpg", "jpeg", "png"];

function ensureDataFile() {
  fs.mkdirSync(dataDirectory, { recursive: true });

  if (!fs.existsSync(runtimeFile)) {
    fs.copyFileSync(seedFile, runtimeFile);
  }
}

function readData() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(runtimeFile, "utf8"));
}

function writeData(data) {
  fs.writeFileSync(runtimeFile, JSON.stringify(data, null, 2));
}

function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeQuantity(value, fallback = 1) {
  const quantity = Number.parseInt(value, 10);

  if (Number.isNaN(quantity)) {
    return fallback;
  }

  return Math.min(Math.max(quantity, 1), 10);
}

function findImageFile(directory, basename) {
  for (const extension of imageExtensions) {
    const fileName = `${basename}.${extension}`;
    const absolutePath = path.join(directory, fileName);

    if (fs.existsSync(absolutePath)) {
      return fileName;
    }
  }

  return null;
}

function resolveProductMedia(slug) {
  const productDirectory = path.join(publicDirectory, "images", "products", slug);
  const coverFile = findImageFile(productDirectory, "cover");
  const galleryFiles = ["detail-1", "detail-2", "detail-3"]
    .map((name) => findImageFile(productDirectory, name))
    .filter(Boolean);

  const cover = coverFile ? `/images/products/${slug}/${coverFile}` : null;
  const gallery = galleryFiles.map((fileName) => `/images/products/${slug}/${fileName}`);

  if (cover && !gallery.includes(cover)) {
    gallery.unshift(cover);
  }

  return { image: cover, gallery };
}

function decorateProduct(product) {
  const media = resolveProductMedia(product.slug);

  return {
    ...product,
    image: media.image,
    gallery: media.gallery,
  };
}

function listCategories() {
  const categories = new Set(readData().products.map((product) => product.category));
  return [...categories].sort((a, b) => a.localeCompare(b, "vi"));
}

function getProducts(filters = {}) {
  const query = normalizeText((filters.query || "").trim());
  const category = (filters.category || "").trim();
  const limit = filters.limit ? Number(filters.limit) : 0;

  let products = [...readData().products];

  if (category) {
    products = products.filter((product) => product.category === category);
  }

  if (query) {
    products = products.filter((product) => {
      const haystack = normalizeText(`${product.name} ${product.description}`);
      return haystack.includes(query);
    });
  }

  products.sort((left, right) => {
    const featuredCompare = Number(right.featured) - Number(left.featured);
    return featuredCompare || right.id - left.id;
  });

  const decoratedProducts = products.map(decorateProduct);

  return limit > 0 ? decoratedProducts.slice(0, limit) : decoratedProducts;
}

function getFeaturedProducts(limit = 4) {
  return getProducts().filter((product) => product.featured).slice(0, Number(limit));
}

function getProductBySlug(slug) {
  const product = readData().products.find((item) => item.slug === slug) || null;
  return product ? decorateProduct(product) : null;
}

function getProductById(id) {
  const product = readData().products.find((item) => item.id === Number(id)) || null;
  return product ? decorateProduct(product) : null;
}

function authenticateUser(email, password) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const normalizedPassword = password || "";
  const user =
    readData().users.find(
      (candidate) =>
        candidate.email.toLowerCase() === normalizedEmail &&
        candidate.password === normalizedPassword
    ) || null;

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
}

function buildCart(rawCart = []) {
  const data = readData();
  const items = rawCart
    .map((entry) => {
      const rawProduct = data.products.find((candidate) => candidate.id === Number(entry.productId));

      if (!rawProduct) {
        return null;
      }

      const product = decorateProduct(rawProduct);

      const quantity = normalizeQuantity(entry.quantity, 1);

      return {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        price: product.price,
        comparePrice: product.comparePrice,
        accentColor: product.accentColor,
        image: product.image,
        quantity,
        lineTotal: product.price * quantity,
      };
    })
    .filter(Boolean);

  return {
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.lineTotal, 0),
  };
}

function addCartItem(rawCart = [], productId, quantity) {
  const targetId = Number(productId);

  if (!Number.isInteger(targetId) || !getProductById(targetId)) {
    return rawCart;
  }

  const nextCart = rawCart.map((item) => ({ ...item }));
  const existingItem = nextCart.find((item) => Number(item.productId) === targetId);
  const nextQuantity = normalizeQuantity(quantity, 1);

  if (existingItem) {
    existingItem.quantity = normalizeQuantity(existingItem.quantity + nextQuantity, 1);
  } else {
    nextCart.push({ productId: targetId, quantity: nextQuantity });
  }

  return nextCart;
}

function updateCartItem(rawCart = [], productId, quantity) {
  const targetId = Number(productId);
  const nextQuantity = Number.parseInt(quantity, 10);

  if (!Number.isInteger(targetId)) {
    return rawCart;
  }

  if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
    return removeCartItem(rawCart, targetId);
  }

  return rawCart.map((item) =>
    Number(item.productId) === targetId
      ? { productId: targetId, quantity: normalizeQuantity(nextQuantity, 1) }
      : { ...item }
  );
}

function removeCartItem(rawCart = [], productId) {
  const targetId = Number(productId);
  return rawCart.filter((item) => Number(item.productId) !== targetId);
}

function createOrder(customer, rawCart = []) {
  const summary = buildCart(rawCart);

  if (
    !summary.items.length ||
    !customer.customerName ||
    !customer.customerEmail ||
    !customer.customerPhone ||
    !customer.shippingAddress
  ) {
    return null;
  }

  const data = readData();
  const nextOrderId = data.orders.reduce((max, order) => Math.max(max, order.id), 0) + 1;
  const order = {
    id: nextOrderId,
    customerName: customer.customerName,
    customerEmail: customer.customerEmail,
    customerPhone: customer.customerPhone,
    shippingAddress: customer.shippingAddress,
    totalAmount: summary.subtotal,
    createdAt: new Date().toISOString(),
    items: summary.items.map((item) => ({
      productId: item.productId,
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
    })),
  };

  data.orders.unshift(order);

  for (const item of summary.items) {
    const product = data.products.find((candidate) => candidate.id === item.productId);

    if (product) {
      product.stock = Math.max(product.stock - item.quantity, 0);
    }
  }

  writeData(data);

  return {
    orderId: order.id,
    summary,
  };
}

function getAdminOverview() {
  const data = readData();
  const revenue = data.orders.reduce((total, order) => total + order.totalAmount, 0);
  const lowStock = [...data.products]
    .filter((product) => product.stock <= 12)
    .sort((left, right) => left.stock - right.stock || left.id - right.id);

  return {
    metrics: {
      productCount: data.products.length,
      orderCount: data.orders.length,
      revenue,
    },
    lowStock,
    recentOrders: data.orders.slice(0, 5),
  };
}

module.exports = {
  addCartItem,
  authenticateUser,
  buildCart,
  createOrder,
  getAdminOverview,
  getFeaturedProducts,
  getProductById,
  getProductBySlug,
  getProducts,
  listCategories,
  removeCartItem,
  updateCartItem,
};
