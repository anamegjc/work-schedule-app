// // app/dashboard/monthly-schedule/review/page.js
// 'use client';

// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'next/navigation';
// import WorkSchedule from '@/app/components/WorkSchedule'; // Adjust the import path based on your project structure
// import { useRouter } from 'next/navigation';

// export default function MonthlyScheduleReview() {
    
//     const router = useRouter();
//   const [error, setError] = useState<string | null>(null);
//   const [scheduleData, setScheduleData] = useState(null);
//   const searchParams = useSearchParams();
//   const scheduleId = searchParams.get('id');
  
  

//   useEffect(() => {
//     const fetchSchedule = async () => {
//       try {
//         //console.log('Fetching schedule data...');
//         // First try to get from localStorage
//         const storedData = localStorage.getItem('viewScheduleData');
//         if (storedData) {
//             //console.log('Found data in localStorage');
//           const parsedData = JSON.parse(storedData);
//           setScheduleData(parsedData);
//           localStorage.removeItem('viewScheduleData');
//           return;
//         }

//         // If not in localStorage, fetch from API
//         if (scheduleId) {
//             //console.log('Fetching from API for ID:', scheduleId);
//           const res = await fetch(`/api/schedules/${scheduleId}`);
//           if (!res.ok) {
//             const errorData = await res.json();
//             throw new Error(errorData.error || 'Failed to fetch schedule')
//             };
//           const data = await res.json();
//           setScheduleData(data);
//         }
//       } catch (error) {
//         console.error('Error loading schedule:', error);
//         setError(error instanceof Error ? error.message : 'Failed to load schedule');
//       }
//     };

//     fetchSchedule();
//   }, [scheduleId, setError]);

//   if (error) {
//     return (
//       <div className="p-4 text-red-600">
//         <p>Error: {error}</p>
//         <button 
//           onClick={() => router.back()}
//           className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   if (!scheduleData) {
//     return <div className="p-4">Loading...</div>;
//   }

//   return (
//     <WorkSchedule
//       initialData={scheduleData}
//       role="MANAGER"
//       isReviewMode={true}
//       managers={[]} // Pass empty array or actual managers if needed
//     />
//   );
// }

// app/dashboard/monthly-schedule/review/page.js
'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ScheduleReview() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get('id');

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await fetch(`/api/schedules/${scheduleId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }
        const data = await response.json();
        console.log('Fetched schedule:', data); // Debug log
        setSchedule(data);
      } catch (err) {
        console.error('Error details:', err); // Debug log
        setError(err instanceof Error ? err.message : 'Error fetching schedule');
      } finally {
        setLoading(false);
      }
    }

    if (scheduleId) {
      fetchSchedule();
    }
  }, [scheduleId]);

  if (loading) {
    return <div className="p-6">Loading schedule...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!schedule) {
    return <div className="p-6">Schedule not found</div>;
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Schedule Review</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{schedule.employeeName}</h2>
            <p className="text-gray-600">
              {schedule.month} {schedule.year}
            </p>
            <p className="text-gray-600">
              Total Hours: {schedule.totalHours}
            </p>
            {schedule.approvalDate && (
              <p className="text-gray-600">
                Approved on: {new Date(schedule.approvalDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Shifts</h3>
            <div className="bg-gray-50 p-4 rounded overflow-auto">
              {schedule.shifts && typeof schedule.shifts === 'object' && (
                Object.entries(schedule.shifts).map(([date, shift]) => (
                  <div key={date} className="mb-4 border-b pb-2">
                    <p className="font-medium">{date}</p>
                    <p className="ml-4">Hours: {JSON.stringify(shift)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}