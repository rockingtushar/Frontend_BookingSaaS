import React, { useState, useEffect } from 'react';
import { CalendarDays, Users, Scissors, Clock, MessageCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { Booking, Customer, Service } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    bookings: 0,
    customers: 0,
    services: 0,
    todayBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, customersRes, servicesRes] = await Promise.all([
          api.get('/bookings/'),
          api.get('/customers/'),
          api.get('/services/')
        ]);

        const allBookings: Booking[] = bookingsRes.data;
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = allBookings.filter(b => b.date.startsWith(today));

        setStats({
          bookings: allBookings.length,
          customers: customersRes.data.length,
          services: servicesRes.data.length,
          todayBookings: todayBookings.length
        });
        // const res = await api.get('/dashboard/');

        // setStats({
        //   bookings: res.data.total_bookings,
        //   customers: res.data.total_customers,
        //   services: res.data.total_services,
        //   todayBookings: res.data.today_bookings
        // });

        setRecentBookings(allBookings.slice(0, 5));
        setCustomers(customersRes.data);
        setServices(servicesRes.data);
      } catch (error) {
        // Error handled by interceptor
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCustomerName = (id: number) => customers.find(c => c.id === id)?.name || 'Unknown';
  const getServiceName = (id: number) => services.find(s => s.id === id)?.name || 'Unknown';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Bookings', value: stats.bookings, icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Customers', value: stats.customers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Services', value: stats.services, icon: Scissors, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Today\'s Bookings', value: stats.todayBookings, icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-lg flex items-center justify-center mb-4`}>
              <card.icon size={20} />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">{card.label}</p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Recent Bookings</h3>
          <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Service</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{getCustomerName(booking.customer_id)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getServiceName(booking.service_id)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(booking.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors inline-flex items-center gap-2 text-xs font-medium">
                      <MessageCircle size={16} />
                      WhatsApp
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {recentBookings.map((booking) => (
            <div key={booking.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-gray-900">{getCustomerName(booking.customer_id)}</p>
                  <p className="text-xs text-gray-500">{getServiceName(booking.service_id)}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {booking.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                <button className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-xs font-medium">
                  <MessageCircle size={14} />
                  WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>

        {recentBookings.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No bookings found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
