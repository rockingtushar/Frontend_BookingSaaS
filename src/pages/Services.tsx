import React, { useState, useEffect } from 'react';
import { Scissors, Trash2, Loader2, Plus } from 'lucide-react';
import api from '../api/axios';
import { Service } from '../types';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: ''
  });

  const fetchServices = async () => {
    try {
      const response = await api.get('/services/');
      setServices(response.data);
    } catch (error) {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/services/', {
        name: formData.name,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : undefined,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined
      });
      setFormData({ name: '', description: '', price: '', duration_minutes: '' });
      fetchServices();
    } catch (error) {}
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    setActionLoadingId(id);
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (error:any) {alert(error.response?.data?.detail || "Delete failed");}
    finally { setActionLoadingId(null); }
  };

  return (
    <div className="space-y-8">
      {/* Add Service Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Plus size={20} className="text-blue-600" />
          Add New Service
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
              placeholder="e.g. Haircut, Consultation"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              placeholder="Briefly describe the service..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
              placeholder="30"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 w-full h-11 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Add Service'}
            </button>
          </div>
        </form>
      </div>

      {/* Services List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Your Services</h3>
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
                    <th className="px-6 py-4 font-semibold">Service</th>
                    <th className="px-6 py-4 font-semibold">Price</th>
                    <th className="px-6 py-4 font-semibold">Duration</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 font-medium">{service.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{service.description}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">₹{service.price || '0'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{service.duration_minutes || '0'} min</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          disabled
                          className="text-gray-400 text-xs font-semibold cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {services.map((service) => (
                <div key={service.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-500">{service.description}</p>
                    </div>
                    <button
                      disabled
                      className="text-gray-400 text-xs font-semibold cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      Price: ₹{service.price || '0'}
                    </span>
                    <span className="flex items-center gap-1">
                      Duration: {service.duration_minutes || '0'} min
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {services.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No services added yet.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Services;
