import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@bilimportal.tm" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@bilimportal.tm",
      password: adminPassword,
      role: "admin",
    },
  });
  console.log("Admin:", admin.email);

  // Create test user
  const userPassword = await bcrypt.hash("user1234", 10);
  await prisma.user.upsert({
    where: { email: "okuwcy@bilimportal.tm" },
    update: {},
    create: {
      name: "Okuwçy Mysal",
      email: "okuwcy@bilimportal.tm",
      password: userPassword,
      role: "user",
    },
  });

  // Categories
  const categories = ["Programmirleme", "Matematika", "Fizika", "Diller", "Dizaýn"];
  const createdCategories: { id: string; name: string }[] = [];
  for (const name of categories) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    createdCategories.push(cat);
  }

  // Sample courses with lessons
  const coursesData = [
    {
      title: "JavaScript Esaslary",
      description: "JavaScript programmirleme dilini noldan öwreniň. Üýtgeýjiler, funksiýalar, obýektler we has köp zatlary ele alyň.",
      categoryId: createdCategories[0].id,
      isPublished: true,
      lessons: [
        { title: "JavaScript näme?", content: "JavaScript brauzer we server tarapynda işläp bilýän programmirleme dilidir. Web sahypalaryna interaktiw aýratynlyklary goşmak üçin ulanylýar.", type: "text", order: 1, isPublished: true },
        { title: "Üýtgeýjiler: var, let, const", content: "JavaScript-de üýtgeýjileri yglan etmek üçin üç usul bar: var, let we const. let we const häzirki standart bolup durýar.", type: "text", order: 2, isPublished: true },
        { title: "Funksiýalar", content: "Funksiýalar gaýtadan ulanylyp bilinýän kod bloklarydyr. function açar sözi ýa-da ok funksiýasy görnüşinde döredilip bilner.", type: "text", order: 3, isPublished: true },
        { title: "JavaScript wideo sapak", content: "Bu wideoda JavaScript esaslaryny görkezýäris.", type: "video", videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk", order: 4, isPublished: true },
      ],
    },
    {
      title: "Python bilen Başlaň",
      description: "Python programmirleme diline giriş. Sözlemler, sanaw, sözlük we funksiýalar.",
      categoryId: createdCategories[0].id,
      isPublished: true,
      lessons: [
        { title: "Python gurnalyşy", content: "Python-y python.org sahypasyndan ýükläp gurnaň. VS Code ýa-da PyCharm redaktor hökmünde ulanylyp bilner.", type: "text", order: 1, isPublished: true },
        { title: "Hello World!", content: "print('Salam Dünýä!') — ilkinji Python programmasyňyz. print() funksiýasy ekrana tekst çykarmak üçin ulanylýar.", type: "text", order: 2, isPublished: true },
        { title: "Sanawlar we Sözlükler", content: "Sanaw: my_list = [1, 2, 3]\nSözlük: my_dict = {'at': 'Alp', 'ýaş': 20}\nBu iki gurluş iň köp ulanylýan Python maglumat görnüşleridir.", type: "text", order: 3, isPublished: true },
      ],
    },
    {
      title: "Web Dizaýn Esaslary",
      description: "HTML we CSS bilen owadan we jogapkär web sahypalaryny döredip öwreniň.",
      categoryId: createdCategories[4].id,
      isPublished: true,
      lessons: [
        { title: "HTML gurluşy", content: "Her HTML sahypasy <!DOCTYPE html>, <html>, <head> we <body> teglerinden ybarat.", type: "text", order: 1, isPublished: true },
        { title: "CSS stiller", content: "CSS web sahypasynyň görünüşini kesgitleýär. Reňk, ölçeg, ýer, şrift we has köp zadyň üstünde işleýär.", type: "text", order: 2, isPublished: true },
        { title: "Flexbox", content: "Flexbox CSS-iň iň güýçli tertipleme ulgamlaryndan biridir. display: flex; bilen başlaýarys.", type: "text", order: 3, isPublished: true },
      ],
    },
    {
      title: "Algebra Esaslary",
      description: "Matematikanyň esasy düşünjelerini aýdyň we düşnükli usulda öwreniň.",
      categoryId: createdCategories[1].id,
      isPublished: true,
      lessons: [
        { title: "San ulgamlary", content: "Tebigy sanlar, bütin sanlar, onluk sanlar we köküsyz sanlar barada esasy düşünjeler.", type: "text", order: 1, isPublished: true },
        { title: "Deňlemeler", content: "Çyzykly deňleme: ax + b = 0 görnüşindäki deňlemelerdir. x = -b/a formula bilen çözülýär.", type: "text", order: 2, isPublished: true },
      ],
    },
    {
      title: "Iňlis Dili A1",
      description: "Iňlis dilini noldan başlap öwreniň. Gündelik gepleşik, esasy sözleýiş we gramatika.",
      categoryId: createdCategories[3].id,
      isPublished: true,
      lessons: [
        { title: "Salamy nädip aýtmaly?", content: "Hello! Hi! Good morning! Good afternoon! Good evening! — bularyň hemmesi iňlisçe salam bermek usullarydyr.", type: "text", order: 1, isPublished: true },
        { title: "Özüni tanatmak", content: "My name is ... | I am from ... | I am ... years old. Bu jümleleri öwreniň.", type: "text", order: 2, isPublished: true },
        { title: "Sanlary öwreniň", content: "One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten — 1-den 10-a çenli iňlisçe sanlar.", type: "text", order: 3, isPublished: true },
      ],
    },
  ];

  for (const courseData of coursesData) {
    const { lessons, ...courseInfo } = courseData;
    const course = await prisma.course.create({ data: courseInfo });
    for (const lesson of lessons) {
      await prisma.lesson.create({ data: { ...lesson, courseId: course.id } });
    }
    console.log("Course created:", course.title);
  }

  console.log("\n✅ Seed complete!");
  console.log("Admin login: admin@bilimportal.tm / admin123");
  console.log("User login:  okuwcy@bilimportal.tm / user1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
