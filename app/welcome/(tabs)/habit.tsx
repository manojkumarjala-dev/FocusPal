import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; // Add this for date picking
import Nav from '@/app/Nav';

export default function TaskTracker() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [deadline, setDeadline] = useState(new Date()); // State for deadline
  const [showDatePicker, setShowDatePicker] = useState(false); // Toggle for date picker

  // Function to add a task
  const addTask = () => {
    if (taskText.trim().length > 0) {
      setTasks([...tasks, { text: taskText, completed: false, deadline }]);
      setTaskText(''); // Clear the input after adding a task
      setDeadline(new Date()); // Reset deadline after task is added
    }
  };

  // Function to mark a task as completed
  const toggleTaskCompletion = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  // Function to delete a task
  const deleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  // Function to format the date
  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <View style={{flex:0.74}}>
   
    <Nav></Nav>
    <View style={styles.container}>
      <Text style={styles.title}>Task Tracker with Deadline</Text>

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

      {/* Deadline Picker */}
      <TouchableOpacity
        style={styles.deadlineButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.deadlineButtonText}>
          Select Deadline: {formatDate(deadline)}
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

      {/* List of tasks */}
      <FlatList
        data={tasks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity
              style={styles.taskTextContainer}
              onPress={() => toggleTaskCompletion(index)}
            >
              <Text
                style={[
                  styles.taskText,
                  { textDecorationLine: item.completed ? 'line-through' : 'none' },
                ]}
              >
                {item.text}
              </Text>
              <Text style={styles.deadlineText}>Deadline: {formatDate(item.deadline)}</Text>
            </TouchableOpacity>

            {/* Delete task button */}
            <TouchableOpacity onPress={() => deleteTask(index)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View></View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5', // Background color to match previous style
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#00796b', // Matching the theme color
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderColor: '#00796b', // Same color as theme
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
    backgroundColor: '#00796b', // Matching primary button color
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deadlineButton: {
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#00796b', // Button color for deadline
    borderRadius: 25,
  },
  deadlineButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 18,
    color: '#333',
  },
  deadlineText: {
    fontSize: 14,
    color: '#00796b',
    marginTop: 5,
  },
  deleteButton: {
    backgroundColor: '#e53935', // Red color for delete
    padding: 10,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
