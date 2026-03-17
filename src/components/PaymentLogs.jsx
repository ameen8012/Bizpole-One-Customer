// filepath: /my-react-app/my-react-app/src/components/PaymentLogs.jsx
import { motion } from "framer-motion";
import {
  FaApplePay,
  FaGooglePay,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmazonPay,
  FaStripe,
} from "react-icons/fa";
import { SiKlarna } from "react-icons/si";

const PaymentLogs = () => {
  const paymentItems = [
    { icon: <SiKlarna className="text-pink-500" />, key: "klarna" },
    { icon: <FaApplePay className="text-black" />, key: "apple" },
    { icon: <FaCcMastercard className="text-red-500" />, key: "mastercard" },
    { icon: <FaCcVisa className="text-blue-600" />, key: "visa" },
    { icon: <FaCcAmazonPay className="text-yellow-600" />, key: "amazon" },
    { icon: <FaGooglePay className="text-green-500" />, key: "google" },
    { icon: <FaStripe className="text-indigo-500" />, key: "stripe" },
    {
      icon: (
        <span className="text-sm sm:text-base font-semibold px-3 py-1 rounded bg-blue-100 text-blue-600">
          Affirm
        </span>
      ),
      key: "affirm",
    },
    {
      icon: (
        <span className="text-sm sm:text-base font-semibold px-3 py-1 rounded bg-gray-200 text-gray-800">
          Paysafe
        </span>
      ),
      key: "paysafe",
    },
  ];

  // Repeat many times to simulate infinite loop
  const repeatCount = 10; // increase for smoother loop
  const marqueeItems = Array.from({ length: repeatCount }, () => paymentItems).flat();

  return (
    <div className="w-full overflow-hidden py-6">
      <motion.div
        className="flex gap-10 sm:gap-14 md:gap-20"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          duration: 50, // Adjust speed
          ease: "linear",
        }}
      >
        {marqueeItems.map(({ icon, key }, i) => (
          <motion.div
            key={key + i}
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="cursor-pointer text-3xl sm:text-4xl md:text-6xl flex items-center"
          >
            {icon}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PaymentLogs;
