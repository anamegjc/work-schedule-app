'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Edit, Eye, Trash2 } from 'lucide-react';

// Define an interface for the schedule type
interface Schedule {
  id: string;
  month: string;
  year: string;
  status: string;
  totalHours: string;
  approvalDate?: string;
}

export default function StudentDashboard() {
  const [pendingSchedules, setPendingSchedules] = useState<Schedule[]>([]);
  const [approvedSchedules, setApprovedSchedules] = useState<Schedule[]>([]);
  const [draftSchedules, setDraftSchedules] = useState<any[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSchedules();
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    const drafts = JSON.parse(localStorage.getItem('scheduleDrafts') || '[]');
    setDraftSchedules(drafts);
  };

  const deleteDraft = (draftId: number) => {
    const drafts = draftSchedules.filter(draft => draft.draftId !== draftId);
    localStorage.setItem('scheduleDrafts', JSON.stringify(drafts));
    setDraftSchedules(drafts);
  };

  const continueDraft = (draft: any) => {
    localStorage.setItem('scheduleData', JSON.stringify(draft));
    router.push('/schedule/draft');
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/schedules/student');
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      const data: Schedule[] = await res.json();
  
      setPendingSchedules(data.filter((s) => s.status === 'PENDING'));
      setApprovedSchedules(data.filter((s) => s.status === 'APPROVED'));
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleAction = async (scheduleId: string, action: string) => {
    try {
      if (action === 'delete') {
        const confirmDelete = window.confirm('Are you sure you want to delete this schedule?');
        if (!confirmDelete) return;
      }

      const res = await fetch('/api/schedules/student', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          scheduleId, 
          action 
        })
      });

      const result: { success: boolean; error?: string } = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }

      // Refresh schedules after action
      await fetchSchedules();
      
      // Close dropdown
      setOpenDropdownId(null);

      // Show success message
      if (action === 'delete') {
        alert('Schedule deleted successfully');
      }
    } catch (error) {
      console.error(`Error ${action}ing schedule:`, error);
      alert(`Failed to ${action} schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">My Schedules</h2>
          <button
            onClick={() => {
                localStorage.removeItem('scheduleData'); // Clear any existing data
                router.push('/schedule/new')
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create New Schedule
          </button>
        </div>

        {/* Draft Schedules Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Draft Schedules</h3>
          {draftSchedules.length > 0 ? (
            <div className="grid gap-4">
              {draftSchedules.map((draft) => (
                <div key={draft.draftId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {draft.month} {draft.year}
                      </p>
                      <p className="text-sm text-gray-600">
                        Last modified: {new Date(draft.lastModified).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Hours: {draft.totalHours}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => continueDraft(draft)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Continue
                      </button>
                      <button
                        onClick={() => deleteDraft(draft.draftId)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No draft schedules</p>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Pending Approval</h3>
            {pendingSchedules.length > 0 ? (
              <div className="grid gap-4">
                {pendingSchedules.map((schedule) => (
                  <div key={schedule.id} className="border rounded-lg p-4 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {schedule.month} {schedule.year}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: {schedule.status}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total Hours: {schedule.totalHours}
                        </p>
                      </div>
                      
                      <div className="relative">
                        <button 
                          onClick={() => setOpenDropdownId(
                            openDropdownId === schedule.id ? null : schedule.id
                          )}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical size={20} />
                        </button>
                        
                        {openDropdownId === schedule.id && (
                          <div className="absolute right-0 top-full z-10 w-48 bg-white border rounded shadow-lg mt-2">
                            <button 
                              onClick={() => router.push(`/schedule/${schedule.id}`)}
                              className="flex items-center w-full p-2 hover:bg-gray-100 text-left"
                            >
                              <Eye size={16} className="mr-2" /> Review
                            </button>
                            <button 
                              onClick={() => router.push(`/schedule/${schedule.id}/edit`)}
                              className="flex items-center w-full p-2 hover:bg-gray-100 text-left"
                            >
                              <Edit size={16} className="mr-2" /> Edit
                            </button>
                            <button 
                              onClick={() => handleAction(schedule.id, 'delete')}
                              className="flex items-center w-full p-2 hover:bg-gray-100 text-left text-red-600"
                            >
                              <Trash2 size={16} className="mr-2" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No pending schedules</p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Approved Schedules</h3>
            {approvedSchedules.length > 0 ? (
              <div className="grid gap-4">
                {approvedSchedules.map((schedule) => (
                  <div key={schedule.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {schedule.month} {schedule.year}
                        </p>
                        <p className="text-sm text-gray-600">
                          Approved on: {schedule.approvalDate ? new Date(schedule.approvalDate).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total Hours: {schedule.totalHours}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/schedule/${schedule.id}`)}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        View Details
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
      </div>
    </div>
  );
}