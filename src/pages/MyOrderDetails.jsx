import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { initPayment } from '../api/Orders/Order';
import { motion } from 'framer-motion';
import {
  Download,
  MessageCircle,
  Calendar,
  Clock,
  ChevronRight,
  FileText,
  CreditCard,
  Truck,
  Shield,
  XCircle,
  Wrench,
  ListChecks
} from 'lucide-react';

// Order status list (moved outside component for reuse)
export const orderStatusList = [
  { value: 1, label: 'In Progress' },
  { value: 2, label: 'Completed' },
  { value: 3, label: 'Pending' },
  { value: 4, label: 'Completed, Payment Pending' },
  { value: 5, label: 'Completed, Payment Done' },
];

const MyOrderDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showInvoice, setShowInvoice] = useState(false);

  // Get order data from navigation state
  const order = location.state?.order || {};
  const IsIndividual = location.state?.IsIndividual || 0;
  console.log(order, "shuttuuuuuuuuu");



  const isIndividualService = IsIndividual === 1; // Check if it's individual service

  console.log("Order Data:", order);

  // Timeline steps by status value
  const getTimelineSteps = (statusValue) => {
    const steps = [
      { stage: "Order Placed", key: 1 },
      { stage: "In Progress", key: 2 },
      { stage: "Completed", key: 3 },
      { stage: "Payment Pending", key: 4 },
      { stage: "Payment Done", key: 5 },
    ];

    let completedIdx = 0;
    if (statusValue === 1) completedIdx = 1; // In Progress
    else if (statusValue === 2) completedIdx = 2; // Completed
    else if (statusValue === 3) completedIdx = 0; // Pending
    else if (statusValue === 4) completedIdx = 3; // Completed, Payment Pending
    else if (statusValue === 5) completedIdx = 4; // Completed, Payment Done

    return steps.map((step, idx) => ({
      ...step,
      completed: idx <= completedIdx,
      date: idx <= completedIdx ? new Date(order.CreatedAt || order.CreatedDate).toLocaleDateString() : 'N/A',
    })).slice(0, completedIdx + 1);
  };


  const getOrderItems = () => {
    if (Array.isArray(order.ServiceDetails) && order.ServiceDetails.length > 0) {
      return order.ServiceDetails.map((service, index) => ({
        id: index,
        name: service.ServiceName || service.ItemName || `Service ${index + 1}`,
        status: service.StatusRemark || 'Pending',
        price: `₹${service.Total || 'N/A'}`,
        total: parseFloat(service.Total) || 0,
        description: service.Description || '',
        ServiceDetailsID: service.ServiceDetailsID || service.ServiceDetailID || service.ID || null,
        PendingAmount: service.PendingAmount ? parseFloat(service.PendingAmount) : (service.PendingAmount === 0 ? 0 : (service.Total && service.AdvanceAmount ? parseFloat(service.Total) - parseFloat(service.AdvanceAmount) : 0)),
        AdvanceAmount: service.AdvanceAmount ? parseFloat(service.AdvanceAmount) : 0
      }));
    }
    // fallback for legacy/other order types
    if (isIndividualService) {
      return [{
        id: 0,
        name: order.ServiceName || order.ItemName || 'Individual Service',
        status: order.OrderStatus || order.Status,
        price: `₹${order.TotalAmount || order.Price || 'N/A'}`,
        total: order.TotalAmount || order.Price || 0,
        description: order.ServiceDescription || 'Service details will be provided by our team.',
        ServiceDetailsID: order.ServiceDetailsID || order.ServiceDetailID || null,
        PendingAmount: order.PendingAmount ? parseFloat(order.PendingAmount) : 0,
        AdvanceAmount: order.AdvanceAmount ? parseFloat(order.AdvanceAmount) : 0
      }];
    }
    if (Array.isArray(order.Items) && order.Items.length > 0) {
      return order.Items.map((item, index) => ({
        id: index,
        name: item.name || `Item ${index + 1}`,
        status: item.status || 'Pending',
        price: item.price || '₹N/A',
        total: 0,
        description: item.description || '',
        ServiceDetailsID: item.ServiceDetailsID || item.ServiceDetailID || null,
        PendingAmount: item.PendingAmount ? parseFloat(item.PendingAmount) : 0,
        AdvanceAmount: item.AdvanceAmount ? parseFloat(item.AdvanceAmount) : 0
      }));
    }
    return [];
  };


  const orderItems = getOrderItems();


  const timelineSteps = getTimelineSteps(order.OrderStatus || order.Status);

  // Helper to get status label from value
  const getOrderStatusLabel = (statusValue) => {
    const found = orderStatusList.find((s) => s.value === statusValue);
    return found ? found.label : (order.OrderStatus || order.Status || 'Unknown');
  };

  // Status colors mapping
  const statusColors = {
    1: "bg-blue-100 text-blue-800",
    2: "bg-green-100 text-green-800",
    3: "bg-yellow-100 text-yellow-800",
    4: "bg-orange-100 text-orange-800",
    5: "bg-purple-100 text-purple-800",
    'default': "bg-gray-100 text-gray-800"
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const cardVariants = {
    hover: {
      y: -5,
      transition: {
        type: "spring",
        stiffness: 300
      }
    }
  };

  // State for selected service and its tasks
  const [selectedService, setSelectedService] = useState(null);
  const [serviceTasks, setServiceTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);
  const [payingOrderId, setPayingOrderId] = useState(null);
  // Calculate advance and pending amount for display
  // Sum AdvanceAmount and PendingAmount for all services
  const totalAdvanceAmount = orderItems.reduce((sum, item) => sum + (item.AdvanceAmount ? Number(item.AdvanceAmount) : 0), 0);
  const totalPendingAmount = orderItems.reduce((sum, item) => sum + (item.PendingAmount ? Number(item.PendingAmount) : 0), 0);

  // Payment handler
  const handlePayBalance = async (orderObj) => {
    try {
      setPayingOrderId(orderObj.OrderID);
      const servicePayment = (orderObj.ServiceDetails || []).map((service) => ({
        serviceId: service.ServiceID || service.serviceId,
        vendorFee: Number(service.VendorFee || 0),
        professionalFee: Number(service.ProfessionalFee || service.ProfFee || 0),
        contractorFee: Number(service.ContractorFee || 0),
        govFee: Number(service.GovtFee || 0),
        gst: Number(service.GstAmount || service.GST || 0),
        pendingAmount: Number(service.PendingAmount || 0)
      }));
      const totalPending = servicePayment.reduce((sum, s) => sum + Number(s.pendingAmount || 0), 0);
      const payload = {
        QuoteID: orderObj.QuoteID,
        totalAmount: Number(totalPending.toFixed(2)),
        govFee: Number(orderObj.GovtFee || 0),
        vendorFee: Number(orderObj.VendorFee || 0),
        contractorFee: Number(orderObj.ContractorFee || 0),
        profFee: Number(orderObj.ProfessionalFee || 0),
        customer: {
          name: orderObj.CustomerName || "Customer",
          email: orderObj.CustomerEmail || orderObj.Email || "test@example.com",
          phone: orderObj.CustomerPhone || orderObj.Phone || "9999999999"
        },
        servicePayment,
        StateID: orderObj.StateID || 0,
        IsInternal: orderObj.IsInternal || 0
      };
      const response = await initPayment(payload);
      if (response.success && response.paymentUrl) {
        window.open(response.paymentUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Payment Error:", error);
    } finally {
      setPayingOrderId(null);
    }
  };

  // Get all ServiceDetails for both individual and package orders

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.total || 0), 0) || order.TotalAmount || order.totalAmount || 0;

  // Check if any service has a pending amount
  const hasPendingAmount = orderItems.some(item => item.PendingAmount && item.PendingAmount > 0);

  if (!order || !order.OrderID) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Order Found</h3>
          <p className="text-gray-600 mb-6">Please go back and select an order to view details.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-yellow-500 text-black rounded-full hover:bg-yellow-600 transition font-medium"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl  text-gray-900 mb-5">
            Order Details
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1.5 rounded-full">
              Order ID: {order.OrderID}
            </span>
            <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${statusColors[order.OrderStatus || order.Status] || statusColors.default
              }`}>
              {getOrderStatusLabel(order.OrderStatus || order.Status)}
            </span>
            <span className="text-gray-600 flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-1 text-yellow-400" />
              Ordered on {new Date(order.CreatedAt || order.CreatedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            {isIndividualService && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full flex items-center">
                <Wrench className="w-4 h-4 mr-1" />
                Individual Service
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Card */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="mr-4"
                    >

                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {order.PackageName || order.PackageTitle || order.ServiceName || order.ItemName || 'Order'}
                      </h2>
                      <p className="text-gray-600">
                        {Array.isArray(order.ServiceDetails) && order.ServiceDetails.length > 0
                          ? 'This order includes the following individual services.'
                          : isIndividualService
                            ? 'Individual service order with dedicated support'
                            : 'This package includes various business services and solutions tailored to your needs.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items/Service Details */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    {isIndividualService ? (
                      <>
                        <Wrench className="w-5 h-5 mr-2 text-blue-400" />
                        Service Details
                      </>
                    ) : (
                      <>
                        <ListChecks className="w-5 h-5 mr-2 text-yellow-400" />
                        Package Items
                      </>
                    )}
                  </h3>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    {orderItems.map((item, index) => (
                      <motion.div
                        key={item.id || index}
                        variants={itemVariants}
                        className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl transition-colors cursor-pointer hover:bg-yellow-100 border ${selectedService && selectedService.id === item.id ? 'border-yellow-400' : 'border-transparent'}`}
                        onClick={async () => {
                          if (!item.ServiceDetailsID) return;
                          setSelectedService(item);
                          setTasksLoading(true);
                          setTasksError(null);
                          try {
                            const tasks = await getServiceTasks({ serviceDetailsId: item.ServiceDetailsID });
                            setServiceTasks(tasks || []);
                          } catch (err) {
                            setTasksError('Failed to load tasks for this service.', err);
                            setServiceTasks([]);
                          } finally {
                            setTasksLoading(false);
                          }
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <div className={`w-3 h-3 rounded-full mr-4 ${item.status === 'Completed' ? 'bg-green-400' :
                              item.status === 'Pending' ? 'bg-yellow-400' :
                                'bg-blue-400'
                              }`} />
                            <div>
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              {item.description && (
                                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                              )}
                              {!isIndividualService && item.status && (
                                <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                  item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                  {item.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-lg font-semibold text-gray-900 ml-4 whitespace-nowrap">
                          {item.price}
                        </span>
                      </motion.div>
                    ))}
                    {/* Show tasks for selected service */}
                    {selectedService && (
                      <div className="mt-6 bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
                        <h4 className="text-lg font-bold mb-3 text-yellow-700 flex items-center gap-2">
                          <ListChecks className="w-5 h-5 text-yellow-400" />
                          Tasks for {selectedService.name}
                        </h4>
                        {tasksLoading ? (
                          <div className="text-gray-500 py-4">Loading tasks...</div>
                        ) : tasksError ? (
                          <div className="text-red-500 py-4">{tasksError}</div>
                        ) : serviceTasks.length === 0 ? (
                          <div className="text-gray-400 py-4">No tasks found for this service.</div>
                        ) : (
                          <ul className="divide-y divide-gray-100">
                            {serviceTasks.map((task) => (
                              <li key={task.ID} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                  <span className="font-semibold text-gray-900">{task.TaskName}</span>
                                  <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{task.status}</span>
                                  <span className="ml-2 text-xs text-gray-400">{task.TaskNature}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 md:mt-0">
                                  Assigned: {task.AssignedAt ? new Date(task.AssignedAt).toLocaleDateString() : 'N/A'}
                                  {task.TAT && (
                                    <span className="ml-2">TAT: {task.TAT} {task.TATMeasure}</span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-yellow-400" />
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Order ID</span>
                      <span className="font-semibold">{order.OrderID}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ordered On</span>
                      <span className="font-semibold">
                        {order.CreatedAt || order.CreatedDate
                          ? new Date(order.CreatedAt || order.CreatedDate).toLocaleDateString()
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <span className={`font-semibold px-3 py-1 rounded-full ${statusColors[order.OrderStatus || order.Status] || statusColors.default
                        }`}>
                        {getOrderStatusLabel(order.OrderStatus || order.Status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-black">
                        ₹{totalAmount.toLocaleString()}
                      </span>
                    </div>
                    {/* Show Advance Paid if any AdvanceAmount exists */}
                    {totalAdvanceAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Advance Paid</span>
                        <span className="font-semibold text-green-700">₹{totalAdvanceAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pending Amount</span>
                      <span className="font-semibold text-red-600">₹{totalPendingAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Timeline & Actions */}
          <div className="space-y-8">
            {/* Timeline Card */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-2 text-yellow-400" />
                Order Timeline
              </h3>

              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-yellow-200" />

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  {timelineSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="relative flex items-start"
                    >
                      <div className="absolute left-3 -translate-x-1/2">
                        <motion.div
                          animate={{
                            scale: step.completed ? [1, 1.2, 1] : 1,
                          }}
                          className={`w-3 h-3 ml-2 rounded-full border-4 border-white ${step.completed ? 'bg-gray-900' : 'bg-gray-300'
                            }`}
                        />
                      </div>
                      <div className="ml-12">
                        <h4 className={`font-semibold ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                          {step.stage}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4 inline mr-1 text-yellow-400" />
                          {step.date}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Order Security</span>
                  <Shield className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Deliverables</span>
                  <Truck className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Support</span>
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                </div>
              </div>
            </motion.div>

            {/* Actions Card */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 pb-3 mb-4 border-b border-gray-200">
                Actions
              </h3>
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowInvoice(true)}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-full font-medium hover:bg-yellow-500 transition-colors shadow-md hover:shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Download Invoice
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.div>
                </motion.button>
                {hasPendingAmount ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-center gap-2 border-2 border-green-500 text-green-700 px-6 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors ${payingOrderId === order.OrderID ? 'opacity-60 cursor-not-allowed' : ''}`}
                    onClick={() => payingOrderId ? null : handlePayBalance(order)}
                    disabled={payingOrderId === order.OrderID}
                  >
                    <CreditCard className="w-5 h-5 text-green-500" />
                    {payingOrderId === order.OrderID ? 'Processing...' : 'Pay Balance'}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 border-2 border-yellow-400 text-black px-6 py-3 rounded-full font-medium hover:bg-yellow-50 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contact Support
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          <p>Need help with your order? Our support team is available 24/7.</p>
          <p className="mt-1">Email: support@businessservices.com • Phone: +1-234-567-8900</p>
        </motion.div>

        {/* Invoice Modal */}
        {showInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowInvoice(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="text-center">
                <FileText className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Invoice Generation</h3>
                <p className="text-gray-600 mb-6">
                  Your invoice for Order #{order.OrderID} will be generated and made available soon.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowInvoice(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Add invoice download logic here
                      alert('Invoice download feature coming soon!');
                      setShowInvoice(false);
                    }}
                    className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MyOrderDetails;