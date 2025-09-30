import React, { useState } from 'react';
import { registerComplaint } from '@/service/api';

const ComplaintModal = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await registerComplaint(title, description, category, priority);

      if (response.success) {
        setSuccess('Complaint registered successfully!');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.message || response.error || 'Failed to register complaint.');
      }
    } catch (err) {
      console.error('Error registering complaint:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <style jsx>{`
        select option {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 8px;
        }
        select option:hover {
          background-color: #374151;
        }
      `}</style>
      <div className="glass-card rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Raise New Complaint</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-500 bg-opacity-20 text-red-400 rounded-lg">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-500 bg-opacity-20 text-green-400 rounded-lg">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full max-w-full px-4 py-3 glass-effect rounded-lg text-white bg-gray-800 bg-opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-0 max-h-48 overflow-y-auto"
                    style={{
                      whiteSpace: 'normal',
                      colorScheme: 'dark'
                    }}
                    required
                  >
                    <option value="">Select Category</option>

                    {/* Infrastructure & Maintenance */}
                    <option value="Electrical">Electrical Issues</option>
                    <option value="Plumbing">Plumbing Issues</option>
                    <option value="Furniture">Broken Furniture</option>

                    {/* Mess / Food Related */}
                    <option value="FoodQuality">Food Quality</option>
                    <option value="FoodQuantity">Food Quantity</option>
                    <option value="MenuVariety">Menu Variety</option>
                    <option value="MessTiming">Mess Timing</option>
                    <option value="DrinkingWater">Drinking Water</option>

                    {/* Security & Safety */}
                    <option value="GateSecurity">Gate Security</option>
                    <option value="Visitors">Visitors Issue</option>
                    <option value="Theft">Theft / Missing Items</option>
                    <option value="Bullying">Bullying / Harassment</option>

                    {/* Accommodation / Room */}
                    <option value="RoomChange">Room Change Request</option>
                    <option value="RoommateConflict">Roommate Conflict</option>

                    {/* Housekeeping */}
                    <option value="Washroom">Washroom Cleanliness</option>
                    <option value="Garbage">Garbage Collection</option>
                    <option value="Pests">Pest / Insects</option>

                    {/* Discipline */}
                    <option value="Noise">Noise Complaint</option>
                    <option value="LateEntry">Late Entry/Exit</option>
                    <option value="MisuseFacilities">Misuse of Facilities</option>

                    {/* Other */}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 glass-effect rounded-lg text-white bg-gray-800 bg-opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-0"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 glass-effect rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-0"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Description *</label>
                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 glass-effect rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-0 resize-none"
                  placeholder="Please provide detailed information about the issue..."
                  required
                ></textarea>
              </div>

              <div className="flex justify-end space-x-4">
                <button type="button" onClick={onClose} className="btn-secondary text-white px-6 py-3 rounded-lg font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary text-white px-6 py-3 rounded-lg font-medium">
                  {loading ? 'Submitting...' : '📝 Submit Complaint'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintModal;
