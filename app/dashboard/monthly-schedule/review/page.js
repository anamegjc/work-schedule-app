// app/dashboard/monthly-schedule/review/page.js
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import WorkSchedule from '@/app/components/WorkSchedule'; // Adjust the import path based on your project structure
import { useRouter } from 'next/navigation';

export default function MonthlyScheduleReview() {
    
    const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState(null);
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get('id');
  
  

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        //console.log('Fetching schedule data...');
        // First try to get from localStorage
        const storedData = localStorage.getItem('viewScheduleData');
        if (storedData) {
            //console.log('Found data in localStorage');
          const parsedData = JSON.parse(storedData);
          setScheduleData(parsedData);
          localStorage.removeItem('viewScheduleData');
          return;
        }

        // If not in localStorage, fetch from API
        if (scheduleId) {
            //console.log('Fetching from API for ID:', scheduleId);
          const res = await fetch(`/api/schedules/${scheduleId}`);
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch schedule')
            };
          const data = await res.json();
          setScheduleData(data);
        }
      } catch (error) {
        console.error('Error loading schedule:', error);
        setError(error instanceof Error ? error.message : 'Failed to load schedule');
      }
    };

    fetchSchedule();
  }, [scheduleId, setError]);

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>Error: {error}</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!scheduleData) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <WorkSchedule
      initialData={scheduleData}
      role="MANAGER"
      isReviewMode={true}
      managers={[]} // Pass empty array or actual managers if needed
    />
  );
}