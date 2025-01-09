'use client'

import React, { useState, useEffect } from 'react';
import { Printer, Download } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { useRouter } from 'next/navigation';

const WeeklySchedule = ({ 
  role = 'STUDENT', 
  onSubmit, 
  initialData = null,
  managers = [],
  isNewSchedule = false
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    employeeName: '',
    position: '',
    manager: '',
    weekStartDate: new Date().toISOString().split('T')[0],
    shifts: [
      { startTime: '', endTime: '', hours: '0' },
      { startTime: '', endTime: '', hours: '0' },
      { startTime: '', endTime: '', hours: '0' },
      { startTime: '', endTime: '', hours: '0' },
      { startTime: '', endTime: '', hours: '0' }
    ],
    totalHours: '0',
    timeOff: '',
    notes: '',
    approvedBy: '',
    approvalDate: '',
    approvalStatus: 'pending'
  });

  const [selectedManager, setSelectedManager] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (!isNewSchedule) {
      const savedData = localStorage.getItem('weeklyScheduleData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(parsedData);
        } catch (error) {
          console.error('Error parsing saved data:', error);
        }
      }
    }
  }, [initialData, isNewSchedule]);

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    localStorage.setItem('weeklyScheduleData', JSON.stringify(newData));
  };

  const handleShiftChange = (dayIndex, field, value) => {
    const newShifts = [...formData.shifts];
    newShifts[dayIndex] = { 
      ...newShifts[dayIndex],
      [field]: value 
    };
    
    const newData = { ...formData, shifts: newShifts };
    setFormData(newData);
    localStorage.setItem('weeklyScheduleData', JSON.stringify(newData));
  };

  const calculateHours = (dayIndex) => {
    const shift = formData.shifts[dayIndex];
    if (!shift.startTime || !shift.endTime) return;

    const [startHour, startMin] = shift.startTime.split(':').map(Number);
    const [endHour, endMin] = shift.endTime.split(':').map(Number);

    // Validate work hours (8 AM to 5 PM)
    if (startHour < 8 || startHour > 17 || endHour < 8 || endHour > 17) {
      alert('Work hours are between 8 AM and 5 PM');
      return;
    }

    const totalStartMinutes = startHour * 60 + startMin;
    const totalEndMinutes = endHour * 60 + endMin;

    if (totalEndMinutes <= totalStartMinutes) {
      alert('End time must be after start time');
      return;
    }

    const diffMinutes = totalEndMinutes - totalStartMinutes;
    const hours = (diffMinutes / 60).toFixed(2);

    const newShifts = [...formData.shifts];
    newShifts[dayIndex] = {
      ...newShifts[dayIndex],
      hours: hours
    };

    const totalHours = newShifts.reduce((sum, shift) => 
      sum + parseFloat(shift.hours || '0'), 0
    );

    if (totalHours > 20) {
      alert('Total weekly hours cannot exceed 20 hours');
      return;
    }

    const newData = {
      ...formData,
      shifts: newShifts,
      totalHours: totalHours.toFixed(2)
    };

    setFormData(newData);
    localStorage.setItem('weeklyScheduleData', JSON.stringify(newData));
  };

  const handleSubmitForApproval = async () => {
    if (!selectedManager) {
      alert('Please select a manager');
      return;
    }

    if (!formData.employeeName) {
      alert('Please enter employee name');
      return;
    }

    try {
      const result = await onSubmit({
        ...formData,
        managerId: selectedManager,
        year: formData.weekStartDate.getFullYear().toString(),  // Explicitly send the year
        month: formData.weekStartDate.toLocaleString('default', { month: 'long' }),
        type: 'weekly'
      });

      if (result.success) {
        localStorage.removeItem('weeklyScheduleData');
        router.push('/dashboard/student');
      }
    } catch (error) {
      console.error('Error submitting schedule:', error);
      alert('Failed to submit schedule: ' + error.message);
    }
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Weekly Work Schedule</h1>
            <input
              type="date"
              className="mt-2 p-2 border rounded"
              value={formData.weekStartDate}
              onChange={(e) => handleInputChange('weekStartDate', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Employee info fields similar to monthly schedule */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Employee Name</label>
            <input
              className="w-full p-2 border rounded"
              value={formData.employeeName}
              onChange={(e) => handleInputChange('employeeName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Position</label>
            <input
              className="w-full p-2 border rounded"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Manager</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
            >
              <option value="">Select Manager</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} - {manager.office}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-5 bg-blue-600 text-white font-semibold">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-5">
            {weekDays.map((day, index) => (
              <div key={day} className="border p-4">
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-600">Start Time</label>
                    <input
                      type="time"
                      className="w-full p-1 border rounded text-sm"
                      value={formData.shifts[index].startTime}
                      onChange={(e) => handleShiftChange(index, 'startTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">End Time</label>
                    <input
                      type="time"
                      className="w-full p-1 border rounded text-sm"
                      value={formData.shifts[index].endTime}
                      onChange={(e) => handleShiftChange(index, 'endTime', e.target.value)}
                    />
                  </div>
                  <button
                    className="w-full p-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    onClick={() => calculateHours(index)}
                  >
                    Calculate Hours
                  </button>
                  <div>
                    <label className="block text-sm text-gray-600">Hours</label>
                    <input
                      type="text"
                      className="w-full p-1 border rounded text-sm bg-gray-100"
                      value={formData.shifts[index].hours}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Weekly Summary</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Total Hours</label>
              <input
                className="w-full p-2 border rounded"
                value={formData.totalHours}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Notes</label>
              <textarea
                className="w-full p-2 border rounded"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <button
            onClick={handleSubmitForApproval}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;