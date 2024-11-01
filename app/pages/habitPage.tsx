import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { DateObject } from '@/scripts/types';

import { HabitData } from '@/scripts/types';
  

export default function HabitDisplayScreen() {
  const [markedDates, setMarkedDates] = useState<HabitData>({});

  useEffect(() => {
    const fetchHabitData = async () => {
      const habitData = [
        { "2024-10-01": "success" },
        { "2024-10-02": "fail" },
        { "2024-10-03": "success" },
      ]; 
  
      const markedData: HabitData = {};
  
      habitData.forEach((entry) => {
        const [date, status] = Object.entries(entry)[0];
        markedData[date] = {
          selected: true,
          selectedColor: status === "success" ? "green" : "red",
        };
      });
  
      setMarkedDates(markedData);
    };
  
    fetchHabitData();
  }, []);
  

  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendar}
        markedDates={markedDates}
        markingType="dot"
        onDayPress={(day: DateObject) => {
          console.log("Selected Date:", day.dateString);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems:'center',
    paddingTop: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  calendar: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    width:'100%',
    borderRadius: 10,
    marginBottom: 20,
  },
});
