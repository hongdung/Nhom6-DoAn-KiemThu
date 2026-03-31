const express = require("express");
const path = require("path");
const session = require("express-session");
const store = require("./store");

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const defaultSessionMaxAge = 1000 * 60 * 60 * 4;

function parseBoolean(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function resolveTrustProxy(value) {
  if (!value) {
    return 1;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  const numericValue = Number.parseInt(value, 10);
  return Number.isNaN(numericValue) ? value : numericValue;
}

function resolveSameSite(value) {
  const normalized = (value || "").trim().toLowerCase();
  return ["lax", "strict", "none"].includes(normalized) ? normalized : "lax";
}

function resolveSessionSecret() {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }

  if (isProduction) {
    throw new Error("SESSION_SECRET environment variable is required in production.");
  }

  return "atelier-lane-course-project-secret";
}

const sessionSecret = resolveSessionSecret();
const sessionCookieMaxAge = Number.parseInt(process.env.SESSION_COOKIE_MAX_AGE || "", 10);
const cookieSecure = parseBoolean(process.env.SESSION_COOKIE_SECURE, isProduction);
const cookieSameSite = resolveSameSite(process.env.SESSION_COOKIE_SAME_SITE);
const trustProxy = resolveTrustProxy(process.env.TRUST_PROXY);

app.set("trust proxy", trustProxy);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    name: process.env.SESSION_NAME || "dm.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge:
        Number.isFinite(sessionCookieMaxAge) && sessionCookieMaxAge > 0
          ? sessionCookieMaxAge
          : defaultSessionMaxAge,
      sameSite: cookieSameSite,
      secure: cookieSecure,
    },
  })
);

app.locals.siteName = "D&M Fashion & Apparel";
app.locals.logoPath = "/images/branding/logo.png";
app.locals.formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

function setFlash(req, type, text) {
  req.session.flash = { type, text };
}

function ensureCart(req) {
  if (!Array.isArray(req.session.cart)) {
    req.session.cart = [];
  }
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).render("admin", {
      pageTitle: "Trang quản trị",
      forbidden: true,
      dashboard: null,
      selectedCategory: "",
    });
  }

  return next();
}

app.use((req, res, next) => {
  ensureCart(req);
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  res.locals.cart = store.buildCart(req.session.cart);
  res.locals.categories = store.listCategories();
  res.locals.currentPath = req.path;
  delete req.session.flash;
  next();
});

app.get("/", (req, res) => {
  res.render("home", {
    pageTitle: "Bộ sưu tập mới",
    featuredProducts: store.getFeaturedProducts(4),
    newArrivals: store.getProducts({ limit: 8 }),
    selectedCategory: "",
  });
});

app.get("/products", (req, res) => {
  const query = (req.query.q || "").trim();
  const category = (req.query.category || "").trim();

  res.render("products", {
    pageTitle: "Danh sách sản phẩm",
    products: store.getProducts({ query, category }),
    filters: { query, category },
    selectedCategory: category,
  });
});

app.get("/products/:slug", (req, res) => {
  const product = store.getProductBySlug(req.params.slug);

  if (!product) {
    return res.status(404).render("404", {
      pageTitle: "Không tìm thấy sản phẩm",
      selectedCategory: "",
    });
  }

  return res.render("product-detail", {
    pageTitle: product.name,
    product,
    recommendations: store
      .getProducts({ category: product.category, limit: 4 })
      .filter((item) => item.id !== product.id)
      .slice(0, 3),
    selectedCategory: product.category,
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    pageTitle: "Đăng nhập",
    selectedCategory: "",
  });
});

app.post("/login", (req, res) => {
  const user = store.authenticateUser(req.body.email, req.body.password);

  if (!user) {
    setFlash(req, "error", "Email hoặc mật khẩu chưa đúng.");
    return res.redirect("/login");
  }

  req.session.user = user;
  setFlash(req, "success", `Xin chào ${user.fullName}, bạn đã đăng nhập thành công.`);
  return res.redirect(user.role === "admin" ? "/admin" : "/");
});

app.post("/logout", (req, res) => {
  req.session.user = null;
  setFlash(req, "success", "Bạn đã đăng xuất khỏi hệ thống.");
  res.redirect("/");
});

app.get("/cart", (req, res) => {
  res.render("cart", {
    pageTitle: "Giỏ hàng",
    selectedCategory: "",
  });
});

app.post("/cart", (req, res) => {
  req.session.cart = store.addCartItem(req.session.cart, req.body.productId, req.body.quantity);
  setFlash(req, "success", "Đã thêm sản phẩm vào giỏ hàng.");
  res.redirect(req.body.redirectTo || "/cart");
});

app.post("/cart/update", (req, res) => {
  req.session.cart = store.updateCartItem(req.session.cart, req.body.productId, req.body.quantity);
  setFlash(req, "success", "Giỏ hàng đã được cập nhật.");
  res.redirect("/cart");
});

app.post("/cart/remove", (req, res) => {
  req.session.cart = store.removeCartItem(req.session.cart, req.body.productId);
  setFlash(req, "success", "Sản phẩm đã được xóa khỏi giỏ hàng.");
  res.redirect("/cart");
});

app.get("/checkout", (req, res) => {
  if (!res.locals.cart.items.length) {
    setFlash(req, "error", "Giỏ hàng đang trống, vui lòng chọn sản phẩm trước khi thanh toán.");
    return res.redirect("/products");
  }

  return res.render("checkout", {
    pageTitle: "Thanh toán",
    selectedCategory: "",
  });
});

app.post("/checkout", (req, res) => {
  const customer = {
    customerName: (req.body.customerName || "").trim(),
    customerEmail: (req.body.customerEmail || "").trim(),
    customerPhone: (req.body.customerPhone || "").trim(),
    shippingAddress: (req.body.shippingAddress || "").trim(),
  };

  if (
    !customer.customerName ||
    !customer.customerEmail ||
    !customer.customerPhone ||
    !customer.shippingAddress
  ) {
    setFlash(req, "error", "Vui lòng điền đầy đủ thông tin giao hàng.");
    return res.redirect("/checkout");
  }

  const order = store.createOrder(customer, req.session.cart);

  if (!order) {
    setFlash(req, "error", "Không thể tạo đơn hàng vì giỏ hàng đang trống.");
    return res.redirect("/cart");
  }

  req.session.cart = [];
  setFlash(req, "success", `Đặt hàng thành công. Mã đơn của bạn là #${order.orderId}.`);
  return res.redirect("/");
});

app.get("/admin", requireAdmin, (req, res) => {
  res.render("admin", {
    pageTitle: "Trang quản trị",
    forbidden: false,
    dashboard: store.getAdminOverview(),
    selectedCategory: "",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "D&M Fashion & Apparel" });
});

app.get("/api/products", (req, res) => {
  const query = (req.query.q || "").trim();
  const category = (req.query.category || "").trim();
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const products = store.getProducts({ query, category, limit });

  res.json({
    total: products.length,
    products,
  });
});

app.get("/api/products/:id", (req, res) => {
  const product = store.getProductById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }

  return res.json(product);
});

app.post("/api/auth/login", (req, res) => {
  const user = store.authenticateUser(req.body.email, req.body.password);

  if (!user) {
    return res.status(401).json({ message: "Thông tin đăng nhập không hợp lệ" });
  }

  req.session.user = user;
  return res.json({ message: "Đăng nhập thành công", user });
});

app.get("/api/cart", (req, res) => {
  res.json(store.buildCart(req.session.cart));
});

app.post("/api/cart", (req, res) => {
  req.session.cart = store.addCartItem(req.session.cart, req.body.productId, req.body.quantity);
  res.status(201).json(store.buildCart(req.session.cart));
});

app.patch("/api/cart/:productId", (req, res) => {
  req.session.cart = store.updateCartItem(req.session.cart, req.params.productId, req.body.quantity);
  res.json(store.buildCart(req.session.cart));
});

app.delete("/api/cart/:productId", (req, res) => {
  req.session.cart = store.removeCartItem(req.session.cart, req.params.productId);
  res.json(store.buildCart(req.session.cart));
});

app.post("/api/orders", (req, res) => {
  const order = store.createOrder(
    {
      customerName: (req.body.customerName || "").trim(),
      customerEmail: (req.body.customerEmail || "").trim(),
      customerPhone: (req.body.customerPhone || "").trim(),
      shippingAddress: (req.body.shippingAddress || "").trim(),
    },
    req.session.cart
  );

  if (!order) {
    return res.status(400).json({ message: "Giỏ hàng trống hoặc dữ liệu thanh toán chưa hợp lệ" });
  }

  req.session.cart = [];
  return res.status(201).json({
    message: "Tạo đơn hàng thành công",
    orderId: order.orderId,
    totalAmount: order.summary.subtotal,
  });
});

app.get("/api/admin/overview", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Cần quyền quản trị viên" });
  }

  return res.json(store.getAdminOverview());
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "Không tìm thấy tài nguyên" });
  }

  return res.status(404).render("404", {
    pageTitle: "Trang không tồn tại",
    selectedCategory: "",
  });
});

module.exports = app;
