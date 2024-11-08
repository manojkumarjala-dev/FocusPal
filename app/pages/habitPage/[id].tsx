import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useLocalSearchParams } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { BarChart } from 'react-native-chart-kit';
import { format, parseISO, startOfMonth } from 'date-fns';

interface HabitData {
  [date: string]: {
    selected: boolean;
    selectedColor: string;
  };
}

export default function HabitDisplayScreen() {
  const { id } = useLocalSearchParams();
  const [markedDates, setMarkedDates] = useState<HabitData>({});
  const [habitName, setHabitName] = useState('');
  const [frequency, setFrequency] = useState('');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [monthlySuccessData, setMonthlySuccessData] = useState({});

  useEffect(() => {
    const fetchHabitData = async () => {
      try {
        const habitRef = doc(db, 'habits', id);
        const habitSnapshot = await getDoc(habitRef);

        if (habitSnapshot.exists()) {
          const habitData = habitSnapshot.data();
          setHabitName(habitData.name || 'Unnamed Habit');
          setFrequency(habitData.frequency || 'Unknown Frequency');
          setCurrentStreak(habitData.streaks?.currentStreak || 0);
          setHighestStreak(habitData.streaks?.highestStreak || 0);

          const dates = habitData.dates || { success: [], failure: [] };
          const successDates = Array.isArray(dates.success) ? dates.success : [];
          const failureDates = Array.isArray(dates.failure) ? dates.failure : [];
          const markedData: HabitData = {};

          successDates.forEach((date: string) => {
            markedData[date] = { selected: true, selectedColor: 'green' };
          });

          failureDates.forEach((date: string) => {
            markedData[date] = { selected: true, selectedColor: 'red' };
          });

          setMarkedDates(markedData);
          calculateMonthlySuccess(successDates);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching habit data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHabitData();
  }, [id]);

  const calculateMonthlySuccess = (successDates) => {
    const successCounts = {};
    successDates.forEach(date => {
      const monthKey = format(parseISO(date), 'yyyy-MM'); // e.g., '2024-11'
      successCounts[monthKey] = (successCounts[monthKey] || 0) + 1;
    });
    setMonthlySuccessData(successCounts);
  };

  const formatBarChartData = () => {
    const labels = Object.keys(monthlySuccessData).map(month => format(parseISO(`${month}-01`), 'MMM yyyy'));
    const data = Object.values(monthlySuccessData);

    return {
      labels,
      datasets: [
        {
          data,
        },
      ],
    };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00796b" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Habit: {habitName}</Text>
      <Text style={styles.subtitle}>Frequency: {frequency}</Text>
      
      <View style={styles.streakContainer}>
        <Text style={styles.streakLabel}>Current Streak:</Text>
        <Text style={styles.streakValue}>{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</Text>
      </View>

      <View style={styles.streakContainer}>
        <Text style={styles.streakLabel}>Highest Streak:</Text>
        {highestStreak > 0 && (
          <Animatable.Text animation="pulse" iterationCount="infinite" style={styles.fireIcon}>
            🔥
          </Animatable.Text>
        )}
        <Text style={styles.streakValue}>{highestStreak} {highestStreak === 1 ? 'day' : 'days'}</Text>
      </View>

      <Calendar
        style={styles.calendar}
        markedDates={markedDates}
        markingType="custom"
        onDayPress={(day) => {
          console.log("Selected Date:", day.dateString);
        }}
      />

      <Text style={styles.chartTitle}>Monthly Success Overview</Text>
      <BarChart
        data={formatBarChartData()}
        width={Dimensions.get("window").width - 40} // Full width minus some padding
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: "#f5f5f5",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#f5f5f5",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chartStyle}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal:20,
    paddingBottom:'20%',
    marginBottom:'5%',
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: '#00796b',
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: '#333',
    marginBottom: 20,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  streakLabel: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  streakValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388E3C',
    marginLeft: 5,
  },
  fireIcon: {
    fontSize: 24,
    marginRight: 5,
    color: '#FF5722',
  },
  calendar: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
    color: '#00796b',
  },
  chartStyle: {
    borderRadius: 16,
    marginVertical: 8,
  },
});

