BEGIN;

INSERT INTO icons(url, description, user_id, created_at, updated_at)
VALUES
    ('icons/system-food.png', 'อาหาร ของกิน ข้าว มื้อเช้า มื้อเที่ยง มื้อเย็น หิว food meal eat rice', NULL, now(), now()),
    ('icons/system-burger.png', 'เบอร์เกอร์ ฟาสต์ฟู้ด ขนมปัง อเมริกัน จานด่วน burger fastfood bread', NULL, now(), now()),
    ('icons/system-noodle.png', 'ก๋วยเตี๋ยว เส้น บะหมี่ ราเมง อาหารญี่ปุ่น noodle ramen soup', NULL, now(), now()),
    ('icons/system-coffee.png', 'กาแฟ คาเฟ่ เครื่องดื่ม น้ำหวาน ชานม สตาร์บัค อเมซอน coffee cafe drink tea', NULL, now(), now()),
    ('icons/system-beer.png', 'เบียร์ เหล้า แอลกอฮอล์ ปาร์ตี้ สังสรรค์ บาร์ beer alcohol party drink bar', NULL, now(), now()),
    ('icons/system-dessert.png', 'ขนม หวาน เค้ก ไอศครีม เบเกอรี่ ของว่าง dessert sweet cake bakery icecream', NULL, now(), now()),

    ('icons/system-car.png', 'รถยนต์ เดินทาง ค่าน้ำมัน ทางด่วน ซ่อมรถ ล้างรถ car transport gas drive', NULL, now(), now()),
    ('icons/system-bus.png', 'รถเมล์ รถบัส ขนส่งสาธารณะ ตั๋วรถ bus public transport ticket', NULL, now(), now()),
    ('icons/system-train.png', 'รถไฟ BTS MRT รถไฟฟ้า ตั๋วรถไฟ train subway transport', NULL, now(), now()),
    ('icons/system-taxi.png', 'แท็กซี่ แกร็บ เรียกรถ ค่ารถ taxi grab transport cab', NULL, now(), now()),
    ('icons/system-plane.png', 'เครื่องบิน ท่องเที่ยว ตั๋วเครื่องบิน ต่างประเทศ สนามบิน airplane flight travel trip', NULL, now(), now()),

    ('icons/system-home.png', 'บ้าน ที่พัก ค่าเช่า ผ่อนบ้าน คอนโด แต่งบ้าน house home rent condo', NULL, now(), now()),
    ('icons/system-water.png', 'ค่าน้ำ ประปา บิล จ่ายบิล water bill utility', NULL, now(), now()),
    ('icons/system-electric.png', 'ค่าไฟ ไฟฟ้า บิล แอร์ พัดลม electric bill power utility', NULL, now(), now()),
    ('icons/system-wifi.png', 'เน็ต ค่าโทรศัพท์ มือถือ อินเทอร์เน็ต เติมเงิน wifi internet phone mobile', NULL, now(), now()),
    ('icons/system-maintenance.png', 'ซ่อมแซม ค่าแรง ช่าง อุปกรณ์ เครื่องมือ repair fix tool maintenance', NULL, now(), now()),

    ('icons/system-shopping.png', 'ช้อปปิ้ง ซื้อของ ห้าง จ่ายตลาด ตลาดนัด shopping buy mall market', NULL, now(), now()),
    ('icons/system-clothes.png', 'เสื้อผ้า แฟชั่น แต่งตัว กางเกง กระเป๋า รองเท้า clothes fashion wear', NULL, now(), now()),
    ('icons/system-makeup.png', 'เครื่องสำอาง ความงาม สวยงาม สกินแคร์ makeup beauty skincare cosmetic', NULL, now(), now()),
    ('icons/system-device.png', 'ไอที คอมพิวเตอร์ มือถือ แกดเจ็ต อุปกรณ์อิเล็กทรอนิกส์ device gadget computer phone', NULL, now(), now()),

    ('icons/system-hospital.png', 'โรงพยาบาล หาหมอ เจ็บป่วย รักษา hospital doctor sick medical', NULL, now(), now()),
    ('icons/system-pill.png', 'ยา ค่ายา วิตามิน อาหารเสริม ร้านขายยา medicine pill drug pharmacy', NULL, now(), now()),
    ('icons/system-gym.png', 'ออกกำลังกาย ฟิตเนส ยิม กีฬา สุขภาพ gym fitness sport exercise health', NULL, now(), now()),

    ('icons/system-movie.png', 'ดูหนัง ภาพยนตร์ Netflix โรงหนัง ตั๋วหนัง movie cinema film netflix', NULL, now(), now()),
    ('icons/system-game.png', 'เกม เติมเกม ของเล่น สนุก game toy play fun', NULL, now(), now()),
    ('icons/system-pet.png', 'สัตว์เลี้ยง หมา แมว อาหารเม็ด pet dog cat animal food', NULL, now(), now()),
    ('icons/system-book.png', 'หนังสือ การเรียน คอร์สเรียน สมุด เครื่องเขียน book study learn education', NULL, now(), now()),
    ('icons/system-gift.png', 'ของขวัญ งานแต่ง งานบวช ใส่ซอง gift present wedding', NULL, now(), now()),

    ('icons/system-salary.png', 'เงินเดือน รายรับ เงินเข้า โบนัส จ่ายเงิน salary income money bonus pay', NULL, now(), now()),
    ('icons/system-wallet.png', 'กระเป๋าตังค์ เงินสด ถอนเงิน เก็บเงิน wallet cash money save', NULL, now(), now()),
    ('icons/system-bank.png', 'ธนาคาร ดอกเบี้ย ฝากเงิน โอนเงิน bank interest transfer', NULL, now(), now()),
    ('icons/system-invest.png', 'ลงทุน หุ้น กองทุน คริปโต กำไร ขาดทุน invest stock crypto trade', NULL, now(), now()),
    ('icons/system-general.png', 'อื่นๆ ทั่วไป จิปาถะ ไม่ระบุ other general misc', NULL, now(), now())
ON CONFLICT (url) DO NOTHING;

INSERT INTO categories (name, type, user_id, icon_id, created_at, updated_at, deleted_at)
VALUES 
    ('อาหาร', 'EXPENSE', null, (SELECT id FROM icons WHERE url = 'icons/system-food.png' LIMIT 1), now(), now(), null),
    ('เดินทาง', 'EXPENSE', null, (SELECT id FROM icons WHERE url = 'icons/system-car.png' LIMIT 1), now(), now(), null),
    ('ที่พัก/ของใช้', 'EXPENSE', null, (SELECT id FROM icons WHERE url = 'icons/system-home.png' LIMIT 1), now(), now(), null),
    ('น้ำ/ไฟ/เน็ต', 'EXPENSE', null, (SELECT id FROM icons WHERE url = 'icons/system-electric.png' LIMIT 1), now(), now(), null),
    ('ช้อปปิ้ง', 'EXPENSE', null, (SELECT id FROM icons WHERE url = 'icons/system-shopping.png' LIMIT 1), now(), now(), null),
    ('บันเทิง', 'EXPENSE', null, (SELECT id FROM icons WHERE url = 'icons/system-movie.png' LIMIT 1), now(), now(), null),
    ('สุขภาพ', 'EXPENSE', null, (SELECT id FROM icons WHERE url = 'icons/system-hospital.png' LIMIT 1), now(), now(), null),

    ('เงินเดือน', 'INCOME', null, (SELECT id FROM icons WHERE url = 'icons/system-salary.png' LIMIT 1), now(), now(), null),
    ('โบนัส', 'INCOME', null, (SELECT id FROM icons WHERE url = 'icons/system-gift.png' LIMIT 1), now(), now(), null),
    ('งานเสริม/ค้าขาย', 'INCOME', null, (SELECT id FROM icons WHERE url = 'icons/system-device.png' LIMIT 1), now(), now(), null),
    ('การลงทุน/ดอกเบี้ย', 'INCOME', null, (SELECT id FROM icons WHERE url = 'icons/system-invest.png' LIMIT 1), now(), now(), null),
    ('โชคลาภ/ของขวัญ', 'INCOME', null, (SELECT id FROM icons WHERE url = 'icons/system-gift.png' LIMIT 1), now(), now(), null),
    ('เงินคืน', 'INCOME', null, (SELECT id FROM icons WHERE url = 'icons/system-wallet.png' LIMIT 1), now(), now(), null);

COMMIT;