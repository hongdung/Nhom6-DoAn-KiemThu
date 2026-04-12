# KHUNG BAO CAO DO AN

## De tai

**Xay dung va kiem thu website ban thoi trang D&M Fashion & Apparel bang kiem thu thu cong va kiem thu tu dong voi Selenium WebDriver va Postman**

Thong tin demo:

- Link public: `https://dm-fashion-apparel.onrender.com`
- Link local: `http://localhost:3000`
- Tai khoan khach hang: `customer@atelier.local / 123456`
- Tai khoan quan tri: `admin@atelier.local / admin123`

---

## 1. Gioi thieu de tai, he thong va cong nghe kiem thu tu dong

### 1.1. Gioi thieu de tai

Trong boi canh thuong mai dien tu phat trien manh, viec dam bao chat luong cho website ban hang la yeu to quan trong giup nang cao trai nghiem nguoi dung va giam thieu loi trong qua trinh van hanh. Nhom lua chon xay dung he thong website ban thoi trang mang ten **D&M Fashion & Apparel** de nghien cuu va thuc hien kiem thu.

He thong duoc xay dung theo mo hinh website ban hang co giao dien web, ho tro cac chuc nang co ban nhu xem san pham, tim kiem, xem chi tiet, them vao gio hang, thanh toan, dang nhap va quan tri don gian. Day la mot de tai phu hop voi hoc phan **Kiem thu va Dam bao chat luong phan mem** vi he thong co du UI, co nhieu chuc nang va co the ap dung ca kiem thu thu cong lan kiem thu tu dong.

### 1.2. Ly do chon de tai

- Website thuong mai dien tu co nhieu luong nghiep vu de kiem thu.
- He thong co ca giao dien nguoi dung va API nen phu hop de ket hop Selenium va Postman.
- Chuc nang de hieu, de mo phong du lieu va de trinh bay trong bao cao, slide va demo.
- Co the trien khai public de nhom cung test tren cung mot moi truong.

### 1.3. Muc tieu de tai

- Xay dung mot website ban thoi trang co day du cac chuc nang co ban cua mot he thong ban hang.
- Ap dung kiem thu thu cong de xac nhan cac luong nghiep vu quan trong.
- Ap dung kiem thu tu dong cho UI bang Selenium WebDriver.
- Ap dung kiem thu tu dong cho API bang Postman.
- Tong hop ket qua kiem thu, danh gia loi, so sanh hieu qua va de xuat huong phat trien.

### 1.4. Mo ta he thong thuc nghiem

Ten he thong: **D&M Fashion & Apparel**

Chuc nang chinh:

- Xem trang chu va danh sach san pham.
- Tim kiem san pham theo tu khoa.
- Loc san pham theo danh muc.
- Xem chi tiet san pham va hinh anh gallery.
- Them san pham vao gio hang.
- Cap nhat so luong va xoa san pham trong gio hang.
- Thanh toan voi thong tin nguoi nhan.
- Dang nhap voi vai tro khach hang va quan tri vien.
- Xem trang quan tri va thong ke co ban.

### 1.5. Cong nghe xay dung he thong

- Backend: `Node.js`, `Express`
- View engine: `EJS`
- Giao dien: `HTML`, `CSS`, `JavaScript`
- Luu tru du lieu: `JSON file`
- Hosting demo: `Render`

### 1.6. Cong nghe kiem thu tu dong duoc lua chon

Nhom lua chon hai cong cu chinh:

- **Selenium WebDriver**: dung de kiem thu giao dien web, mo phong hanh vi nguoi dung that nhu mo trang, nhap du lieu, bam nut, chuyen trang va kiem tra ket qua hien thi.
- **Postman**: dung de kiem thu API, gui request den cac endpoint va xac nhan response thong qua status code, du lieu tra ve va script assertion.

Ly do lua chon:

- Pho bien, de tim tai lieu.
- Phu hop voi website co UI va API.
- De trinh bay trong hoc phan kiem thu.
- Co the lap lai, de luu minh chung va so sanh ket qua.

### 1.7. Moi truong demo

- Public URL: `https://dm-fashion-apparel.onrender.com`
- Local URL: `http://localhost:3000`
- Trinh duyet de test UI: `Google Chrome`
- Cong cu test API: `Postman`
- Cong cu test UI tu dong: `Selenium WebDriver`

---

## 2. Co so ly thuyet

### 2.1. Khai niem kiem thu phan mem

Kiem thu phan mem la qua trinh thuc hien cac hoat dong nham phat hien loi, xac minh va xac nhan rang phan mem dap ung dung yeu cau de ra. Muc tieu cua kiem thu khong chi la tim bug ma con giup danh gia chat luong tong the cua he thong.

### 2.2. Kiem thu tinh va kiem thu dong

- **Kiem thu tinh**: kiem tra tai lieu, ma nguon, yeu cau, thiet ke ma khong can chay chuong trinh.
- **Kiem thu dong**: chay he thong, nhap du lieu, theo doi ket qua va so sanh voi mong doi.

Trong de tai nay, kiem thu dong la trong tam chinh.

### 2.3. Kiem thu thu cong va kiem thu tu dong

- **Kiem thu thu cong**: tester tu thuc hien tung buoc test.
- **Kiem thu tu dong**: su dung cong cu de thuc hien test theo script da viet san.

So sanh:

- Thu cong phu hop voi giao dien, trai nghiem, test dot xuat.
- Tu dong phu hop voi cac luong lap lai, regression testing va cac kiem tra can do chinh xac cao.

### 2.4. Kiem thu chuc nang va phi chuc nang

- **Kiem thu chuc nang**: kiem tra he thong co thuc hien dung chuc nang khong.
- **Kiem thu phi chuc nang**: danh gia hieu nang, bao mat, kha nang su dung, kha nang tuong thich.

Pham vi de tai nay tap trung chu yeu vao kiem thu chuc nang, ket hop mot phan danh gia kha nang su dung va tinh on dinh.

### 2.5. Cac ky thuat thiet ke test case

Co the trinh bay cac ky thuat sau:

- **Phan vung tuong duong**: chia du lieu thanh cac nhom hop le va khong hop le.
- **Gia tri bien**: kiem tra tai cac nguong du lieu de de phat sinh loi.
- **Bang quyet dinh**: ap dung voi cac quy tac phuc tap.
- **State transition**: ap dung voi cac he thong co trang thai.

Trong de tai nay, co the ap dung:

- Gia tri bien cho so luong san pham trong gio hang.
- Phan vung tuong duong cho du lieu dang nhap va thanh toan.

### 2.6. Selenium WebDriver

Selenium WebDriver la cong cu ho tro tu dong dieu khien trinh duyet. Selenium cho phep script test mo website, tim phan tu giao dien, nhap du lieu, click, doi phan hoi va xac nhan ket qua.

Uu diem:

- Mo phong hanh vi nguoi dung that.
- Ho tro nhieu trinh duyet.
- Phu hop de kiem thu UI va regression.

Han che:

- De bi anh huong boi thay doi giao dien.
- Can viet script va xu ly cho doi trang/phan tu.

### 2.7. Postman

Postman la cong cu ho tro test API thong qua viec gui request HTTP va phan tich response. Nguoi dung co the viet script kiem tra status code, field du lieu va logic phan hoi.

Uu diem:

- De su dung.
- Phu hop voi REST API.
- Ho tro collection, environment, test script va export minh chung.

### 2.8. Vai tro cua dam bao chat luong

Dam bao chat luong khong chi la test ma con bao gom viec xay dung quy trinh, tai lieu hoa test case, xac dinh scope, kiem soat loi va tong hop ket qua. Vai tro QA/QC/Tester giup du an han che rui ro truoc khi dua san pham vao su dung.

---

## 3. Phan tich nghiep vu, quy trinh kiem thu va vai tro kiem thu

### 3.1. Mo ta nghiep vu he thong

He thong D&M Fashion & Apparel phuc vu quy trinh mua sam co ban tren website. Nguoi dung co the truy cap trang chu, tim san pham theo nhu cau, xem chi tiet, them vao gio hang va tien hanh thanh toan. Ben canh do, he thong co khu vuc quan tri giup quan sat tinh hinh san pham, don hang va doanh thu.

### 3.2. Doi tuong su dung

| Doi tuong | Mo ta | Chuc nang |
| --- | --- | --- |
| Khach vang lai | Nguoi chua dang nhap | Xem san pham, tim kiem, xem chi tiet, them gio hang, thanh toan |
| Khach hang | Nguoi da dang nhap | Thuc hien mua hang, theo doi tai khoan, tiep tuc gio hang |
| Quan tri vien | Nguoi co quyen admin | Xem thong ke, quan sat don hang, theo doi ton kho |

### 3.3. Use case chinh

| Ma use case | Ten use case | Actor | Mo ta ngan |
| --- | --- | --- | --- |
| UC01 | Xem danh sach san pham | Khach | Hien thi danh sach san pham tren website |
| UC02 | Tim kiem san pham | Khach | Tim san pham theo tu khoa |
| UC03 | Xem chi tiet san pham | Khach | Xem thong tin va hinh anh chi tiet |
| UC04 | Them vao gio hang | Khach | Them mot san pham vao gio hang |
| UC05 | Cap nhat gio hang | Khach | Sua so luong hoac xoa san pham |
| UC06 | Thanh toan | Khach | Nhap thong tin giao hang va tao don |
| UC07 | Dang nhap | Khach/Quan tri | Xac thuc tai khoan nguoi dung |
| UC08 | Xem trang quan tri | Quan tri | Xem thong ke san pham, don hang, doanh thu |

### 3.4. Luong nghiep vu chinh

Luong nghiep vu duoc chon de kiem thu:

`Xem san pham -> Xem chi tiet -> Them vao gio hang -> Cap nhat gio hang -> Thanh toan`

Co the chen hinh flowchart tai day. Neu chua ve, co the trinh bay bang van ban:

1. Nguoi dung truy cap danh sach san pham.
2. Nguoi dung chon mot san pham bat ky.
3. He thong hien thong tin chi tiet.
4. Nguoi dung them san pham vao gio hang.
5. Nguoi dung vao gio hang, cap nhat so luong.
6. Nguoi dung nhap thong tin giao hang.
7. He thong tao don hang va thong bao thanh cong.

### 3.5. Pham vi kiem thu

**Trong pham vi:**

- Dang nhap tai khoan
- Tim kiem san pham
- Xem danh sach san pham
- Xem chi tiet san pham
- Them, sua, xoa san pham trong gio hang
- Thanh toan
- Truy cap trang quan tri
- Kiem tra API lien quan den san pham, gio hang, dang nhap, don hang

**Ngoai pham vi:**

- Tich hop thanh toan that
- Dang ky tai khoan moi
- Gui email that
- Tich hop don vi van chuyen that

### 3.6. Quy trinh kiem thu duoc ap dung

Quy trinh kiem thu de tai co the trinh bay theo cac buoc:

1. Phan tich yeu cau va chuc nang.
2. Xac dinh scope test.
3. Thiet ke test case thu cong.
4. Chon cac luong co the tu dong hoa.
5. Thuc hien test bang tay.
6. Thuc hien test tu dong bang Selenium va Postman.
7. Ghi nhan ket qua va log loi.
8. Tong hop, danh gia va de xuat cai tien.

### 3.7. Vai tro kiem thu trong nhom

Bang sau co the dung de trinh bay vai tro theo yeu cau mon hoc:

| Thanh vien | Vai tro | Nhiem vu chinh |
| --- | --- | --- |
| Member 1 | Test Analyst | Chon he thong, mo ta nghiep vu, tong hop ket qua, xay dung tai lieu tong quan |
| Member 2 | Test Designer | Tong hop ly thuyet, thiet ke test case, xac dinh scope |
| Member 3 | Test Lead | Xay dung test plan, use case, flowchart, dieu phoi kiem thu |
| Member 4 | Tester | Thuc hien manual test, lap bug report, chup hinh minh chung |
| Member 5 | Automation Tester | Xay dung Postman collection va Selenium script |

Neu can ghi theo tinh hinh thuc te, co the them ghi chu: "Trong qua trinh thuc hien, mot so nhiem vu duoc gom lai va mot thanh vien chinh phu trach tong hop."

---

## 4. Ung dung cong nghe de kiem thu tu dong va thu cong doi voi he thong

### 4.1. Moi truong kiem thu

| Hang muc | Gia tri |
| --- | --- |
| He thong duoc kiem thu | D&M Fashion & Apparel |
| URL public | `https://dm-fashion-apparel.onrender.com` |
| URL local | `http://localhost:3000` |
| Cong cu manual test | Trinh duyet Chrome |
| Cong cu API test | Postman |
| Cong cu UI automation | Selenium WebDriver |
| Nen tang deploy | Render |

### 4.2. Danh sach chuc nang duoc kiem thu thu cong

- Dang nhap voi tai khoan hop le va khong hop le
- Tim kiem san pham co ket qua va khong co ket qua
- Xem chi tiet san pham
- Them san pham vao gio hang
- Cap nhat so luong san pham
- Xoa san pham khoi gio hang
- Thanh toan voi thong tin hop le
- Thanh toan khi de trong du lieu
- Dang nhap admin va truy cap trang quan tri

### 4.3. Danh sach API duoc kiem thu bang Postman

| Ma case | API | Muc tieu |
| --- | --- | --- |
| API01 | `POST /api/auth/login` | Kiem tra dang nhap hop le |
| API02 | `GET /api/products` | Kiem tra lay danh sach san pham |
| API03 | `GET /api/products/:id` | Kiem tra lay chi tiet san pham |
| API04 | `POST /api/cart` | Kiem tra them san pham vao gio hang |
| API05 | `PATCH /api/cart/:productId` | Kiem tra cap nhat so luong |
| API06 | `DELETE /api/cart/:productId` | Kiem tra xoa san pham |
| API07 | `POST /api/orders` | Kiem tra tao don hang |
| API08 | `GET /api/admin/overview` | Kiem tra phan quyen admin |

### 4.4. Danh sach luong UI duoc kiem thu bang Selenium

| Ma case | Ten case | Muc tieu |
| --- | --- | --- |
| UI01 | Dang nhap thanh cong | Kiem tra form dang nhap hoat dong dung |
| UI02 | Tim kiem san pham | Kiem tra chuc nang tim kiem tren giao dien |
| UI03 | Them vao gio hang | Kiem tra nguoi dung them san pham thanh cong |
| UI04 | Cap nhat gio hang | Kiem tra thay doi so luong trong gio hang |
| UI05 | Thanh toan | Kiem tra luong dat hang co ban |

### 4.5. Mau bang test case thu cong

| Test Case ID | Chuc nang | Buoc thuc hien | Du lieu dau vao | Ket qua mong doi | Ket qua thuc te | Pass/Fail |
| --- | --- | --- | --- | --- | --- | --- |
| TC_LOGIN_01 | Dang nhap hop le | 1. Mo trang dang nhap 2. Nhap email va mat khau 3. Bam Dang nhap | customer@atelier.local / 123456 | He thong dang nhap thanh cong | [Dien ket qua] | [Pass/Fail] |
| TC_SEARCH_01 | Tim kiem co ket qua | 1. Mo trang san pham 2. Nhap tu khoa `ao` 3. Bam tim kiem | ao | Danh sach san pham phu hop hien thi | [Dien ket qua] | [Pass/Fail] |
| TC_CART_01 | Them vao gio hang | 1. Mo trang chi tiet san pham 2. Them vao gio hang | San pham hop le | Gio hang tang so luong san pham | [Dien ket qua] | [Pass/Fail] |
| TC_CHECKOUT_01 | Thanh toan hop le | 1. Them san pham 2. Mo checkout 3. Dien du lieu hop le | Ho ten, email, SDT, dia chi | Don hang duoc tao thanh cong | [Dien ket qua] | [Pass/Fail] |

### 4.6. Mau bug report

| Bug ID | Tieu de loi | Mo ta | Buoc tai hien | Muc do | Ket qua mong doi | Ket qua thuc te | Trang thai |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BUG01 | [Dien tieu de] | [Dien mo ta] | [Dien cac buoc] | Medium/High/Low | [Expected] | [Actual] | Open/Closed |

### 4.7. Huong dan trinh bay Postman trong bao cao

Ban nen chup minh chung:

- Collection tong hop
- Request body
- Response body
- Tab test results

Mau mo ta 1 case:

**API_LOGIN_01 - Dang nhap thanh cong**

- Method: `POST`
- Endpoint: `/api/auth/login`
- Body:

```json
{
  "email": "customer@atelier.local",
  "password": "123456"
}
```

- Mong doi:
  - Status `200`
  - Tra ve `message`
  - Tra ve object `user`

### 4.8. Huong dan trinh bay Selenium trong bao cao

Ban nen trinh bay theo 4 y:

- Muc tieu test
- Cac buoc test tu dong
- Selector chinh duoc su dung
- Ket qua sau khi chay script

Mau mo ta:

**UI_LOGIN_01 - Dang nhap thanh cong**

1. Mo trinh duyet va truy cap trang dang nhap.
2. Nhap email va mat khau hop le.
3. Bam nut dang nhap.
4. Kiem tra he thong chuyen trang dung va hien thong bao thanh cong.

### 4.9. Goi y hinh anh minh chung can chup

- Trang chu cua he thong
- Trang danh sach san pham
- Trang chi tiet san pham
- Gio hang
- Thanh toan
- Dang nhap
- Trang admin
- Postman request/response
- Selenium run result
- Bug report mau

---

## 5. Danh gia ket qua sau khi kiem thu

### 5.1. Tong hop ket qua

| Hang muc | So luong |
| --- | --- |
| Tong so test case manual | [Dien] |
| So test case pass | [Dien] |
| So test case fail | [Dien] |
| Tong so API test case | [Dien] |
| Tong so UI automation test case | [Dien] |
| Tong so bug ghi nhan | [Dien] |

### 5.2. Phan loai loi

| Muc do | So luong | Ghi chu |
| --- | --- | --- |
| Critical | [Dien] | [Dien] |
| High | [Dien] | [Dien] |
| Medium | [Dien] | [Dien] |
| Low | [Dien] | [Dien] |

Neu khong phat hien loi nghiem trong, co the viet:

"Sau qua trinh kiem thu, he thong khong ghi nhan loi o muc Critical. Mot so truong hop can tiep tuc cai thien o giao dien va kha nang mo rong test tu dong."

### 5.3. Danh gia hieu qua cua kiem thu thu cong va tu dong

Co the viet theo huong:

- Kiem thu thu cong giup quan sat tong the giao dien, trai nghiem nguoi dung va cac truong hop bat ngo.
- Kiem thu API bang Postman cho phep xac nhan nhanh tinh dung dan cua cac endpoint.
- Kiem thu UI bang Selenium giup tu dong hoa cac luong lap lai, giam thoi gian regression.

### 5.4. So sanh manual test va automation test

| Tieu chi | Manual Test | Automation Test |
| --- | --- | --- |
| Toc do thuc hien | Cham hon | Nhanh hon sau khi co script |
| Muc do lap lai | Ton nhieu cong suc | Lap lai de dang |
| Kiem tra giao dien truc quan | Tot | Tot |
| Chi phi ban dau | Thap | Cao hon vi can viet script |
| Phu hop | Exploratory, UI review | Regression, API, luong on dinh |

### 5.5. Danh gia tong quan he thong

Co the viet mau:

"He thong D&M Fashion & Apparel dap ung duoc cac chuc nang co ban cua mot website ban hang. Cac luong chinh nhu xem san pham, tim kiem, them gio hang, thanh toan va dang nhap deu hoat dong on dinh. Viec ket hop manual test, Postman va Selenium giup qua trinh kiem thu co tinh bao quat hon va de dang tong hop minh chung."

---

## 6. Ket luan va dinh huong phat trien

### 6.1. Ket luan

De tai da thuc hien duoc cac noi dung chinh:

- Xay dung website ban thoi trang co giao dien va chuc nang co ban.
- Trien khai moi truong demo public.
- Thuc hien kiem thu thu cong cho cac luong nghiep vu quan trong.
- Ap dung Postman de kiem thu API.
- Ap dung Selenium de kiem thu UI.
- Tong hop ket qua va danh gia chat luong he thong.

### 6.2. Han che

- Chua tich hop co so du lieu thuc te.
- Chua mo rong bo Selenium cho nhieu luong phuc tap.
- Chua danh gia hieu nang va bao mat chuyen sau.
- Du lieu demo co the bi reset khi hosting free khoi dong lai.

### 6.3. Dinh huong phat trien

- Mo rong them chuc nang dang ky, wishlist, quan ly don hang chi tiet.
- Tich hop database va he thong xac thuc day du hon.
- Mo rong bo test tu dong cho nhieu luong regression.
- Tich hop CI/CD de tu dong chay test.
- Nang cap phan bao mat va toi uu hieu nang.

---

## 7. Tai lieu tham khao

Ban co the trinh bay theo chuan APA hoac IEEE. Goi y:

1. Render. *Web Services Documentation*. Truy cap tu: https://render.com/docs/web-services
2. Render. *Blueprint Specification*. Truy cap tu: https://render.com/docs/blueprint-spec
3. Selenium. *Selenium WebDriver Documentation*. Truy cap tu: https://www.selenium.dev/documentation/
4. Postman. *Postman Learning Center*. Truy cap tu: https://learning.postman.com/
5. Express.js. *Express Documentation*. Truy cap tu: https://expressjs.com/
6. Node.js. *Node.js Documentation*. Truy cap tu: https://nodejs.org/

Neu can them nguon anh:

7. Pexels. *Free stock photos*. Truy cap tu: https://www.pexels.com/

---

## 8. Phu luc

### 8.1. Danh sach file minh chung nen dua vao phu luc

- Source code he thong
- Anh chup giao dien cac trang chinh
- Bang test case manual
- Bug report
- Postman collection
- Screenshot Postman response
- Selenium source code
- Screenshot ket qua chay Selenium

### 8.2. Cac hinh minh hoa nen chen

- Hinh 1. Trang chu he thong
- Hinh 2. Trang danh sach san pham
- Hinh 3. Trang chi tiet san pham
- Hinh 4. Trang gio hang
- Hinh 5. Trang thanh toan
- Hinh 6. Trang dang nhap
- Hinh 7. Trang quan tri
- Hinh 8. Ket qua Postman
- Hinh 9. Ket qua Selenium

### 8.3. Phu luc bang phan cong cong viec

| STT | Thanh vien | Vai tro | Noi dung phu trach | Ghi chu |
| --- | --- | --- | --- | --- |
| 1 | Member 1 | Test Analyst | Chon de tai, mo ta he thong, tong hop ket qua, bao cao tong quan | [Dien ten] |
| 2 | Member 2 | Test Designer | Co so ly thuyet, thiet ke test case | [Dien ten] |
| 3 | Member 3 | Test Lead | Test plan, use case, flowchart, pham vi kiem thu | [Dien ten] |
| 4 | Member 4 | Tester | Manual test, log loi, chup anh minh chung | [Dien ten] |
| 5 | Member 5 | Automation Tester | Postman, Selenium, tong hop ket qua automation | [Dien ten] |

---

## Goi y cach bien khung nay thanh bao cao hoan chinh

1. Giu nguyen cau truc 8 muc theo yeu cau giang vien.
2. Dien ten thanh vien, lop, giang vien huong dan o trang bia.
3. Ve them use case va flowchart cho muc 3.
4. Dien so lieu test case, bug, ti le pass/fail o muc 5.
5. Chen hinh minh chung that vao muc 4 va 8.
6. Neu mot minh ban lam nhieu phan, van co the giu bang vai tro theo yeu cau mon hoc va ghi chu ro phan tong hop.

