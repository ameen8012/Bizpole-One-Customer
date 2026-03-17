import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import ComplianceDashboard from '../components/ComplianceDashboard';
import HeaderStats from '../components/HeaderStats';
import UpcomingEvents from '../components/UpcomingEvents';
import ServicesTable from '../components/ServicesTable';
import ChatSection from '../components/ChatSection';
import TodayTask from '../components/TodayTask';
import AdComponent from '../components/AdComponent';

const BizpoleOne = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <HeaderStats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <ComplianceDashboard />

          {/* Upcoming Events + Teamwork Card */}
          <div className="w-full flex flex-col md:flex-row bg-white rounded-2xl p-4 md:p-6 gap-6 items-stretch">
            {/* Left: Upcoming Events */}
            <div className="flex-1 w-full">
              <UpcomingEvents />
            </div>

            {/* Right: AdComponent */}
            <div className="w-full md:w-[400px] rounded-2xl p-0 md:p-4 text-white flex flex-col justify-between">
              <AdComponent />
            </div>
          </div>

          {/* Services */}
          <ServicesTable />
        </div>

        {/* Right Column */}
        <div className="space-y-4 md:space-y-6 mt-6 lg:mt-0">
          <TodayTask />
          <ChatSection />
        </div>
      </div>
    </div>
  );
};

export default BizpoleOne;
