import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '@/AuthProvider'; // Import AuthContext for user information
import { db } from '@/firebaseConfig';
import { router } from 'expo-router';

export default function AddTaskScreen({ navigation }) {
  const [taskText, setTaskText] = useState('');
  const [deadline, setDeadline] = useState(new Date()); // Deadline state
  const [showDatePicker, setShowDatePicker] = useState(false); // Toggle for date picker
  const [priority, setPriority] = useState('Low'); // Priority state
  const { user } = useContext(AuthContext); // Access the current user from the AuthContext

  // Function to add a task and sync with Firestore
  const addTask = async () => {
    if (taskText.trim().length > 0 && user) {
      // Get the year, month, and date in local time
      const taskDeadline = `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}-${String(deadline.getDate()).padStart(2, '0')}`;
  
      const newTask = {
        text: taskText,
        completed: false,
        priority, // Add priority to the task
        deadline: taskDeadline, // Store only the date part (YYYY-MM-DD)
        createdAt: new Date().toISOString(),
        userId: user.uid,
      };
  
      console.log(newTask.deadline);
  
      try {
        await db.collection('tasks').add(newTask);
        setTaskText(''); // Clear the input after adding a task
        setDeadline(new Date()); // Reset deadline after task is added
        router.back(); // Navigate back after adding
      } catch (error) {
        console.error('Error adding task to Firestore: ', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Task</Text>

      {/* Input field and add task button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a task"
          value={taskText}
          onChangeText={setTaskText}
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Priority Selector */}
      <View style={styles.priorityContainer}>
        <Text style={styles.priorityLabel}>Priority:</Text>
        <TouchableOpacity
          style={[styles.priorityButton, priority === 'Low' && styles.selectedPriority]}
          onPress={() => setPriority('Low')}
        >
          <Text style={styles.priorityButtonText}>Low</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.priorityButton, priority === 'Medium' && styles.selectedPriority]}
          onPress={() => setPriority('Medium')}
        >
          <Text style={styles.priorityButtonText}>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.priorityButton, priority === 'High' && styles.selectedPriority]}
          onPress={() => setPriority('High')}
        >
          <Text style={styles.priorityButtonText}>High</Text>
        </TouchableOpacity>
      </View>

      {/* Deadline Picker */}
      <TouchableOpacity
        style={styles.deadlineButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.deadlineButtonText}>
          Select Deadline: {`${deadline.getDate()}/${deadline.getMonth() + 1}/${deadline.getFullYear()}`}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={deadline}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || deadline;
            setShowDatePicker(false);
            setDeadline(currentDate);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#00796b',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderColor: '#00796b',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    flex: 1,
    height: 45,
    padding: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#00796b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priorityLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
    alignSelf: 'center',
    marginRight: 10,
  },
  priorityButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  selectedPriority: {
    backgroundColor: '#00796b', // Highlight selected priority
  },
  priorityButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  deadlineButton: {
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#00796b',
    borderRadius: 25,
  },
  deadlineButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
