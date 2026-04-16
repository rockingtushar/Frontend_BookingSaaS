import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Loader2, MessageCircle, Copy, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { Booking, Customer, Service, BookingResponse } from '../types';

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<BookingResponse | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    service_id: '',
    date: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [bookingsRes, customersRes, servicesRes] = await Promise.all([
        api.get('/bookings/'),
        api.get('/customers/'),
        api.get('/services/')
      ]);
      setBookings(bookingsRes.data.reverse());
      setCustomers(customersRes.data);
      setServices(servicesRes.data);
    } catch (error) {}
    finally { setLoading(false); }
  };

  useEffect(() => { 
    const token = localStorage.getItem("token");
    if (token) {
      fetchData();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center h-64 items-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessData(null);
    try {
      const response = await api.post('/bookings/', {
        ...formData,
        customer_id: Number(formData.customer_id),
        service_id: Number(formData.service_id)
      });
      setSuccessData(response.data);
      setFormData({ customer_id: '', service_id: '', date: '', notes: '' });
      fetchData();
    } catch (error) {}
    finally { setSubmitting(false); }
  };

  const updateStatus = async (id: number, status: string) => {
    setActionLoadingId(id);
    const booking = bookings.find(b => b.id === id);
    if (booking?.status === "cancelled") {
      alert("This booking is already cancelled");
      return;
    }

    try {
      const res = await api.put(`/bookings/${id}?status=${status}`);
      console.log(res.data);

      fetchData();
      setConfirmId(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Update failed");
    }
    finally {setActionLoadingId(null);}
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Message copied to clipboard!');
  };

  

  const getCustomerName = (id: number) => customers.find(c => c.id === id)?.name || 'Unknown';
  const getServiceName = (id: number) => services.find(s => s.id === id)?.name || 'Unknown';

  

  return (
    <div className="space-y-8">
      {/* New Booking Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Plus size={20} className="text-blue-600" />
          New Booking
        </h3>
        
        {successData && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-700 font-bold">
              <CheckCircle2 size={24} />
              Booking confirmed!
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <a 
                href={successData.whatsapp_link}
                target="_blank"
                rel="noreferrer"
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 flex items-center gap-2"
              >
                <MessageCircle size={18} />
                Send WhatsApp
              </a>
              <button 
                onClick={() => copyToClipboard('Your booking is confirmed!')}
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
              >
                <Copy size={18} />
                Copy msg
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer *</label>
            <select
              required
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-11 bg-white"
            >
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Service *</label>
            <select
              required
              value={formData.service_id}
              onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-11 bg-white"
            >
              <option value="">Select Service</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} - ₹{s.price}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (Optional)</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
              placeholder="Any special requests?"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 w-full h-11 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Booking'}
            </button>
          </div>
        </form>

        {confirmId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
              <h3 className="text-lg font-bold mb-4">Cancel Booking?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to cancel this booking?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmId(null)}
                  className="px-4 py-2 text-gray-600"
                >
                  No
                </button>

                <button
                  disabled={actionLoadingId === confirmId}
                  onClick={() => {
                    if (confirmId !== null) {
                      updateStatus(confirmId, "cancelled");
                    }
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                >
                  {actionLoadingId === confirmId ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    "Yes, Cancel"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bookings List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Booking History</h3>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <>
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
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{getCustomerName(booking.customer_id)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getServiceName(booking.service_id)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(booking.date).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex gap-2 justify-end">
                        <button className="bg-green-500 text-white p-2 rounded-lg">
                          <MessageCircle size={16} />
                        </button>

                        <button
                          disabled={actionLoadingId === booking.id || booking.status === "cancelled"}
                          onClick={() => setConfirmId(booking.id)}
                          className={`px-2 py-1 rounded text-xs text-white ${
                            booking.status === "cancelled"
                              ? "bg-gray-400"
                              : "bg-red-500"
                          }`}
                        >
                          {actionLoadingId === booking.id ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : booking.status === "cancelled" ? (
                            "Cancelled"
                          ) : (
                            "Cancel"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {bookings.map((booking) => (
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
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-xs text-gray-500">
                      {new Date(booking.date).toLocaleString()}
                    </p>

                    <div className="flex gap-2">
                      {/* WhatsApp button */}
                      <button className="bg-green-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium">
                        <MessageCircle size={14} />
                        WhatsApp
                      </button>

                      {/* Cancel button */}
                      <button
                        disabled={actionLoadingId === booking.id || booking.status === "cancelled"}
                        onClick={() => setConfirmId(booking.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white ${
                          booking.status === "cancelled"
                            ? "bg-gray-400"
                            : "bg-red-500"
                        }`}
                      >
                        {actionLoadingId === booking.id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : booking.status === "cancelled" ? (
                          "Cancelled"
                        ) : (
                          "Cancel"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {bookings.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No bookings found.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Bookings;
