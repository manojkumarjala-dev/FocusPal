import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; // Adjust the import path as needed
import { router } from 'expo-router';
import { AuthContext } from '@/AuthProvider';
const AddHabitScreen = () => { // Make sure user is passed as a prop or accessed via context
  const [habitName, setHabitName] = useState('');
  const { user } = useContext(AuthContext);
  const [frequency, setFrequency] = useState('Daily'); // Default to 'Daily'
  const [customDays, setCustomDays] = useState<Record<Day, boolean>>({
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
    Sat: false,
    Sun: false,
  });

  type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

  const handleDayToggle = (day: Day) => {
    setCustomDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleAddHabit = async () => {
    if (!user) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    const selectedDays = (Object.keys(customDays) as Day[]).filter(day => customDays[day]);

    if (!habitName.trim()) {
      Alert.alert("Error", "Please enter a habit name.");
      return;
    }

    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    const newHabit = {
      name: habitName,
      frequency,
      customDays: frequency === 'Custom' ? selectedDays : null,
      createdAt: new Date(),
      startDate: currentDate, // Automatically set start date to today's date
      dates: {
        success: [],
        failure: []
      },
      streaks: {
        currentStreak: 0,
        highestStreak: 0,
      },
      userId: user.uid, // Save the userId
    };

    try {
      const docRef = await addDoc(collection(db, 'habits'), newHabit);
      Alert.alert("Success", `Habit added`);
      setHabitName('');
      setFrequency('Daily');
      setCustomDays({
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
        Sat: false,
        Sun: false,
      });
      router.back();
    } catch (error) {
      console.error("Error adding habit: ", error);
      Alert.alert("Error", "Failed to add habit. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Habit</Text>
      <TextInput
        style={styles.input}
        placeholder="Habit Name"
        value={habitName}
        onChangeText={setHabitName}
      />
      
      <Text style={styles.label}>Frequency</Text>
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
              style={[
                styles.dayButton,
                customDays[day] && styles.selectedDayButton,
              ]}
              onPress={() => handleDayToggle(day)}
            >
              <Text style={styles.dayButtonText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Button title="Add Habit" onPress={handleAddHabit} />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 10,
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  frequencyOption: {
    padding: 10,
    paddingHorizontal: '10%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'black'
  },
  selectedOption: {
    backgroundColor: '#00796b',
  },
  frequencyText: {
    color: '#fff',
  },
  customDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 5,
  },
  selectedDayButton: {
    backgroundColor: '#00796b',
  },
  dayButtonText: {
    color: 'black',
  },
});

export default AddHabitScreen;
