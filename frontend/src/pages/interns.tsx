import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Interns: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    schoolName: '',
    schoolAbbreviation: '',
    shift: '',
    timeIn: '',
    timeOut: '',
    totalHours: '',
  });

  const location = useLocation();
  useEffect(() => {
  if (location.state?.openModal) {
    setShowModal(true);
  }
}, [location.state]);

  const [dateCreated, setDateCreated] = useState<string>('');
 
  const to12HourFormat = (time24: string) => {
  const [hourStr, minuteStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12 || 12;
  return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
 };

  useEffect(() => {
    if (showModal) {
      const now = new Date();
      setDateCreated(now.toISOString());
    }
  }, [showModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;

  if (name === 'shift') {
    setFormData(prev => ({
      ...prev,
      shift: value,
      timeIn: '',
      timeOut: '',
    }));
    return;
  }

  if (name === 'timeIn') {
  setFormData(prev => ({ ...prev, timeIn: value }));
  return;
}
  setFormData(prev => ({ ...prev, [name]: value }));
};

const preventManualTimeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  e.preventDefault(); // disable typing
};

  const getTimeInRange = () => {
    switch (formData.shift) {
      case 'Day Shift':
        return { min: '06:00', max: '08:00' };
      case 'Mid Shift':
        return { min: '12:00', max: '15:00' };
      case 'Night Shift':
        return { min: '17:00', max: '20:00' };
      case 'Graveyard Shift':
        return { min: '22:00', max: '24:00' };
      default:
        return { min: '', max: '' };
    }
  };

const handleTimeInBlur = () => {
  const { min, max } = getTimeInRange();
  const value = formData.timeIn;

  if (min && max && (value < min || value > max)) {
    alert(`Time In must be between ${to12HourFormat(min)} and ${to12HourFormat(max)} for the selected shift.`);
    setFormData(prev => ({ ...prev, timeIn: '', timeOut: '' }));
    return;
  }

  const [hour, minute] = value.split(':').map(Number);
  const timeInDate = new Date();
  timeInDate.setHours(hour, minute);
  timeInDate.setMinutes(timeInDate.getMinutes() + 540); // 8h + 1h lunch
  const autoTimeOut = timeInDate.toTimeString().slice(0, 5);
  setFormData(prev => ({ ...prev, timeOut: autoTimeOut }));
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      ...formData,
      dateCreated,
    });
    setShowModal(false);
    setFormData({
      fullName: '',
      schoolName: '',
      schoolAbbreviation: '',
      shift: '',
      timeIn: '',
      timeOut: '',
      totalHours: '',
    });
  };

  const { min: timeInMin, max: timeInMax } = getTimeInRange();

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="bg-[#25E2CC] text-gray-50 px-8 py-3 rounded-lg font-bold hover:bg-[#1eb5a3] transition-colors duration-200 z-50"
      >
        <span> Add Intern </span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-xl relative">
            <h2 className="text-xl font-[650] mb-4 text-[#0D223D]">Add Intern</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-3">
                <input
                    type="text"
                    name="schoolName"
                    placeholder="School Name"
                    value={formData.schoolName}
                    onChange={handleChange}
                    required
                    className="w-full border p-2 rounded"
                />
                </div>
                <div className="col-span-1">
                <input
                    type="text"
                    name="schoolAbbreviation"
                    placeholder="Abbreviation"
                    value={formData.schoolAbbreviation}
                    onChange={handleChange}
                    required
                    className="w-full border p-2 rounded text-md"
                />
                </div>
              </div>
                            
              <select
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              >
                <option value="">Select Shift</option>
                <option>Day Shift</option>
                <option>Mid Shift</option>
                <option>Night Shift</option>
                <option>Graveyard Shift</option>
              </select>

              <div className="flex gap-2 text-gray-900">
                <div className="flex-1">
                  <label className="block text-sm font-medium">Time In</label>
                 <input
                    type="time"
                    name="timeIn"
                    value={formData.timeIn}
                    onChange={handleChange}
                    onBlur={handleTimeInBlur}
                    min={timeInMin}
                    max={timeInMax}
                    required
                    className="w-full border p-2 rounded text-gray-900"
                    />

                </div>

                <div className="flex-1 text-gray-900">
                  <label className="block text-sm font-medium">Time Out</label>
                  <input
                    type="time"
                    name="timeOut"
                    value={formData.timeOut}
                    onChange={handleChange}
                    onKeyDown={preventManualTimeInput}
                    required
                    className="w-full border p-2 rounded text-gray-900"
                    />
                </div>
              </div>

              <input
                type="number"
                name="totalHours"
                placeholder="Total Hours for Completion"
                value={formData.totalHours}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#25E2CC] text-white font-semibold px-4 py-2 rounded hover:bg-[#1eb5a3]"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )} 
    </div>
  );
};

export default Interns;
