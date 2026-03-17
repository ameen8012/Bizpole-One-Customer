// src/pages/BizpoleOneOverview.jsx
import { useEffect } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  TrendingUp,
  Users,
  CreditCard,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  CalendarCheck,
  Bell,
  Search,
  Filter,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const statCards = [
  {
    label: "Revenue (MTD)",
    value: "₹ 3.42L",
    delta: "+12.4%",
    up: true,
    icon: CreditCard,
  },
  {
    label: "Active Users",
    value: "12,583",
    delta: "+3.1%",
    up: true,
    icon: Users,
  },
  {
    label: "New Subs",
    value: "1,248",
    delta: "-0.8%",
    up: false,
    icon: TrendingUp,
  },
  {
    label: "Tasks Done",
    value: "342",
    delta: "+6.9%",
    up: true,
    icon: CheckCircle2,
  },
];

const revenueData = [
  { m: "Jan", v: 22 },
  { m: "Feb", v: 26 },
  { m: "Mar", v: 24 },
  { m: "Apr", v: 31 },
  { m: "May", v: 28 },
  { m: "Jun", v: 35 },
  { m: "Jul", v: 33 },
  { m: "Aug", v: 41 },
];

const serviceMix = [
  { name: "GST", value: 28 },
  { name: "Web Dev", value: 35 },
  { name: "UX / UI", value: 18 },
  { name: "Compliance", value: 19 },
];

const teamProgress = [
  { name: "Aisha", tasks: 82 },
  { name: "Vikram", tasks: 76 },
  { name: "Noah", tasks: 64 },
  { name: "Lina", tasks: 58 },
  { name: "Ravi", tasks: 53 },
];

const COLORS = ["#FACC15", "#A3A3A3", "#1F2937", "#FDE68A"]; // yellow + gray family

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const Card = ({ children, className = "", ...rest }) => (
  <motion.div
    variants={fadeUp}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true, amount: 0.2 }}
    className={`rounded-2xl border border-gray-200/60 bg-white shadow-sm ${className}`}
    {...rest}
  >
    {children}
  </motion.div>
);

const SectionTitle = ({ icon: Icon, title, action }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      {Icon && (
        <div className="p-2 rounded-xl bg-yellow-100 text-gray-900">
          <Icon size={18} />
        </div>
      )}
      <h3 className="text-gray-900 font-semibold">{title}</h3>
    </div>
    {action}
  </div>
);

export default function BizpoleOneOverview() {
  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: "ease-out" });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Top bar / filters */}
      <motion.div
        {...fadeUp}
        className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <span className="px-2 py-1 text-xs rounded-lg bg-yellow-100 text-gray-900">
            Live
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              className="w-48 bg-transparent text-sm outline-none placeholder:text-gray-400"
              placeholder="Search reports…"
            />
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-100">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-yellow-400 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-300">
            <Download size={16} /> Export
          </button>
          <button className="ml-1 grid size-10 place-content-center rounded-xl border border-gray-200 bg-white hover:bg-gray-100">
            <Bell size={18} className="text-gray-700" />
          </button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{c.label}</p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {c.value}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs ${c.up
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {c.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {c.delta}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-yellow-100 p-3 text-gray-900">
                  <Icon size={22} />
                </div>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-yellow-400"
                  style={{ width: `${Math.min(95, 50 + i * 12)}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 p-5" data-aos="fade-up">
          <SectionTitle
            icon={TrendingUp}
            title="Revenue Trend"
            action={
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CalendarCheck size={14} />
                Last 8 months
              </div>
            }
          />
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="m" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#FACC15"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5" data-aos="fade-up">
          <SectionTitle icon={Filter} title="Service Mix" />
          <div className="mt-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={serviceMix} dataKey="value" nameKey="name" outerRadius={85}>
                  {serviceMix.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {serviceMix.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block size-3 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  {s.name}
                </span>
                <span className="font-medium text-gray-900">{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom: Activity + Team Performance */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2" data-aos="fade-up">
          <SectionTitle icon={CalendarCheck} title="Recent Activity" />
          <div className="mt-4 space-y-4">
            {[
              {
                tag: "Task",
                title: "Prototype for deltamime app reviewed",
                time: "Just now",
              },
              {
                tag: "Order",
                title: "Web development package upgraded",
                time: "1h ago",
              },
              {
                tag: "Note",
                title: "Meeting with CEO moved to 2:00 PM",
                time: "4h ago",
              },
              {
                tag: "Compliance",
                title: "GST status approved",
                time: "Yesterday",
              },
            ].map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-gray-200/70 bg-white p-3"
              >
                <div className="mt-0.5 size-2 rounded-full bg-yellow-400" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                      {a.tag}
                    </span>
                    <span className="text-xs text-gray-500">{a.time}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {a.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5" data-aos="fade-up">
          <SectionTitle icon={Users} title="Team Performance" />
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamProgress} barSize={22}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="tasks" radius={[8, 8, 0, 0]} fill="#FBBF24" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            *Tasks completed this sprint
          </div>
        </Card>
      </div>
    </div>
  );
}