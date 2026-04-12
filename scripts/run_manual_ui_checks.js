const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://dm-fashion-apparel.onrender.com";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_FILE = path.join(__dirname, "..", "docs", "manual-ui-check-results.json");

async function newSession(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  return { context, page };
}

function pass(id, name, note = "") {
  return { id, name, status: "PASS", note };
}

function fail(id, name, error) {
  return { id, name, status: "FAIL", note: error instanceof Error ? error.message : String(error) };
}

async function runCase(id, name, fn) {
  try {
    const note = await fn();
    return pass(id, name, note || "");
  } catch (error) {
    return fail(id, name, error);
  }
}

async function login(page, email, password) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

async function addFirstProductToCart(page) {
  await page.goto(`${BASE_URL}/products`, { waitUntil: "domcontentloaded" });
  await page.locator(".product-card").first().locator('button:has-text("Thêm giỏ hàng")').click();
  await page.waitForURL(/\/products$/);
}

async function addSpecificProductToCart(page, slug = "so-mi-linen-oversize") {
  await page.goto(`${BASE_URL}/products/${slug}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Thêm vào giỏ hàng" }).click();
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
  });

  const results = [];

  // TC_UI_01
  results.push(
    await runCase("TC_UI_01", "Trang chủ hiển thị đúng", async () => {
      const { context, page } = await newSession(browser);
      try {
        await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
        await page.waitForSelector("h1");
        const heading = await page.locator("h1").first().textContent();
        if (!heading || !heading.includes("Những thiết kế tối giản")) {
          throw new Error("Tiêu đề chính của trang chủ không đúng như mong đợi.");
        }
        return "Trang chủ tải thành công, banner và tiêu đề chính hiển thị đúng.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_02
  results.push(
    await runCase("TC_UI_02", "Danh sách sản phẩm hiển thị", async () => {
      const { context, page } = await newSession(browser);
      try {
        await page.goto(`${BASE_URL}/products`, { waitUntil: "domcontentloaded" });
        const count = await page.locator(".product-card").count();
        if (count < 1) {
          throw new Error("Không tìm thấy sản phẩm nào trên trang danh sách.");
        }
        return `Trang danh sách tải thành công với ${count} sản phẩm hiển thị.`;
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_03
  results.push(
    await runCase("TC_UI_03", "Tìm kiếm có kết quả", async () => {
      const { context, page } = await newSession(browser);
      try {
        await page.goto(`${BASE_URL}/products`, { waitUntil: "domcontentloaded" });
        await page.locator('.filter-panel input[name="q"]').fill("áo");
        await page.getByRole("button", { name: "Lọc sản phẩm" }).click();
        const text = await page.locator(".section-header.compact h2").textContent();
        if (!text || text.startsWith("0 ")) {
          throw new Error("Tìm kiếm từ khóa áo không trả về kết quả.");
        }
        return `Tìm kiếm với từ khóa "áo" trả về: ${text.trim()}.`;
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_04
  results.push(
    await runCase("TC_UI_04", "Tìm kiếm không có kết quả", async () => {
      const { context, page } = await newSession(browser);
      try {
        await page.goto(`${BASE_URL}/products`, { waitUntil: "domcontentloaded" });
        await page.locator('.filter-panel input[name="q"]').fill("xyz123");
        await page.getByRole("button", { name: "Lọc sản phẩm" }).click();
        const empty = await page.locator(".empty-state h2").textContent();
        if (!empty || !empty.includes("Chưa có sản phẩm phù hợp")) {
          throw new Error("Không hiển thị trạng thái rỗng khi tìm kiếm không có kết quả.");
        }
        return "Tìm kiếm từ khóa không tồn tại hiển thị trạng thái rỗng đúng.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_05
  results.push(
    await runCase("TC_UI_05", "Tìm kiếm không dấu", async () => {
      const { context, page } = await newSession(browser);
      try {
        await page.goto(`${BASE_URL}/products`, { waitUntil: "domcontentloaded" });
        await page.locator('.filter-panel input[name="q"]').fill("ao");
        await page.getByRole("button", { name: "Lọc sản phẩm" }).click();
        const text = await page.locator(".section-header.compact h2").textContent();
        if (!text || text.startsWith("0 ")) {
          throw new Error("Tìm kiếm không dấu không trả về kết quả.");
        }
        return `Tìm kiếm không dấu hoạt động, kết quả: ${text.trim()}.`;
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_06
  results.push(
    await runCase("TC_UI_06", "Lọc danh mục Nữ", async () => {
      const { context, page } = await newSession(browser);
      try {
        await page.goto(`${BASE_URL}/products`, { waitUntil: "domcontentloaded" });
        await page.locator('.filter-panel select[name="category"]').selectOption("Nữ");
        await page.getByRole("button", { name: "Lọc sản phẩm" }).click();
        await page.waitForURL(/category=/);
        const url = page.url();
        if (!decodeURIComponent(url).includes("category=Nữ")) {
          throw new Error("URL không phản ánh bộ lọc danh mục Nữ.");
        }
        return "Lọc danh mục Nữ hoạt động đúng.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_07
  results.push(
    await runCase("TC_UI_07", "Lọc danh mục Nam", async () => {
      const { context, page } = await newSession(browser);
      try {
        await page.goto(`${BASE_URL}/products`, { waitUntil: "domcontentloaded" });
        await page.locator('.filter-panel select[name="category"]').selectOption("Nam");
        await page.getByRole("button", { name: "Lọc sản phẩm" }).click();
        await page.waitForURL(/category=/);
        const url = page.url();
        if (!decodeURIComponent(url).includes("category=Nam")) {
          throw new Error("URL không phản ánh bộ lọc danh mục Nam.");
        }
        return "Lọc danh mục Nam hoạt động đúng.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_08
  results.push(
    await runCase("TC_UI_08", "Mở trang chi tiết sản phẩm", async () => {
      const { context, page } = await newSession(browser);
      try {
        await page.goto(`${BASE_URL}/products`, { waitUntil: "domcontentloaded" });
        await page.locator(".product-card h3 a").first().click();
        await page.waitForSelector(".detail-grid");
        const detailHeading = await page.locator(".detail-copy h2").textContent();
        if (!detailHeading) {
          throw new Error("Không hiển thị tiêu đề ở trang chi tiết.");
        }
        return `Trang chi tiết sản phẩm mở thành công: ${detailHeading.trim()}.`;
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_09
  results.push(
    await runCase("TC_UI_09", "Gallery ảnh sản phẩm hiển thị", async () => {
      const { context, page } = await newSession(browser);
      try {
        await page.goto(`${BASE_URL}/products/so-mi-linen-oversize`, { waitUntil: "domcontentloaded" });
        const galleryCount = await page.locator(".detail-gallery img").count();
        if (galleryCount < 1) {
          throw new Error("Không tìm thấy ảnh gallery trên trang chi tiết sản phẩm.");
        }
        return `Trang chi tiết hiển thị ${galleryCount} ảnh trong gallery.`;
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_10
  results.push(
    await runCase("TC_UI_10", "Thêm sản phẩm vào giỏ hàng", async () => {
      const { context, page } = await newSession(browser);
      try {
        await addSpecificProductToCart(page);
        await page.goto(`${BASE_URL}/cart`, { waitUntil: "domcontentloaded" });
        const itemCount = await page.locator(".cart-item").count();
        if (itemCount < 1) {
          throw new Error("Giỏ hàng không có sản phẩm sau khi thêm.");
        }
        return "Thêm sản phẩm vào giỏ hàng thành công.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_11
  results.push(
    await runCase("TC_UI_11", "Thêm cùng sản phẩm lần hai", async () => {
      const { context, page } = await newSession(browser);
      try {
        await addSpecificProductToCart(page);
        await addSpecificProductToCart(page);
        await page.goto(`${BASE_URL}/cart`, { waitUntil: "domcontentloaded" });
        const qty = await page.locator('.cart-form input[name="quantity"]').first().inputValue();
        if (Number(qty) < 2) {
          throw new Error(`Số lượng sau khi thêm lần hai không tăng đúng, hiện là ${qty}.`);
        }
        return `Thêm lại cùng sản phẩm thành công, số lượng hiện tại là ${qty}.`;
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_12
  results.push(
    await runCase("TC_UI_12", "Cập nhật số lượng trong giỏ hàng", async () => {
      const { context, page } = await newSession(browser);
      try {
        await addSpecificProductToCart(page);
        await page.goto(`${BASE_URL}/cart`, { waitUntil: "domcontentloaded" });
        const qtyInput = page.locator('.cart-form input[name="quantity"]').first();
        await qtyInput.fill("2");
        await page.locator(".cart-form button").first().click();
        const qty = await qtyInput.inputValue();
        if (qty !== "2") {
          throw new Error(`Không cập nhật được số lượng trong giỏ hàng, hiện là ${qty}.`);
        }
        return "Cập nhật số lượng trong giỏ hàng thành công.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_13
  results.push(
    await runCase("TC_UI_13", "Cập nhật số lượng 0 để xóa khỏi giỏ", async () => {
      const { context, page } = await newSession(browser);
      try {
        await addSpecificProductToCart(page);
        await page.goto(`${BASE_URL}/cart`, { waitUntil: "domcontentloaded" });
        const qtyInput = page.locator('.cart-form input[name="quantity"]').first();
        await qtyInput.evaluate((el) => {
          el.value = "0";
        });
        await page.locator(".cart-form button").first().click();
        const invalidCount = await page.locator("input:invalid").count();
        const emptyCount = await page.locator(".empty-state h2").count();
        if (invalidCount < 1 && emptyCount < 1) {
          throw new Error("Không thấy cơ chế chặn hoặc xử lý giá trị số lượng bằng 0.");
        }
        if (invalidCount >= 1) {
          return "Trình duyệt chặn nhập số lượng 0 theo ràng buộc min=1, hệ thống không cho gửi dữ liệu không hợp lệ.";
        }
        return "Cập nhật số lượng bằng 0 được hệ thống xử lý và giỏ hàng trở về trạng thái trống.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_14
  results.push(
    await runCase("TC_UI_14", "Xóa sản phẩm khỏi giỏ hàng", async () => {
      const { context, page } = await newSession(browser);
      try {
        await addSpecificProductToCart(page);
        await page.goto(`${BASE_URL}/cart`, { waitUntil: "domcontentloaded" });
        await page.getByRole("button", { name: "Xóa" }).first().click();
        const emptyText = await page.locator(".empty-state h2").textContent();
        if (!emptyText || !emptyText.includes("Giỏ hàng đang trống")) {
          throw new Error("Sản phẩm chưa được xóa khỏi giỏ hàng.");
        }
        return "Xóa sản phẩm khỏi giỏ hàng thành công.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_15
  results.push(
    await runCase("TC_UI_15", "Giỏ hàng trống hiển thị đúng", async () => {
      const { context, page } = await newSession(browser);
      try {
        await page.goto(`${BASE_URL}/cart`, { waitUntil: "domcontentloaded" });
        const emptyText = await page.locator(".empty-state h2").textContent();
        if (!emptyText || !emptyText.includes("Giỏ hàng đang trống")) {
          throw new Error("Giỏ hàng trống không hiển thị đúng nội dung.");
        }
        return "Trang giỏ hàng trống hiển thị đúng.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_16
  results.push(
    await runCase("TC_UI_16", "Thanh toán thành công", async () => {
      const { context, page } = await newSession(browser);
      try {
        await addSpecificProductToCart(page);
        await page.goto(`${BASE_URL}/checkout`, { waitUntil: "domcontentloaded" });
        await page.locator('input[name="customerName"]').fill("Nguyễn Văn A");
        await page.locator('input[name="customerEmail"]').fill("vana@example.com");
        await page.locator('input[name="customerPhone"]').fill("0901234567");
        await page.locator('textarea[name="shippingAddress"]').fill("123 Nguyễn Huệ, TP.HCM");
        await page.getByRole("button", { name: "Xác nhận đặt hàng" }).click();
        const flash = await page.locator(".flash-success").textContent();
        if (!flash || !flash.includes("Đặt hàng thành công")) {
          throw new Error("Không nhận được thông báo đặt hàng thành công.");
        }
        return "Luồng thanh toán hợp lệ hoạt động đúng.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_17
  results.push(
    await runCase("TC_UI_17", "Thanh toán thiếu dữ liệu", async () => {
      const { context, page } = await newSession(browser);
      try {
        await addSpecificProductToCart(page);
        await page.goto(`${BASE_URL}/checkout`, { waitUntil: "domcontentloaded" });
        await page.getByRole("button", { name: "Xác nhận đặt hàng" }).click();
        const invalidCount = await page.locator("input:invalid, textarea:invalid").count();
        if (invalidCount < 1) {
          throw new Error("Biểu mẫu không đánh dấu trường bắt buộc khi bỏ trống dữ liệu.");
        }
        return `Biểu mẫu chặn gửi khi thiếu dữ liệu, có ${invalidCount} trường không hợp lệ.`;
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_18
  results.push(
    await runCase("TC_UI_18", "Truy cập checkout khi giỏ hàng trống", async () => {
      const { context, page } = await newSession(browser);
      try {
        await page.goto(`${BASE_URL}/checkout`, { waitUntil: "domcontentloaded" });
        if (!page.url().includes("/products")) {
          throw new Error(`Không chuyển hướng về trang sản phẩm khi giỏ hàng trống. URL hiện tại: ${page.url()}`);
        }
        return "Hệ thống chuyển hướng đúng khi truy cập checkout với giỏ hàng trống.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_19
  results.push(
    await runCase("TC_UI_19", "Đăng nhập khách hàng thành công", async () => {
      const { context, page } = await newSession(browser);
      try {
        await login(page, "customer@atelier.local", "123456");
        const chip = await page.locator(".user-chip").textContent();
        if (!chip || !chip.includes("Nguyễn Minh Anh")) {
          throw new Error("Không thấy thông tin người dùng sau khi đăng nhập khách hàng.");
        }
        return `Đăng nhập khách hàng thành công, user chip: ${chip.trim()}.`;
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_20
  results.push(
    await runCase("TC_UI_20", "Đăng nhập thất bại với mật khẩu sai", async () => {
      const { context, page } = await newSession(browser);
      try {
        await login(page, "customer@atelier.local", "sai-mat-khau");
        if (!page.url().includes("/login")) {
          throw new Error("Trang không quay lại /login khi đăng nhập thất bại.");
        }
        const flash = await page.locator(".flash-error").textContent();
        if (!flash || !flash.includes("Email hoặc mật khẩu chưa đúng")) {
          throw new Error("Không hiển thị thông báo lỗi đăng nhập.");
        }
        return "Đăng nhập thất bại được xử lý đúng và có thông báo lỗi.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_21
  results.push(
    await runCase("TC_UI_21", "Đăng nhập thiếu dữ liệu", async () => {
      const { context, page } = await newSession(browser);
      try {
        await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
        await page.getByRole("button", { name: "Đăng nhập" }).click();
        const invalidCount = await page.locator('input:invalid').count();
        if (invalidCount < 1) {
          throw new Error("Form đăng nhập không chặn khi thiếu dữ liệu.");
        }
        return `Form đăng nhập chặn gửi khi bỏ trống dữ liệu, có ${invalidCount} trường không hợp lệ.`;
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_22
  results.push(
    await runCase("TC_UI_22", "Đăng nhập quản trị thành công", async () => {
      const { context, page } = await newSession(browser);
      try {
        await login(page, "admin@atelier.local", "admin123");
        await page.waitForURL(/\/admin$/);
        const heading = await page.locator("h1").textContent();
        if (!heading || !heading.includes("Tổng quan cửa hàng")) {
          throw new Error("Không vào được trang quản trị sau khi đăng nhập admin.");
        }
        return "Đăng nhập admin thành công và vào trang quản trị đúng.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_23
  results.push(
    await runCase("TC_UI_23", "Đăng xuất", async () => {
      const { context, page } = await newSession(browser);
      try {
        await login(page, "customer@atelier.local", "123456");
        await page.getByRole("button", { name: "Thoát" }).click();
        const accountLinkVisible = await page.getByRole("link", { name: "Tài khoản" }).isVisible();
        if (!accountLinkVisible) {
          throw new Error("Không quay về trạng thái chưa đăng nhập sau khi thoát.");
        }
        return "Đăng xuất thành công và giao diện trở lại trạng thái khách.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_24
  results.push(
    await runCase("TC_UI_24", "Chặn truy cập admin khi chưa có quyền", async () => {
      const { context, page } = await newSession(browser);
      try {
        await page.goto(`${BASE_URL}/admin`, { waitUntil: "domcontentloaded" });
        const heading = await page.locator(".empty-state h1").textContent();
        if (!heading || !heading.includes("chỉ dành cho quản trị viên")) {
          throw new Error("Không hiển thị đúng thông báo chặn truy cập admin.");
        }
        return "Trang admin chặn đúng với người chưa có quyền.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_25
  results.push(
    await runCase("TC_UI_25", "Logo điều hướng về trang chủ", async () => {
      const { context, page } = await newSession(browser);
      try {
        await page.goto(`${BASE_URL}/products`, { waitUntil: "domcontentloaded" });
        await page.locator(".brand-mark").click();
        await page.waitForURL(`${BASE_URL}/`);
        return "Bấm logo trên header điều hướng đúng về trang chủ.";
      } finally {
        await context.close();
      }
    })
  );

  // TC_UI_26
  results.push(
    await runCase("TC_UI_26", "Trang 404 hiển thị đúng", async () => {
      const { context, page } = await newSession(browser);
      try {
        const response = await page.goto(`${BASE_URL}/abcxyz`, { waitUntil: "domcontentloaded" });
        const heading = await page.locator(".empty-state h1").textContent();
        if (!heading || !heading.includes("Không tìm thấy trang")) {
          throw new Error("Trang 404 không hiển thị đúng nội dung.");
        }
        return `Trang 404 hoạt động đúng, status: ${response ? response.status() : "không xác định"}.`;
      } finally {
        await context.close();
      }
    })
  );

  await browser.close();
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), "utf8");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
