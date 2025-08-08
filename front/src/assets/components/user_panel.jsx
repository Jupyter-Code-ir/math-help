import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function UserPanel(){
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 bg-blue-950/20 backdrop-blur-sm rounded-t-4xl shadow-black/20">
      <div className="flex items-center">
        <img src="https://via.placeholder.com/40" alt="Profile" className="w-10 h-10 rounded-full shadow-sm" />
        <span className="ml-3 text-white text-lg font-medium text-shadow-sm">محمد مهدی وافری</span>
      </div>
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 right-4 bg-blue-950/20 backdrop-blur-sm rounded-lg shadow-lg p-2 z-10"
          >
            <ul className="text-white">
              {['داشبورد', 'دوره‌های من', 'پشتیبانی', 'تنظیمات', 'خروج'].map((item) => (
                <li key={item}>
                  <button
                    className="w-full text-right p-2 hover:bg-blue-950/30 rounded transition-all duration-300"
                    onClick={() => console.log(`${item} clicked`)}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Card = ({ title, value, buttonText }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="p-4 bg-blue-950/20 backdrop-blur-sm rounded-lg shadow-lg text-white flex flex-col items-center"
  >
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-2xl my-2">{value}</p>
    {buttonText && (
      <button className="mt-2 px-4 py-2 bg-blue-700 rounded-full hover:bg-blue-600 transition-all duration-300 shadow-sm">
        {buttonText}
      </button>
    )}
  </motion.div>
);

const Announcement = ({ title, creator, date, buttonText }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="p-4 bg-blue-950/20 backdrop-blur-sm rounded-lg shadow-lg text-white"
  >
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-sm mt-1">ایجاد شده توسط {creator} | {date}</p>
    <button className="mt-3 px-4 py-2 bg-blue-700 rounded-full hover:bg-blue-600 transition-all duration-300 shadow-sm">
      {buttonText}
    </button>
  </motion.div>
);

const DashboardContent = () => (
  <div className="p-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <h1 className="text-2xl text-white font-bold">سلام محمد مهدی وافری</h1>
      <p className="text-white mt-1">شما 0 رویدادهای جدید دارید</p>
      <button className="text-blue-300 hover:underline mt-2">مشاهده همه رویدادها</button>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <Card title="موجودی حساب" value="0" buttonText="افزایش موجودی" />
      <Card title="دوره‌های خریداری شده" value="4" />
      <Card title="جلسات" value="0" />
      <Card title="پیام‌های پشتیبانی" value="0" />
      <Card title="نظرات" value="0" />
    </div>

    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '0%' }} />
      </div>
      <p className="text-white mt-2 text-sm">نشان بعدی: تعریف نشده</p>
    </motion.div>

    <div>
      <h2 className="text-xl text-white font-semibold mb-4">تابلو اعلانات</h2>
      <div className="space-y-4">
        <Announcement
          title="مهلت ارسال پروژه"
          creator="Staff"
          date="1403/05/6 | 12:42"
          buttonText="اطلاعات بیشتر"
        />
        <Announcement
          title="تبریک سال نو و عید نوروز"
          creator="Staff"
          date="1403/01/1 | 07:05"
          buttonText="اطلاعات بیشتر"
        />
        <Announcement
          title="تعطیلی فعالیت‌های آموزشی تا پایان تعطیلات نوروز"
          creator="Staff"
          date="1402/12/20 | 18:04"
          buttonText="اطلاعات بیشتر"
        />
      </div>
    </div>
  </div>
);

