import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '@/AuthProvider';
import { db } from '@/firebaseConfig';
import { router } from 'expo-router';

export default function AddTaskScreen() {
  const [taskText, setTaskText] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState('Low');
  const [category, setCategory] = useState('Work');
  const [customCategory, setCustomCategory] = useState('');
  const [categories, setCategories] = useState(['Work', 'Personal', 'Health']);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    loadCategories();
  }, []);

  // Load categories from AsyncStorage
  const loadCategories = async () => {
    try {
      const storedCategories = await AsyncStorage.getItem('categories');
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Save categories to AsyncStorage
  const saveCategories = async (newCategories: React.SetStateAction<string[]>) => {
    try {
      await AsyncStorage.setItem('categories', JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  };

  // Function to add a task
  const addTask = async () => {
    if (taskText.trim().length > 0 && user) {
      const taskDeadline = `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}-${String(deadline.getDate()).padStart(2, '0')}`;
      const finalCategory = category === 'Custom' ? customCategory : category;

      const newTask = {
        text: taskText,
        completed: false,
        priority,
        category: finalCategory,
        deadline: taskDeadline,
        createdAt: new Date().toISOString(),
        userId: user.uid,
      };

      try {
        await db.collection('tasks').add(newTask);

        // Save custom category if it's new
        if (category === 'Custom' && customCategory && !categories.includes(customCategory)) {
          const updatedCategories = [...categories, customCategory];
          await saveCategories(updatedCategories);
        }

        setTaskText('');
        setDeadline(new Date());
        setCategory('Work');
        setCustomCategory('');
        router.back();
      } catch (error) {
        console.error('Error adding task to Firestore: ', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Task</Text>

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

      {/* Category Selector */}
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryLabel}>Category:</Text>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={styles.categoryPicker}
        >
          {categories.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
          <Picker.Item label="Custom" value="Custom" />
        </Picker>
      </View>

      {/* Custom Category Input - Show only if 'Custom' is selected */}
      {category === 'Custom' && (
        <TextInput
          style={styles.customInput}
          placeholder="Enter custom category"
          value={customCategory}
          onChangeText={setCustomCategory}
        />
      )}

      <TouchableOpacity style={styles.deadlineButton} onPress={() => setShowDatePicker(true)}>
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
    backgroundColor: '#00796b',
  },
  priorityButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  categoryContainer: {
    alignItems:'center',

    marginBottom: 20,
    flexDirection:'row'
  },
  categoryLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 10,
  },
  categoryPicker: {
    height: 'auto',
    width: '80%',
  },
  customInput: {
    height: 45,
    borderColor: '#00796b',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 26,
    marginTop:'-20%',
    backgroundColor: '#fff',
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
