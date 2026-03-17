import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, } from "lucide-react";
import { useState } from "react";
import SigninModal from "./Modals/SigninModal";

const StartYourBusinessContent = ({ onNext }) => {
  const navigate = useNavigate();
  const [showSigninModal, setShowSigninModal] = useState(false);
  const cardVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.02,
      y: -5,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  // const iconVariants = {
  //   rest: { rotate: 0 },
  //   hover: {
  //     rotate: 360,
  //     transition: { duration: 0.8, ease: "easeInOut" },
  //   },
  // };

  return (
    <>
      <SigninModal isOpen={showSigninModal} onClose={() => setShowSigninModal(false)} />
      <motion.div
        className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <div className="flex flex-col lg:flex-row min-h-[800px]">
          {/* Left Side - Illustration */}
          <div className="lg:w-1/2 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 relative flex items-center justify-center p-8">
            <motion.div
              className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-gray-800 -rotate-12">
                  images
                </h3>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side - Content */}
          <div
            className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-cover bg-center bg-no-repeat rounded-2xl relative"
            style={{ backgroundImage: "url('/Images/hero-bg.webp')" }}
          >
            {/* Logo at top-right */}
            <img
              src="/Images/logo.webp"
              alt="Logo"
              className="absolute top-6 right-6 w-28 h-auto"
            />

            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-6">
                {/* <Sparkles className="w-6 h-6 text-yellow-500" />
        <span className="text-xl font-bold text-gray-800">Bizpole</span>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Prime
        </span> */}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Let's talk business!
              </h1>
              <p className="text-gray-600 text-lg">
                To begin this journey, tell us what type of account you'd be
                opening.
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-4 mb-8">
              {/* Start a New Company */}
              <motion.button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all duration-300 text-left relative overflow-hidden group"
                variants={cardVariants}
                initial="rest"
                whileHover="hover"
                onClick={onNext}
              >
                <div className="flex items-center justify-between relative z-10 cursor-pointer">
                  <div>
                    <div className="font-bold text-lg mb-1 ">
                      Start a New Company
                    </div>
                    <div className="text-sm opacity-80">
                      Perfect for entrepreneurs starting their first business
                      venture
                    </div>
                  </div>
                  {/* <motion.div variants={iconVariants} className="ml-4">
            <ArrowRight className="w-6 h-6" />
          </motion.div> */}
                </div>
              </motion.button>

              {/* Onboard Existing Company */}
              <motion.button
                className="w-full bg-yellow-400 cursor-pointer hover:bg-yellow-500 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all duration-300 text-left relative overflow-hidden group"
                variants={cardVariants}
                initial="rest"
                whileHover="hover"
                onClick={() => navigate('/existing-companies')}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <div className="font-bold text-lg mb-1">
                      Onboard Existing Company
                    </div>
                    <div className="text-sm opacity-80">
                      Own or belong to a company, this is for you
                    </div>
                  </div>
                  {/* <motion.div variants={iconVariants} className="ml-4">
            <ArrowRight className="w-6 h-6" />
          </motion.div> */}
                </div>
              </motion.button>
            </div>

            {/* Sign In Section */}
            <div className="bg-gray-100 rounded-xl p-6 text-gray-800 text-center mt-8">
              <span className="font-semibold text-lg">Do you already have an account?</span>
              <button
                className="ml-3 px-6 py-2 bg-yellow-400 rounded-full font-semibold text-gray-900 hover:bg-yellow-500 transition"
                onClick={() => setShowSigninModal(true)}
              >
                Sign In
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </>
  );
};

export default StartYourBusinessContent;
