'use client'

import React, { useState, useEffect } from 'react';
import {Printer, Download} from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { useRouter } from 'next/navigation';


const WorkSchedule = ({ 
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
            month: 'January',
            year: '2025',
            shifts: Array(31).fill().map(() => ({
            startTime: '',
            endTime: '',
            hours: '0'
            })),
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
          setFormData({...initialData, draftId: initialData.draftId});
          
        } else if (!isNewSchedule){
          const savedData = localStorage.getItem('scheduleData');
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              const normalizedShifts = Array(31).fill().map((_, index) => ({
                startTime: parsedData.shifts?.[index]?.startTime || '',
                endTime: parsedData.shifts?.[index]?.endTime || '',
                hours: parsedData.shifts?.[index]?.hours || '0'
              }));
    
              setFormData({
                ...parsedData,
                shifts: normalizedShifts,
                totalHours: parsedData.totalHours || '0',
                approvalStatus: parsedData.approvalStatus || 'pending',
                approvalDate: parsedData.approvalDate || '',
                draftId: parsedData.draftId // Preserve the draftId here as well
              });
            } catch (error) {
              console.error('Error parsing saved data:', error);
            }
          }
        }
      }, [initialData, isNewSchedule]);

      // Add function to save as draft
        const saveAsDraft = () => {
            const drafts = JSON.parse(localStorage.getItem('scheduleDrafts') || '[]');
            const draftData = {
            ...formData,
            draftId: Date.now(), // Add unique identifier
            lastModified: new Date().toISOString()
            };
            drafts.push(draftData);
            localStorage.setItem('scheduleDrafts', JSON.stringify(drafts));
            alert('Schedule saved as draft');
            router.push('/dashboard/student');
        };

                // Add function to update draft
        const updateDraft = () => {
            // Get all existing drafts
            const drafts = JSON.parse(localStorage.getItem('scheduleDrafts') || '[]');
            
            // Get the current draft ID from the form data
            const currentDraftId = formData.draftId;
            
            if (!currentDraftId) {
                alert('No draft ID found. Unable to update.');
                return;
            }
            
            // Find the index of the current draft
            const draftIndex = drafts.findIndex(draft => draft.draftId === currentDraftId);
            
            if (draftIndex === -1) {
                alert('Draft not found. Unable to update.');
                return;
            }
            
            // Create updated draft data
            const updatedDraftData = {
                ...formData,
                lastModified: new Date().toISOString()
            };
            
            // Update the draft at the found index
            drafts[draftIndex] = updatedDraftData;
            
            // Save the updated drafts array back to localStorage
            localStorage.setItem('scheduleDrafts', JSON.stringify(drafts));
            
            // Also update the current schedule data in localStorage
            localStorage.setItem('scheduleData', JSON.stringify(updatedDraftData));
            
            alert('Draft Updated Successfully');
            router.push('/dashboard/student');
        };



        const calculateHours = (day, startTime, endTime) => {
            if (!startTime || !endTime) {
            handleShiftChange(day, 'hours', '0');
            return;
            }
            
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);

            // Determine the start and end indices for the current week
            const weekStart = Math.floor(day / 7) * 7;
            const weekEnd = weekStart + 5;

            // Validate work hours (8 AM to 5 PM)
            if (startHour < 8 || startHour > 17 || endHour < 8 || endHour > 17) {
            alert('Work hours are between 8 AM and 5 PM');
            return;
            }
            
            const totalStartMinutes = startHour * 60 + startMin;
            const totalEndMinutes = endHour * 60 + endMin;
            
            // Ensure end time is after start time
            if (totalEndMinutes <= totalStartMinutes) {
            alert('End time must be after start time');
            return;
            }

            let diffMinutes = totalEndMinutes - totalStartMinutes;
            
            // Handle overnight shifts
            if (diffMinutes < 0) {
            diffMinutes += 24 * 60;
            }

            const hours = (diffMinutes / 60).toFixed(2);
            
            
            // Update the specific day's hours
            const newShifts = [...formData.shifts];
            newShifts[day] = { 
            ...newShifts[day],
            startTime: startTime,
            endTime: endTime,
            hours: hours
            };

            const totalWeeklyHours = newShifts.slice(weekStart, weekEnd + 1).reduce((sum, shift) => {
                return sum + parseFloat(shift.hours || '0');
            }, 0);
            
            // Check if total hours exceeds 20 per week
            if (totalWeeklyHours > 20) {
                alert('Total weekly hours cannot exceed 20 hours');
                return;
            }

            // Recalculate total hours for the week
            const totalHours = newShifts.reduce((sum, shift) => {
            return sum + parseFloat(shift.hours || '0');
            }, 0);

            // Check if total hours exceeds 20 per week
            if (totalHours > 80) {
            alert('Total hours cannot exceed 80 hours');
            return;
            }

            // // Check if total weekly hours exceeds 20 per week
            // if (totalHours > 20) {
            //     alert('Total weekly hours cannot exceed 20 hours');
            //     return;
            //   }
        

            // Update state with new shifts and total hours
            const newData = { 
            ...formData, 
            shifts: newShifts,
            totalHours: totalHours.toFixed(2)
            };

            setFormData(newData);
            localStorage.setItem('scheduleData', JSON.stringify(newData));
        };

        const resetDayTimes = (day) => {
            const newShifts = [...formData.shifts];
            newShifts[day] = { 
            startTime: '',
            endTime: '',
            hours: '0'
            };

            // Recalculate total hours
            const totalHours = newShifts.reduce((sum, shift) => {
            return sum + parseFloat(shift.hours || '0');
            }, 0);

            // Update state with reset shifts and total hours
            const newData = { 
            ...formData, 
            shifts: newShifts,
            totalHours: totalHours.toFixed(2)
            };

            setFormData(newData);
            localStorage.setItem('scheduleData', JSON.stringify(newData));
        };

        // Modify handleShiftChange similarly
        const handleShiftChange = (day, field, value) => {
        if (formData.approvalStatus === 'approved') {
            alert('Schedule is already approved and cannot be modified');
            return;
        }

        const newShifts = [...formData.shifts];
        newShifts[day] = { 
            ...newShifts[day],
            [field]: value 
        };

        const newData = { ...formData, shifts: newShifts };
        setFormData(newData);
        localStorage.setItem('scheduleData', JSON.stringify(newData));
        };

        const handleInputChange = (field, value) => {
            if (formData.approvalStatus === 'approved') {
            alert('Schedule is already approved and cannot be modified');
            return;
            }
            
            const newData = { ...formData, [field]: value };
            setFormData(newData);
            localStorage.setItem('scheduleData', JSON.stringify(newData));
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
                // Get the current draft ID if it exists
                const currentDraft = JSON.parse(localStorage.getItem('scheduleData') || '{}');
                
                const result = await onSubmit({
                    managerId: selectedManager,
                    employeeName: formData.employeeName,
                    position: formData.position,
                    month: formData.month,
                    year: formData.year,
                    shifts: formData.shifts,
                    totalHours: formData.totalHours,
                    notes: formData.notes,
                    timeOff: formData.timeOff,
                    draftId: currentDraft.draftId // Include the draft ID
                });
                
                if (result.success) {
                    // Remove from drafts if it was a draft
                    if (currentDraft.draftId) {
                        const drafts = JSON.parse(localStorage.getItem('scheduleDrafts') || '[]');
                        const updatedDrafts = drafts.filter(draft => draft.draftId !== currentDraft.draftId);
                        localStorage.setItem('scheduleDrafts', JSON.stringify(updatedDrafts));
                    }
                    
                    // Clear the current schedule data
                    localStorage.removeItem('scheduleData');
                    
                    // Show success message and redirect
                    router.push('/dashboard/student');
                }
            } catch (error) {
                console.error('Error submitting schedule:', error);
                alert('Failed to submit schedule: ' + error.message);
            }
        };

        const handleApproval = () => {
            if (parseFloat(formData.totalHours) > 80) {
            alert('Cannot approve schedule exceeding 80 monthly hours');
            return;
            }
        
            const approvedData = {
            ...formData,
            approvalStatus: 'approved',
            approvalDate: new Date().toISOString().split('T')[0]
            };
        
            setFormData(approvedData);
            localStorage.setItem('scheduleData', JSON.stringify(approvedData));
        };

        const handleResetApproval = () => {
            const resetData = {
            ...formData,
            approvalStatus: 'pending',
            approvalDate: '',
            approvedBy: ''
            };
        
            setFormData(resetData);
            localStorage.setItem('scheduleData', JSON.stringify(resetData));
        };

        const exportData = () => {
            // Prepare schedule details as an array of arrays
            const scheduleDetails = [
            ['Employee Name', formData.employeeName],
            ['Position', formData.position],
            ['Month', `${formData.month} ${formData.year}`],
            ['Total Hours', parseFloat(formData.totalHours || 0)],
            ['Approval Status', formData.approvalStatus],
            ['Approved Date', formData.approvalDate || 'Not Approved'],
            ['Notes', formData.notes],
            [] // Blank row for separation
            ];
        
            // Detailed shift information
            const shiftsHeader = ['Day', 'Date', 'Day of Week', 'Start Time', 'End Time', 'Hours'];
            const excelData = [shiftsHeader];
        
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
            formData.shifts.forEach((shift, index) => {
            const currentDate = new Date(formData.year, 
                months.indexOf(formData.month), 
                index + 1
            );
        
            if (shift.startTime && shift.endTime) {
                excelData.push([
                index + 1, 
                currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                daysOfWeek[currentDate.getDay()],
                shift.startTime, 
                shift.endTime, 
                parseFloat(shift.hours || 0)
                ]);
            }
            });
        
            // Create worksheet
            const worksheet = XLSX.utils.aoa_to_sheet([...scheduleDetails, ...excelData]);
        
            // Create workbook and add worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Work Schedule');
        
            // Export to Excel file
            XLSX.writeFile(workbook, `work_schedule_${formData.month}_${formData.year}.xlsx`);
        };

        //   const importData = (event) => {
        //     const file = event.target.files[0];
        //     const reader = new FileReader();
        //     reader.onload = (e) => {
        //       try {
        //         const importedData = JSON.parse(e.target.result);
                
        //         // Validate imported data
        //         const normalizedData = {
        //           ...importedData,
        //           shifts: Array(31).fill().map((_, index) => ({
        //             startTime: importedData.shifts?.[index]?.startTime || '',
        //             endTime: importedData.shifts?.[index]?.endTime || '',
        //             hours: importedData.shifts?.[index]?.hours || '0'
        //           })),
        //           totalHours: importedData.totalHours || '0'
        //         };

        //         setFormData(normalizedData);
        //         localStorage.setItem('scheduleData', JSON.stringify(normalizedData));
        //         event.target.value = null; // Reset file input
        //       } catch (error) {
        //         console.error('Error importing data:', error);
        //         alert('Invalid file format. Please upload a valid schedule JSON.');
        //       }
        //     };
        //     reader.readAsText(file);
        //   };

        const handlePrint = () => {
            window.print();
        };

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];


        const calculateMonthDetails = () => {
            const firstDayOfMonth = new Date(`${formData.month} 1, ${formData.year}`);
            const daysInMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 0).getDate();
            const startDay = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)
        
            const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
            const blanks = Array(startDay).fill(null);
        
            return { days, blanks };
        };
        
        const { days, blanks } = calculateMonthDetails();

        return (
            <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow p-6 mb-4">
                <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Monthly Work Schedule</h1>
                    <div className="flex gap-2 mt-2">
                    <select 
                        className="p-1 border rounded"
                        value={formData.month}
                        onChange={(e) => handleInputChange('month', e.target.value)}
                        disabled={role === 'MANAGER' || formData.approvalStatus === 'approved'}
                    >
                        {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        className="p-1 border rounded w-20"
                        value={formData.year}
                        onChange={(e) => handleInputChange('year', e.target.value)}
                        min="2000"
                        max="2100"
                        disabled={role === 'MANAGER' || formData.approvalStatus === 'approved'}
                    />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportData} className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    <Download size={16} /> Export
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                    <Printer size={16} /> Print
                    </button>
                </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Employee Name</label>
                    <input
                    className="w-full p-2 border rounded"
                    value={formData.employeeName}
                    onChange={(e) => handleInputChange('employeeName', e.target.value)}
                    disabled={role === 'MANAGER' || formData.approvalStatus === 'approved'}
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Position</label>
                    <input
                    className="w-full p-2 border rounded"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    disabled={role === 'MANAGER' || formData.approvalStatus === 'approved'}
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Manager</label>
                    {role === 'STUDENT' ? (
                    <select
                        className="w-full p-2 border rounded"
                        value={selectedManager}
                        onChange={(e) => setSelectedManager(e.target.value)}
                        disabled={formData.approvalStatus === 'approved'}
                    >
                        <option value="">Select Manager</option>
                        {managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                            {manager.name} - {manager.office}
                        </option>
                        ))}
                    </select>
                    ) : (
                    <input
                        className="w-full p-2 border rounded"
                        value={formData.manager}
                        readOnly
                    />
                    )}
                </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="grid grid-cols-7 bg-blue-600 text-white font-semibold">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <div key={day} className="p-2 text-center">{day}</div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7">
                    {[...blanks, ...days].map((day, index) => {
                    const isWeekend = index % 7 === 0 || (index + 1) % 7 === 0;
                    
                    return (
                        <div 
                        key={index} 
                        className={`border p-2 min-h-[120px] ${isWeekend ? 'bg-gray-200 text-gray-400' : ''}`}
                        >
                        {day && (
                        <>
                            <div className="font-bold mb-2">{day}</div>
                            {!isWeekend && (
                            <div className="space-y-2">
                                <div>
                                <label className="block text-sm text-gray-600">Start Time</label>
                                <input
                                    type="time"
                                    className="w-full p-1 border rounded text-sm"
                                    value={formData.shifts[day - 1]?.startTime || ''}
                                    onChange={(e) => {
                                    handleShiftChange(day - 1, 'startTime', e.target.value);
                                    }}
                                    disabled={role === 'MANAGER' || formData.approvalStatus === 'approved'}
                                />
                                </div>
                                <div>
                                <label className="block text-sm text-gray-600">End Time</label>
                                <input
                                    type="time"
                                    className="w-full p-1 border rounded text-sm"
                                    value={formData.shifts[day - 1]?.endTime || ''}
                                    onChange={(e) => {
                                    handleShiftChange(day - 1, 'endTime', e.target.value);
                                    }}
                                    disabled={role === 'MANAGER' || formData.approvalStatus === 'approved'}
                                />
                                </div>
                                {role === 'STUDENT' && formData.approvalStatus !== 'approved' && (
                                <div className="flex space-x-2">
                                    <button 
                                    className="w-1/2 p-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                    onClick={() => {
                                        const startTime = formData.shifts[day - 1]?.startTime;
                                        const endTime = formData.shifts[day - 1]?.endTime;
                                        calculateHours(day - 1, startTime, endTime);
                                    }}
                                    >
                                    Done
                                    </button>
                                    <button 
                                    className="w-1/2 p-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                    onClick={() => resetDayTimes(day - 1)}
                                    >
                                    Reset
                                    </button>
                                </div>
                                )}
                                <div>
                                <label className="block text-sm text-gray-600">Hours</label>
                                <input
                                    type="text"
                                    className="w-full p-1 border rounded text-sm bg-gray-100"
                                    value={formData.shifts[day - 1]?.hours || '0'}
                                    readOnly
                                />
                                </div>
                            </div>
                            )}
                        </>
                        )}
                        </div>
                    );
                    })}
                </div>
                </div>

                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h2 className="text-xl font-bold mb-4">Monthly Summary</h2>
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
                    <label className="block text-sm text-gray-600 mb-1">Time Off Days</label>
                    <input
                        className="w-full p-2 border rounded"
                        value={formData.timeOff}
                        onChange={(e) => handleInputChange('timeOff', e.target.value)}
                        disabled={role === 'MANAGER' || formData.approvalStatus === 'approved'}
                    />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-1">Notes</label>
                    <textarea
                    className="w-full p-2 border rounded"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    disabled={role === 'MANAGER' || formData.approvalStatus === 'approved'}
                    rows={3}
                    />
                </div>

                {role === 'STUDENT' && (
                    <div className="mt-4 space-y-4">
                    <button
                        onClick={saveAsDraft}
                        className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Save as Draft
                    </button>
                    <button
                        onClick={handleSubmitForApproval}
                        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        disabled={formData.approvalStatus === 'approved'}
                    >
                        Submit for Approval
                    </button>
                    </div>
                )} 
                
                {role === 'MANAGER' && (
                    <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm text-gray-600 mb-1">Approved By</label>
                        <input
                            className="w-full p-2 border rounded"
                            value={formData.approvedBy}
                            onChange={(e) => handleInputChange('approvedBy', e.target.value)}
                            disabled={formData.approvalStatus === 'approved'}
                        />
                        </div>
                        <div>
                        <label className="block text-sm text-gray-600 mb-1">Approval Status</label>
                        {formData.approvalStatus === 'pending' ? (
                            <button 
                            onClick={handleApproval}
                            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                            Approve Schedule
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                            <div className="w-full p-2 bg-green-100 text-green-800 rounded">
                                Approved on {formData.approvalDate}
                            </div>
                            <button 
                                onClick={handleResetApproval}
                                className="w-1/3 p-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Reset
                            </button>
                            </div>
                        )}
                        </div>
                        <div>
                        <label className="block text-sm text-gray-600 mb-1">Date</label>
                        <input
                            type="date"
                            className="w-full p-2 border rounded"
                            value={formData.approvalDate}
                            onChange={(e) => handleInputChange('approvalDate', e.target.value)}
                            disabled={formData.approvalStatus === 'approved'}
                        />
                        </div>
                    </div>
                    </div>
                )}
                </div>
            </div>
            </div>
    );
};

export default WorkSchedule;