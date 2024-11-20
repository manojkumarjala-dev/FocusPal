import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, ScrollView, Button, Alert, TextInput, Modal, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { BarChart } from 'react-native-chart-kit';
import { format, parseISO, startOfMonth } from 'date-fns';

type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export default function HabitDisplayScreen() {
  const { id } = useLocalSearchParams(); // Habit ID
  const router = useRouter();
  const [markedDates, setMarkedDates] = useState({});
  const [habitName, setHabitName] = useState('');
  const [frequency, setFrequency] = useState('');
  const [customDays, setCustomDays] = useState<Record<Day, boolean>>({
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
    Sat: false,
    Sun: false,
  });
  const [currentStreak, setCurrentStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [monthlySuccessData, setMonthlySuccessData] = useState({});
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false); // Modal visibility state

  useEffect(() => {
    const fetchHabitData = async () => {
      try {
        const habitRef = doc(db, 'habits', id);
        const habitSnapshot = await getDoc(habitRef);

        if (habitSnapshot.exists()) {
          const habitData = habitSnapshot.data();
          setHabitName(habitData.name || '');
          setFrequency(habitData.frequency || 'Daily');
          if (habitData.customDays) {
            const initialDays: Record<Day, boolean> = {
              Mon: false,
              Tue: false,
              Wed: false,
              Thu: false,
              Fri: false,
              Sat: false,
              Sun: false,
            };
            habitData.customDays.forEach((day: Day) => {
              initialDays[day] = true;
            });
            setCustomDays(initialDays);
          }

          setCurrentStreak(habitData.streaks?.currentStreak || 0);
          setHighestStreak(habitData.streaks?.highestStreak || 0);


          const dates = habitData.dates || { success: [], failure: [] };
          const successDates = Array.isArray(dates.success) ? dates.success : [];
          const failureDates = Array.isArray(dates.failure) ? dates.failure : [];
          const markedData: any = {};

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
  const handleDeleteHabit = async () => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const habitRef = doc(db, 'habits', id);
              await deleteDoc(habitRef);
              console.log("Habit deleted!");
              router.navigate('/landing');  
            } catch (error) {
              console.error("Error deleting habit:", error);
              Alert.alert("Error", "There was an issue deleting the habit.");
            }
          }
        }
      ]
    );
  };

  const calculateMonthlySuccess = (successDates: string[]) => {
    const successCounts: Record<string, number> = {};
    successDates.forEach((date) => {
      const monthKey = format(parseISO(date), 'yyyy-MM'); // e.g., '2024-11'
      successCounts[monthKey] = (successCounts[monthKey] || 0) + 1;
    });
    setMonthlySuccessData(successCounts);
  };

  const handleDayToggle = (day: Day) => {
    setCustomDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleUpdateHabit = async () => {
    const selectedDays = (Object.keys(customDays) as Day[]).filter((day) => customDays[day]);

    try {
      const habitRef = doc(db, 'habits', id);

      // Update Firestore document with new frequency and customDays
      await updateDoc(habitRef, {
        frequency,
        customDays: frequency === 'Custom' ? selectedDays : null,
      });

      setIsUpdateModalVisible(false); // Close modal
      Alert.alert("Success", "Habit frequency updated successfully!");
    } catch (error) {
      console.error("Error updating habit:", error);
      Alert.alert("Error", "Failed to update habit. Please try again.");
    }
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
      />

      <Text style={styles.chartTitle}>Monthly Success Overview</Text>

      
      <BarChart
        data={{
          labels: Object.keys(monthlySuccessData),
          datasets: [{ data: Object.values(monthlySuccessData) }],
        }}
        width={Dimensions.get("window").width - 40}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: "#f5f5f5",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#f5f5f5",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={styles.chartStyle}
      />
            <View style={styles.buttonContainer}>
        <Button title="Update Habit" color="#00796b" onPress={() => setIsUpdateModalVisible(true)} />
        <Button title="Delete Habit" color="#d32f2f" onPress={() => {handleDeleteHabit()}} />
      </View>
      {/* Update Modal */}
      <Modal visible={isUpdateModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Frequency</Text>
            <View style={styles.frequencyContainer}>
              <TouchableOpacity
                style={[styles.frequencyOption, frequency === 'Daily' && styles.selectedOption]}
                onPress={() => setFrequency('Daily')}
              >
                <Text style={styles.frequencyText}>Daily</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.frequencyOption, frequency === 'Weekly' && styles.selectedOption]}
                onPress={() => setFrequency('Weekly')}
              >
                <Text style={styles.frequencyText}>Weekly</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.frequencyOption, frequency === 'Custom' && styles.selectedOption]}
                onPress={() => setFrequency('Custom')}
              >
                <Text style={styles.frequencyText}>Custom</Text>
              </TouchableOpacity>
            </View>

            {frequency === 'Custom' && (
              <View style={styles.customDaysContainer}>
                {(Object.keys(customDays) as Day[]).map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayButton, customDays[day] && styles.selectedDayButton]}
                    onPress={() => handleDayToggle(day)}
                  >
                    <Text style={styles.dayButtonText}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Button title="Save" onPress={handleUpdateHabit} />
            <Button title="Cancel" color="#d32f2f" onPress={() => setIsUpdateModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: '20%',
    marginBottom: '5%',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  deleteButtonContainer: {
    marginTop: 30,
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  frequencyOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedOption: {
    backgroundColor: '#00796b',
    borderColor: '#00796b',
  },
  frequencyText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  dayButton: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    margin: 2,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedDayButton: {
    backgroundColor: '#00796b',
    borderColor: '#00796b',
  },
  dayButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },

});
