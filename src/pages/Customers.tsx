import React, { useState, useEffect } from 'react';
import { Users, Search, Loader2, Plus, Phone } from 'lucide-react';
import api from '../api/axios';
import { Customer, Service, Booking } from '../types';


const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [historyCustomer, setHistoryCustomer] = useState<number | null>(null);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; //
      const [customersRes, servicesRes] = await Promise.all([
        api.get('/customers/'),
        api.get('/services/')
      ]);

      setCustomers(customersRes.data);
      setServices(servicesRes.data);
    } catch (error) {console.error(error);}
    finally { setLoading(false); }
  };

  const fetchHistory = async (customerId: number) => {
    setHistoryCustomer(customerId);
    setHistoryLoading(true);

    try {
      const res = await api.get(`/bookings/?customer_id=${customerId}`);
      setHistoryBookings(res.data);
      setHistoryCustomer(customerId);
    } catch (err) {
      alert("Failed to load history");
    }
    finally { setHistoryLoading(false); }
  };

  const getServiceName = (id: number) =>
    services.find(s => s.id === id)?.name || "Unknown";

  const getServicePrice = (id: number) =>
    services.find(s => s.id === id)?.price || 0;

  const total = historyBookings.length;

  const confirmed = historyBookings.filter(
    b => b.status === "confirmed"
  ).length;

  const cancelled = historyBookings.filter(
    b => b.status === "cancelled"
  ).length;

  const totalRevenue = historyBookings
    .filter(b => b.status === "confirmed")
    .reduce((sum, b) => sum + getServicePrice(b.service_id), 0);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/customers/', formData);
      setFormData({ name: '', phone: '' });
      fetchCustomers();
    } catch (error) {}
    finally { setSubmitting(false); }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );


  return (
    <div className="space-y-8">
      {/* Add Customer Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Plus size={20} className="text-blue-600" />
          Add New Customer
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Customer Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
              placeholder="Full Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
              placeholder="+91 9876543210"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 w-full h-11 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Add Customer"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Customers List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-gray-900">Your Customers</h3>

          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* MODAL FIXED */}
        {historyCustomer && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">

              <h3 className="text-lg font-bold mb-4">Customer History</h3>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                <div className="bg-blue-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold">{total}</p>
                </div>

                <div className="bg-green-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Confirmed</p>
                  <p className="font-bold text-green-700">
                    {confirmed}
                  </p>
                </div>

                <div className="bg-red-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Cancelled</p>
                  <p className="font-bold text-red-700">
                    {cancelled}
                  </p>
                </div>

                <div className="bg-yellow-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="font-bold text-yellow-700">
                    ₹ {totalRevenue}
                  </p>
                </div>
              </div>

              {/* Bookings */}
              {historyLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-blue-600" />
                </div>
              ) : historyBookings.length === 0 ? (
                <p className="text-sm text-gray-500">No bookings found</p>
              ) : (
                historyBookings.map((b: any) => (
                  <div key={b.id} className="border-b py-3 text-sm">
                    <p>
                      <b>Service:</b> {getServiceName(b.service_id)}
                      <span className="text-gray-500 ml-2">
                        (₹ {getServicePrice(b.service_id)})
                      </span>
                    </p>

                    <p>
                      <b>Date:</b> {new Date(b.date).toLocaleString()}
                    </p>

                    <p>
                      <b>Status:</b>{" "}
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                          b.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : b.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </p>
                  </div>
                ))
              )}

              <button
                onClick={() => setHistoryCustomer(null)}
                className="mt-4 bg-gray-200 px-4 py-2 rounded w-full"
              >
                Close
              </button>

            </div>
          </div>
        )}

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Phone</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4 text-right flex gap-2 justify-end">
                        <button
                          onClick={() => fetchHistory(customer.id)}
                          className="text-blue-600 text-xs font-semibold"
                        >
                          History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {customer.name}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Phone size={12} />
                      {customer.phone}
                    </p>
                  </div>

                  <button
                    onClick={() => fetchHistory(customer.id)}
                    className="text-blue-600 text-xs font-semibold"
                  >
                    History
                  </button>
                </div>
              ))}
            </div>

            {filteredCustomers.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                {searchQuery
                  ? "No customers match your search."
                  : "No customers added yet."}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Customers;
