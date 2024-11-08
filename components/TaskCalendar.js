import React from 'react';
import { Calendar, WeekCalendar } from 'react-native-calendars';

export default function TaskCalendar({ markedDates, onDayPress }) {
  return (
    <Calendar
      style={{
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 10,
        marginBottom: 20,
      }}
      markedDates={markedDates}
      onDayPress={onDayPress}
    />
  );
}
