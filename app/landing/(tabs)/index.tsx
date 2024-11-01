import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const HomeScreen = () => {
  const router = useRouter();
  const [habits, setHabits] = useState([
    { id: '1', name: 'Exercise', frequency: 'Daily' },
    { id: '2', name: 'Read a Book', frequency: 'Weekly' },
    // Add more sample habits as needed
  ]);

  const renderHabit = ({ item }) => (
    <View style={styles.habitContainer} >
       <TouchableOpacity onPress={() => router.navigate('/pages/habitPage')}>
        <Text style={styles.habitName}>{item.name}</Text>
        <Text style={styles.habitFrequency}>{item.frequency}</Text>
       </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.navigate('/pages/addHabit')}
          >
          <Text style={styles.addButtonText}>+ Add Habit</Text>
        </TouchableOpacity>
      <Text style={styles.title}>My Habits</Text>
      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.habitList}
      />

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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 20,
  },
  habitList: {
    paddingBottom: 20,
  },
  habitContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  habitName: {
    fontSize: 20,
    color: '#333',
  },
  habitFrequency: {
    fontSize: 14,
    color: '#757575',
  },
  addButton: {
    backgroundColor: '#00796b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
