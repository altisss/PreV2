// CSS architecture document for v1 Premium app
// @dunggnguyen 
// 09/06/2020 
--------------------------------------------------------------------------------------------

### CSS Architecture trên app Premium được kế thừa từ phiên bản web. Tái cấu trúc lại 
### theo một số nguyên tắc sau. (Dựa trên ý tưởng ITCSS + BEM)
- Sử dụng scss
- Đặc biệt chú ý tới scope khi viết css để tránh xung đột, ghi đè các phần với nhau. 
- Chú ý về thứ tự import các file (css import sau sẽ ghi đè css trước đó nếu bị trùng)
- Hạn chế overwrite class, element, animation,... của các framwork. Nếu override thì viết vào thư mục 
src/style/override__library.
- Khuyến khích sử dụng quy tắc BEM (block-element-modify) để đặt tên class, id (rất dễ chỉ mất tầm 5p để học)
- Hạn chế sử dụng !important
- Đối với các thành phần sử dụng toàn cục, thống nhất trên các màn hình khuyến khích developer
viết ra một file riêng ở thư mục src/style/element. Có thể ghi đè khi cần. (Ví dụ: Button, input, datepicker, ...)
- Màu sắc luôn luôn sử dụng biến. (Các biến sẽ được định nghĩa ở file theme.scss, sử dụng: color: var(--tên biến))
- Luôn sử dụng đơn vị "rem" đối với font-size
- Đối với mỗi Component đủ lớn sẽ viết 1 file scss riêng cho component đó và
sử dụng class hoặc id để bọc css lại như ví dụ phía dưới. (Để bảo đảm scope của css)
- Thư mục override__library: nơi dùng để viết các custom hoặc ghi đè các thư viện
- Sử dụng _mixin (tương tự function) để tái sử dụng các animation (được viết trong thư mục src/style/tools)

### Ví dụ viết một component hoặc layout mới: 
.header__section {
    ...
    bacground: var(--main__background__color);
    font-size: 1rem;
    
    .header__logo {
        with: 200px;
        ...

        &:hover {
            background-color: ...;
            ...
        }
    }
}

## Introduce: ITCSS
................
### Setting – Được sử dụng với các bộ tiền sử lí và chứa font, định nghĩa các color, …
### Tools – Chứa mixins và functions để có thể tái sử dụng ở nhiều nơi. Và quan trọng là không có bất kì css nào được xuất ra ở lớp này và lớp trên.
### Generic – Đặt lại hoặc chuẩn hoá styles, định nghĩa box-sizing,… Đây là lớp đầu tiên tạo ra CSS thực tế.
### Elements – style cho các element của HTLM (như h1, span, image, a, …). Chúng đi kèm với default style của trình duyệt nên chúng ta có thể định nghĩa lại chúng ở lớp này.
### Objects – class-based selector để định nghĩa undecorated design patterns. Ví dụ như media object từ OOCSS.
### Components – Chỉ định đến từng component UI cụ thể. Đây là nơi chúng ta dành phần lớn thời gian để làm việc và các component UI của tôi thường bao gồm cả Object và Component.
### Utilities - Tiện ích và helper classes với khả năng ghi đè bất cứ gì trước đó trong mô hình tam giác của chúng ta.

---------------------------------------------------------------------------------------------

### Version tiếp theo khuyến khích áp dụng kiến trúc ITCSS + BEM.
Link tham khảo: https://cheesecakelabs.com/blog/css-architecture-reactjs/
Tiếng Việt: https://topdev.vn/blog/kien-truc-code-css-voi-kha-nang-mo-rong-va-bao-tri/

---------------------------------------------------------------------------------------------