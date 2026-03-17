import { BarChart2, DollarSign, CheckCircle } from "lucide-react";

const HeaderStats = () => {
  const stats = [
    {
      id: 1,
      icon: BarChart2,
      label: "Next Payment Due",
      value: "5600",
    },
    {
      id: 2,
      icon: DollarSign,
      label: "Total Services Active",
      value: "12",
    },
    {
      id: 3,
      icon: CheckCircle,
      label: "Tasks Completed This Week",
      value: "60",
    },
  ];

  return (
    <header className="w-full px-6 py-6 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="group flex items-center gap-4 bg-white shadow-md rounded-2xl p-4 hover:shadow-lg transition cursor-pointer"
            >
              {/* Icon Circle */}
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 
                           transition group-hover:bg-yellow-500"
              >
                <Icon className="w-6 h-6 text-yellow-500 transition group-hover:text-white" />
              </div>

              {/* Text */}
              <div>
                <p className="text-sm font-semibold text-gray-500 pb-3">{item.label}</p>
                <p className="text-2xl font-bold text-indigo-900">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </header>
  );
};

export default HeaderStats;
