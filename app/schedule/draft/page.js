'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WorkSchedule from '@/app/components/WorkSchedule';

export default function DraftSchedule() {
  const [managers, setManagers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const res = await fetch('/api/managers');
      const data = await res.json();
      setManagers(data);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const handleSubmit = async (scheduleData) => {
    try {
      const res = await fetch('/api/schedules/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit schedule');
      }

      if (data.success) {
        // Get the current drafts
        const drafts = JSON.parse(localStorage.getItem('scheduleDrafts') || '[]');
        
        // Remove the current draft from the list
        const currentDraft = JSON.parse(localStorage.getItem('scheduleData') || '{}');
        const updatedDrafts = drafts.filter(draft => 
          draft.draftId !== currentDraft.draftId
        );
        
        // Update localStorage
        localStorage.setItem('scheduleDrafts', JSON.stringify(updatedDrafts));
        localStorage.removeItem('scheduleData');
        
        // Show success message and redirect
        alert('Schedule submitted successfully');
        router.push('/dashboard/student');
        return { success: true };
      } else {
        throw new Error('Failed to submit schedule');
      }
    } catch (error) {
      console.error('Error submitting schedule:', error);
      throw error;
    }
  };

  return (
    <WorkSchedule 
      role="STUDENT"
      managers={managers}
      onSubmit={handleSubmit}
      isNewSchedule={false}
    />
  );
}