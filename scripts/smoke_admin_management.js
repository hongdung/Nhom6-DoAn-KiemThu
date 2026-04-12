const fs = require("fs");
const path = require("path");

const app = require("../src/app");
const store = require("../src/store");

const runtimePath = path.join(__dirname, "..", "data", "runtime.json");
const backupPath = path.join(__dirname, "..", "data", "runtime.test-backup.json");

async function run() {
  fs.copyFileSync(runtimePath, backupPath);

  const server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });

  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = "";
  const checks = [];

  async function request(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (cookie) {
      headers.cookie = cookie;
    }

    const response = await fetch(base + url, { redirect: "manual", ...options, headers });
    const setCookie = response.headers.get("set-cookie");

    if (setCookie) {
      cookie = setCookie.split(";")[0];
    }

    return response;
  }

  async function step(label, fn) {
    try {
      const result = await fn();
      checks.push({ label, status: "PASS", result });
    } catch (error) {
      checks.push({ label, status: "FAIL", result: error.message });
      throw error;
    }
  }

  try {
    await step("Dang nhap admin", async () => {
      const response = await request("/login", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          email: "admin@atelier.local",
          password: "admin123",
        }).toString(),
      });

      if (response.status !== 302 || response.headers.get("location") !== "/admin") {
        throw new Error(`Unexpected login response: ${response.status}`);
      }

      return "OK";
    });

    await step("Mo trang quan ly danh muc", async () => {
      const response = await request("/admin/categories");
      const html = await response.text();

      if (response.status !== 200 || !html.includes('action="/admin/categories"')) {
        throw new Error("Trang quan ly danh muc khong tai dung.");
      }

      return "OK";
    });

    await step("Tao danh muc moi", async () => {
      const response = await request("/admin/categories", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ name: "Cong so", isActive: "on" }).toString(),
      });

      if (response.status !== 302 || response.headers.get("location") !== "/admin/categories") {
        throw new Error("Khong tao duoc danh muc moi.");
      }

      const category = store.listAdminCategories().find((item) => item.name === "Cong so");

      if (!category) {
        throw new Error("Danh muc Cong so khong xuat hien trong du lieu.");
      }

      return category.id;
    });

    const category = store.listAdminCategories().find((item) => item.name === "Cong so");

    await step("Mo form them san pham", async () => {
      const response = await request("/admin/products/new");
      const html = await response.text();

      if (response.status !== 200 || !html.includes('action="/admin/products"')) {
        throw new Error("Form them san pham khong tai dung.");
      }

      return "OK";
    });

    await step("Tao san pham moi", async () => {
      const response = await request("/admin/products", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          name: "Ao so mi Oxford Classic",
          slug: "ao-so-mi-oxford-classic",
          categoryId: String(category.id),
          price: "850000",
          comparePrice: "990000",
          stock: "16",
          accentColor: "#8f6f52",
          description: "Thiet ke so mi cong so co dien, phu hop cho moi truong van phong.",
          featured: "on",
        }).toString(),
      });

      if (response.status !== 302 || response.headers.get("location") !== "/admin/products") {
        throw new Error("Khong tao duoc san pham moi.");
      }

      const product = store.listAdminProducts().find((item) => item.slug === "ao-so-mi-oxford-classic");

      if (!product) {
        throw new Error("San pham moi khong xuat hien trong du lieu.");
      }

      return product.id;
    });

    const product = store.listAdminProducts().find((item) => item.slug === "ao-so-mi-oxford-classic");

    await step("Chinh sua san pham", async () => {
      const response = await request(`/admin/products/${product.id}`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          name: "Ao so mi Oxford Classic Updated",
          slug: "ao-so-mi-oxford-classic",
          categoryId: String(category.id),
          price: "870000",
          comparePrice: "990000",
          stock: "14",
          accentColor: "#8f6f52",
          description: "Thiet ke so mi cong so co dien da duoc cap nhat.",
          featured: "on",
        }).toString(),
      });

      if (response.status !== 302 || response.headers.get("location") !== "/admin/products") {
        throw new Error("Khong cap nhat duoc san pham.");
      }

      const updated = store.getAdminProductById(product.id);

      if (!updated || updated.name !== "Ao so mi Oxford Classic Updated" || updated.price !== 870000) {
        throw new Error("Du lieu san pham sau cap nhat khong dung.");
      }

      return "OK";
    });

    await step("Tat trang thai danh muc", async () => {
      const response = await request(`/admin/categories/${category.id}`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ name: "Cong so" }).toString(),
      });

      if (response.status !== 302 || response.headers.get("location") !== "/admin/categories") {
        throw new Error("Khong cap nhat duoc trang thai danh muc.");
      }

      const updatedCategory = store.getCategoryById(category.id);

      if (!updatedCategory || updatedCategory.isActive !== false) {
        throw new Error("Danh muc khong duoc tat trang thai nhu mong doi.");
      }

      return "OK";
    });

    await step("Tat trang thai noi bat cua san pham", async () => {
      const response = await request(`/admin/products/${product.id}`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          name: "Ao so mi Oxford Classic Updated",
          slug: "ao-so-mi-oxford-classic",
          categoryId: String(category.id),
          price: "870000",
          comparePrice: "990000",
          stock: "14",
          accentColor: "#8f6f52",
          description: "Thiet ke so mi cong so co dien da duoc cap nhat.",
        }).toString(),
      });

      if (response.status !== 302 || response.headers.get("location") !== "/admin/products") {
        throw new Error("Khong cap nhat duoc trang thai noi bat cua san pham.");
      }

      const updatedProduct = store.getAdminProductById(product.id);

      if (!updatedProduct || updatedProduct.featured !== false) {
        throw new Error("San pham van giu trang thai noi bat sau khi bo chon.");
      }

      return "OK";
    });

    await step("Mo trang quan ly san pham", async () => {
      const response = await request("/admin/products");
      const html = await response.text();

      if (response.status !== 200 || !html.includes("ao-so-mi-oxford-classic")) {
        throw new Error("Trang quan ly san pham khong hien thi san pham moi.");
      }

      return "OK";
    });
  } finally {
    server.close();
    fs.copyFileSync(backupPath, runtimePath);
    fs.unlinkSync(backupPath);
  }

  console.log(JSON.stringify(checks, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
