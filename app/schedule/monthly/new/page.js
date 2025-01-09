'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WorkSchedule from '../../../components/WorkSchedule';

export default function NewMonthlySchedule() {
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
        // Clear the scheduleData from localStorage upon successful submission
        localStorage.removeItem('scheduleData');
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
      isNewSchedule={true}
    />
  );
}