const fs = require("fs");
const path = require("path");

const dataDirectory = path.join(__dirname, "..", "data");
const publicDirectory = path.join(__dirname, "..", "public");
const seedFile = path.join(dataDirectory, "seed.json");
const runtimeFile = path.join(dataDirectory, "runtime.json");
const imageExtensions = ["webp", "jpg", "jpeg", "png"];
const MAX_CART_QUANTITY = 10;

function ensureDataFile() {
  fs.mkdirSync(dataDirectory, { recursive: true });

  if (!fs.existsSync(runtimeFile)) {
    fs.copyFileSync(seedFile, runtimeFile);
  }
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

function slugify(value = "") {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeQuantity(value, fallback = 1) {
  const quantity = Number.parseInt(value, 10);

  if (Number.isNaN(quantity)) {
    return fallback;
  }

  return Math.min(Math.max(quantity, 1), MAX_CART_QUANTITY);
}

function normalizeMoney(value, fallback = 0) {
  const rawValue = typeof value === "string" ? value.replace(/[^\d-]/g, "") : value;
  const numericValue = Number.parseInt(rawValue, 10);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizeNonNegativeInteger(value, fallback = 0) {
  const numericValue = Number.parseInt(value, 10);
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : fallback;
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

function buildCategoriesFromProducts(products = []) {
  const uniqueNames = [...new Set(products.map((product) => product.category).filter(Boolean))];

  return uniqueNames
    .sort((left, right) => left.localeCompare(right, "vi"))
    .map((name, index) => ({
      id: index + 1,
      name,
      slug: slugify(name),
      isActive: true,
    }));
}

function normalizeCategoryRecord(category, fallbackId) {
  const name = String(category?.name || "").trim();
  const slug = slugify(category?.slug || name);

  return {
    id: Number.isInteger(Number(category?.id)) ? Number(category.id) : fallbackId,
    name,
    slug,
    isActive: category?.isActive !== false,
  };
}

function buildUniqueSlug(items, desiredSlug, currentId = null) {
  const baseSlug = slugify(desiredSlug) || "item";
  let candidate = baseSlug;
  let counter = 2;

  while (
    items.some(
      (item) => String(item.slug).toLowerCase() === candidate && Number(item.id) !== Number(currentId)
    )
  ) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return candidate;
}

function hydrateData(parsed) {
  const data = {
    users: Array.isArray(parsed?.users) ? parsed.users.map((user) => ({ ...user })) : [],
    products: Array.isArray(parsed?.products) ? parsed.products.map((product) => ({ ...product })) : [],
    orders: Array.isArray(parsed?.orders) ? parsed.orders.map((order) => ({ ...order })) : [],
    categories: Array.isArray(parsed?.categories)
      ? parsed.categories.map((category, index) => normalizeCategoryRecord(category, index + 1))
      : [],
  };

  let changed = false;

  if (!data.categories.length) {
    data.categories = buildCategoriesFromProducts(data.products);
    changed = true;
  }

  const categoryById = new Map(data.categories.map((category) => [Number(category.id), category]));
  const categoryByName = new Map(
    data.categories.map((category) => [normalizeText(category.name), category])
  );

  let nextCategoryId =
    data.categories.reduce((max, category) => Math.max(max, Number(category.id) || 0), 0) + 1;

  for (const product of data.products) {
    if (!product.slug && product.name) {
      product.slug = buildUniqueSlug(data.products, product.name, product.id);
      changed = true;
    }

    const productCategoryName = String(product.category || "").trim();
    const productCategoryId = Number(product.categoryId);

    if (Number.isInteger(productCategoryId) && categoryById.has(productCategoryId)) {
      continue;
    }

    if (productCategoryName) {
      const matchedCategory = categoryByName.get(normalizeText(productCategoryName));

      if (matchedCategory) {
        product.categoryId = matchedCategory.id;
        changed = true;
        continue;
      }

      const newCategory = {
        id: nextCategoryId,
        name: productCategoryName,
        slug: buildUniqueSlug(data.categories, productCategoryName),
        isActive: true,
      };

      data.categories.push(newCategory);
      categoryById.set(newCategory.id, newCategory);
      categoryByName.set(normalizeText(newCategory.name), newCategory);
      product.categoryId = newCategory.id;
      nextCategoryId += 1;
      changed = true;
      continue;
    }

    const fallbackCategory = data.categories.find((category) => category.isActive) || data.categories[0];

    if (fallbackCategory) {
      product.categoryId = fallbackCategory.id;
      changed = true;
    }
  }

  return { data, changed };
}

function readData() {
  ensureDataFile();
  const parsed = JSON.parse(fs.readFileSync(runtimeFile, "utf8"));
  const { data, changed } = hydrateData(parsed);

  if (changed) {
    writeData(data);
  }

  return data;
}

function resolveCategoryName(data, product) {
  const matchedCategory = data.categories.find((category) => category.id === Number(product.categoryId));
  return matchedCategory?.name || product.category || "Chưa phân loại";
}

function decorateProduct(product, data = readData()) {
  const media = resolveProductMedia(product.slug);

  return {
    ...product,
    category: resolveCategoryName(data, product),
    image: media.image,
    gallery: media.gallery,
  };
}

function listCategories(options = {}) {
  const includeInactive = Boolean(options.includeInactive);

  return readData()
    .categories.filter((category) => includeInactive || category.isActive)
    .sort((left, right) => left.name.localeCompare(right.name, "vi"))
    .map((category) => category.name);
}

function listAdminCategories() {
  const data = readData();
  const productCounts = data.products.reduce((counts, product) => {
    const categoryId = Number(product.categoryId);
    counts.set(categoryId, (counts.get(categoryId) || 0) + 1);
    return counts;
  }, new Map());

  return [...data.categories]
    .sort((left, right) => left.name.localeCompare(right.name, "vi"))
    .map((category) => ({
      ...category,
      productCount: productCounts.get(Number(category.id)) || 0,
    }));
}

function getCategoryById(id) {
  const categoryId = Number(id);
  return readData().categories.find((category) => category.id === categoryId) || null;
}

function createCategory(payload = {}) {
  const data = readData();
  const name = String(payload.name || "").trim();
  const normalizedName = normalizeText(name);

  if (!name) {
    return { error: "Tên danh mục không được để trống." };
  }

  if (data.categories.some((category) => normalizeText(category.name) === normalizedName)) {
    return { error: "Tên danh mục đã tồn tại." };
  }

  const nextId = data.categories.reduce((max, category) => Math.max(max, category.id), 0) + 1;
  const category = {
    id: nextId,
    name,
    slug: buildUniqueSlug(data.categories, name),
    isActive: payload.isActive !== false,
  };

  data.categories.push(category);
  writeData(data);

  return { category };
}

function updateCategory(id, payload = {}) {
  const categoryId = Number(id);
  const data = readData();
  const category = data.categories.find((item) => item.id === categoryId);

  if (!category) {
    return { error: "Không tìm thấy danh mục cần cập nhật." };
  }

  const name = String(payload.name || "").trim();
  const normalizedName = normalizeText(name);

  if (!name) {
    return { error: "Tên danh mục không được để trống." };
  }

  if (
    data.categories.some(
      (item) => item.id !== categoryId && normalizeText(item.name) === normalizedName
    )
  ) {
    return { error: "Tên danh mục đã tồn tại." };
  }

  category.name = name;
  category.slug = buildUniqueSlug(data.categories, name, categoryId);
  category.isActive = payload.isActive !== false;

  writeData(data);
  return { category };
}

function getProducts(filters = {}) {
  const data = readData();
  const query = normalizeText((filters.query || "").trim());
  const category = (filters.category || "").trim();
  const limit = filters.limit ? Number(filters.limit) : 0;

  let products = [...data.products];

  if (category) {
    products = products.filter((product) => resolveCategoryName(data, product) === category);
  }

  if (query) {
    products = products.filter((product) => {
      const haystack = normalizeText(
        `${product.name} ${product.description} ${resolveCategoryName(data, product)}`
      );
      return haystack.includes(query);
    });
  }

  products.sort((left, right) => {
    const featuredCompare = Number(Boolean(right.featured)) - Number(Boolean(left.featured));
    return featuredCompare || right.id - left.id;
  });

  const decoratedProducts = products.map((product) => decorateProduct(product, data));

  return limit > 0 ? decoratedProducts.slice(0, limit) : decoratedProducts;
}

function getFeaturedProducts(limit = 4) {
  return getProducts().filter((product) => product.featured).slice(0, Number(limit));
}

function getProductBySlug(slug) {
  const data = readData();
  const product = data.products.find((item) => item.slug === slug) || null;
  return product ? decorateProduct(product, data) : null;
}

function getProductById(id) {
  const data = readData();
  const product = data.products.find((item) => item.id === Number(id)) || null;
  return product ? decorateProduct(product, data) : null;
}

function listAdminProducts() {
  const data = readData();

  return [...data.products]
    .sort((left, right) => right.id - left.id)
    .map((product) => decorateProduct(product, data));
}

function getAdminProductById(id) {
  const productId = Number(id);
  const data = readData();
  const product = data.products.find((item) => item.id === productId) || null;

  return product ? decorateProduct(product, data) : null;
}

function sanitizeProductPayload(data, payload = {}, currentProductId = null) {
  const name = String(payload.name || "").trim();
  const description = String(payload.description || "").trim();
  const requestedSlug = String(payload.slug || "").trim();
  const slug = slugify(requestedSlug || name);
  const categoryId = Number.parseInt(payload.categoryId, 10);
  const price = normalizeMoney(payload.price, -1);
  const comparePriceInput = String(payload.comparePrice || "").trim();
  const comparePrice = comparePriceInput ? normalizeMoney(comparePriceInput, -1) : 0;
  const stock = normalizeNonNegativeInteger(payload.stock, -1);
  const accentColor = String(payload.accentColor || "").trim() || "#b22f2b";
  const featured =
    payload.featured === true ||
    payload.featured === "true" ||
    payload.featured === "1" ||
    payload.featured === "on";

  if (!name) {
    return { error: "Tên sản phẩm không được để trống." };
  }

  if (!description) {
    return { error: "Mô tả sản phẩm không được để trống." };
  }

  if (!slug) {
    return { error: "Slug sản phẩm không hợp lệ." };
  }

  if (
    data.products.some(
      (product) =>
        Number(product.id) !== Number(currentProductId) &&
        String(product.slug).toLowerCase() === slug.toLowerCase()
    )
  ) {
    return { error: "Slug sản phẩm đã tồn tại." };
  }

  if (!data.categories.some((category) => category.id === categoryId)) {
    return { error: "Vui lòng chọn danh mục hợp lệ." };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return { error: "Giá bán phải lớn hơn 0." };
  }

  if (comparePriceInput && (!Number.isFinite(comparePrice) || comparePrice <= 0)) {
    return { error: "Giá gốc phải lớn hơn 0 nếu được nhập." };
  }

  if (comparePriceInput && comparePrice < price) {
    return { error: "Giá gốc phải lớn hơn hoặc bằng giá bán." };
  }

  if (!Number.isFinite(stock) || stock < 0) {
    return { error: "Tồn kho phải là số nguyên không âm." };
  }

  return {
    value: {
      name,
      slug,
      categoryId,
      price,
      comparePrice: comparePriceInput ? comparePrice : 0,
      description,
      accentColor,
      featured,
      stock,
    },
  };
}

function createProduct(payload = {}) {
  const data = readData();
  const { value, error } = sanitizeProductPayload(data, payload);

  if (error) {
    return { error };
  }

  const nextId = data.products.reduce((max, product) => Math.max(max, product.id), 0) + 1;
  const product = {
    id: nextId,
    ...value,
  };

  data.products.push(product);
  writeData(data);

  return { product: decorateProduct(product, data) };
}

function updateProduct(id, payload = {}) {
  const productId = Number(id);
  const data = readData();
  const product = data.products.find((item) => item.id === productId);

  if (!product) {
    return { error: "Không tìm thấy sản phẩm cần cập nhật." };
  }

  const { value, error } = sanitizeProductPayload(data, payload, productId);

  if (error) {
    return { error };
  }

  Object.assign(product, value);
  writeData(data);

  return { product: decorateProduct(product, data) };
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

      const product = decorateProduct(rawProduct, data);
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
    .sort((left, right) => left.stock - right.stock || left.id - right.id)
    .map((product) => decorateProduct(product, data));

  return {
    metrics: {
      categoryCount: data.categories.filter((category) => category.isActive).length,
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
  createCategory,
  createOrder,
  createProduct,
  getAdminOverview,
  getAdminProductById,
  getCategoryById,
  getFeaturedProducts,
  getProductById,
  getProductBySlug,
  getProducts,
  listAdminCategories,
  listAdminProducts,
  listCategories,
  readData,
  removeCartItem,
  updateCartItem,
  updateCategory,
  updateProduct,
};
