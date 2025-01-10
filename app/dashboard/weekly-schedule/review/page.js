// app/dashboard/weekly-schedule/review/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import WeeklySchedule from '@app/components/WeeklySchedule'; // Adjust the import path based on your project structure

export default function WeeklyScheduleReview() {
  const [scheduleData, setScheduleData] = useState(null);
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get('id');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // First try to get from localStorage
        const storedData = localStorage.getItem('viewScheduleData');
        if (storedData) {
          setScheduleData(JSON.parse(storedData));
          localStorage.removeItem('viewScheduleData');
          return;
        }

        // If not in localStorage, fetch from API
        if (scheduleId) {
          const res = await fetch(`/api/schedules/${scheduleId}`);
          if (!res.ok) throw new Error('Failed to fetch schedule');
          const data = await res.json();
          setScheduleData(data);
        }
      } catch (error) {
        console.error('Error loading schedule:', error);
      }
    };

    fetchSchedule();
  }, [scheduleId]);

  if (!scheduleData) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <WeeklySchedule
      initialData={scheduleData}
      role="MANAGER"
      isReviewMode={true}
      managers={[]} // Pass empty array or actual managers if needed
    />
  );
}