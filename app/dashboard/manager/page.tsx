'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Check, X, Eye, Trash2 } from 'lucide-react';

// Define an interface for the schedule type
interface Schedule {
  id: string;
  employeeName: string;
  month: string;
  year: string;
  status: string;
  totalHours: string;
  approvalDate?: string;
  type: 'weekly' | 'monthly';
}

export default function ManagerDashboard() {
  const [pendingSchedules, setPendingSchedules] = useState<Schedule[]>([]);
  const [approvedSchedules, setApprovedSchedules] = useState<Schedule[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const router = useRouter();
  console.log('Router initialized:', router);

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/schedules/manager');
      
      // Check if the response is ok
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Check content type
      // const contentType = res.headers.get('content-type');
      // if (!contentType || !contentType.includes('application/json')) {
      //   throw new Error('Response is not JSON');
      // }

      // Check response body
      const text = await res.text();
      console.log('Raw API response:', text); // Debug log

      if (!text.trim()) {
        throw new Error('Empty response body');
      }

      // Parse JSON
      const data = JSON.parse(text);
      console.log('Parsed schedule data:', data); // Debug log


      const schedules = Array.isArray(data) 
        ? data 
        : data.schedules || data.data || [];
      
      // Ensure type property exists
      const processedSchedules = schedules.map((schedule: Schedule) => ({
        ...schedule,
        type: schedule.type || 'monthly' // Default to monthly if type is missing
      }));
      setPendingSchedules(schedules.filter((s: Schedule) => s.status === 'PENDING'));
      setApprovedSchedules(schedules.filter((s: Schedule) => s.status === 'APPROVED'));

      // Inside fetchSchedules, after parsing data
console.log('Raw schedules before processing:', schedules);
console.log('Processed pending schedules:', schedules.filter((s: Schedule) => s.status === 'PENDING'));
console.log('Processed approved schedules:', schedules.filter((s: Schedule) => s.status === 'APPROVED'));
    } catch (error) {
      console.error('Error fetching schedules:', error);
      // Optionally set an error state or show a user-friendly message
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleAction = async () => {
    if (!selectedScheduleId || !selectedAction) return;
  
    try {
      const res = await fetch('/api/schedules/manager', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          scheduleId: selectedScheduleId, 
          action: selectedAction 
        })
      });
  
      const result: { success: boolean; error?: string } = await res.json();
  
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }
  
      // Refresh schedules after action
      await fetchSchedules();
      
      // Reset all selection states to close dropdown
      setOpenDropdownId(null);
      setSelectedAction(null);
      setSelectedScheduleId(null);
  
      // Show success message based on action
      switch (selectedAction) {
        case 'approve':
          alert('Schedule approved successfully');
          break;
        case 'reject':
          alert('Schedule rejected');
          break;
        case 'delete':
          alert('Schedule deleted');
          break;
      }
    } catch (error) {
      console.error(`Error performing action:`, error);
      alert(`Failed to perform action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const openActionDropdown = (scheduleId: string) => {
    setOpenDropdownId(openDropdownId === scheduleId ? null : scheduleId);
    setSelectedScheduleId(scheduleId);
    setSelectedAction(null);
  };

  const handleActionSelection = (action: string, scheduleId: string) => {
    setSelectedAction(action);
    setSelectedScheduleId(scheduleId);
    setOpenDropdownId(null); // Close the dropdown when an action is selected
  };

 // In your ManagerDashboard component
 const handleViewSchedule = (schedule: Schedule) => {
  console.log('handleViewSchedule called');
  console.log('Schedule received:', schedule);
  console.log('Schedule type:', schedule.type);
  console.log('Schedule ID:', schedule.id);
  
  try {
    // Verify router is initialized
    console.log('Router object:', router);
    
    // Save to localStorage
    localStorage.setItem('viewScheduleData', JSON.stringify(schedule));
    console.log('Data saved to localStorage');
    
    // Construct and log the route
    const route = schedule.type === 'weekly' 
      ? `/dashboard/weekly-schedule/review?id=${schedule.id}`
      : `/dashboard/monthly-schedule/review?id=${schedule.id}`;
    console.log('Attempting to navigate to:', route);
    
    // Simple router push without catch
    router.push(route);
  } catch (error: unknown) { // Explicitly type the error
    console.error('Error in handleViewSchedule:', error);
  }
};

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Waiting for Approval</h2>
        {pendingSchedules.length > 0 ? (
          <div className="grid gap-4">
            {pendingSchedules.map((schedule) => (
              <div key={schedule.id} className="border rounded-lg p-4 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{schedule.employeeName}</p>
                    <p className="text-sm text-gray-600">
                      {schedule.month} {schedule.year}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total Hours: {schedule.totalHours}
                    </p>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => openActionDropdown(schedule.id)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <MoreVertical size={20} />
                    </button>
                    
                    {openDropdownId === schedule.id && (
                      <div className="absolute right-0 top-full z-10 w-48 bg-white border rounded shadow-lg mt-2">
                        <button 
                          onClick={() => handleViewSchedule(schedule)}
                          className="flex items-center w-full p-2 hover:bg-gray-100 text-left"
                        >
                          <Eye size={16} className="mr-2" /> Review
                        </button>
                        <button 
                          onClick={() => handleActionSelection('approve', schedule.id)}
                          className="flex items-center w-full p-2 hover:bg-gray-100 text-left"
                        >
                          <Check size={16} className="mr-2" /> Approve
                        </button>
                        <button 
                          onClick={() => handleActionSelection('reject', schedule.id)}
                          className="flex items-center w-full p-2 hover:bg-gray-100 text-left text-red-600"
                        >
                          <X size={16} className="mr-2" /> Reject
                        </button>
                        <button 
                          onClick={() => handleActionSelection('delete', schedule.id)}
                          className="flex items-center w-full p-2 hover:bg-gray-100 text-left text-red-600"
                        >
                          <Trash2 size={16} className="mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {selectedAction && selectedScheduleId === schedule.id && (
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <p className="text-sm font-medium">
                      {selectedAction === 'approve' ? 'Approve this schedule?' :
                       selectedAction === 'reject' ? 'Reject this schedule?' :
                       'Delete this schedule?'}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAction}
                        className={`px-4 py-2 rounded ${
                          selectedAction === 'approve' ? 'bg-green-500 text-white' :
                          selectedAction === 'reject' ? 'bg-red-500 text-white' :
                          'bg-red-500 text-white'
                        }`}
                      >
                        Done
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAction(null);
                          setSelectedScheduleId(null);
                        }}
                        className="px-4 py-2 bg-gray-200 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No schedules pending approval</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Approved Schedules</h2>
        {approvedSchedules.length > 0 ? (
          <div className="grid gap-4">
            {approvedSchedules.map((schedule) => (
              <div key={schedule.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{schedule.employeeName}</p>
                    <p className="text-sm text-gray-600">
                      {schedule.month} {schedule.year}
                    </p>
                    <p className="text-sm text-gray-600">
                      Type: {schedule.type} {/* Add this line to verify type */}
                    </p>
                    <p className="text-sm text-gray-600">
                      Approved on: {new Date(schedule.approvalDate ?? '').toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      console.log('View button clicked for schedule:', schedule); // Debug log
                      handleViewSchedule(schedule);
                    }}
                    className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No approved schedules</p>
        )}
      </div>
    </div>
  );
}