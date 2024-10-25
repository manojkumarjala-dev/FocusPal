import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { AuthContext } from '@/AuthProvider';
import { db } from '@/firebaseConfig';
import { Calendar } from 'react-native-calendars';
import { router, useFocusEffect } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icons

export default function ViewTasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedTask, setSelectedTask] = useState(null); // State to store the selected task
  const [isVisible, setIsVisible] = useState(false); // Modal visibility state
  const { user } = useContext(AuthContext);
  
  // Function to check if deadline is passed
  const isDeadlinePassed = (deadline) => {
    const taskDeadline = new Date(deadline);
    const localTaskDeadline = new Date(taskDeadline.getTime() + taskDeadline.getTimezoneOffset() * 60000); // Convert UTC to local time
    
    const today = new Date().setHours(0, 0, 0, 0); // Midnight of the current day in local time
    
    return localTaskDeadline.setHours(23, 59, 59, 999) < today; // Check if deadline has passed
  };

  // Function to fetch tasks
  const fetchTasks = async () => {
    if (!user) return;

    try {
      const taskList = [];
      const snapshot = await db
        .collection('tasks')
        .where('userId', '==', user.uid)
        .get();

      snapshot.forEach((doc) => {
        taskList.push({ id: doc.id, ...doc.data() });
      });

      setTasks(taskList);
      markTaskDates(taskList);

      const today = new Date().toISOString().split('T')[0];
      filterTasksByDate(today);
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    }
  };

  // Mark task dates in calendar
  const markTaskDates = (tasksList) => {
    const marks = {};
    tasksList.forEach(task => {
      const taskDate = new Date(task.deadline).toISOString().split('T')[0];
      marks[taskDate] = { marked: true, dotColor: 'blue' };
    });
    setMarkedDates(marks);
  };

  // Delete task from Firestore
  const deleteTask = async (taskId) => {
    try {
      await db.collection('tasks').doc(taskId).delete();

      // Update the local state after deletion
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);

      // Re-filter tasks after deletion
      const today = new Date().toISOString().split('T')[0];
      filterTasksByDate(today);
    } catch (error) {
      console.error('Error deleting task: ', error);
    }
  };

  useEffect(() => {
    if (selectedTask) {
      const taskDate = new Date(selectedTask.deadline).toISOString().split('T')[0];
      filterTasksByDate(taskDate);
    }
  }, [tasks]);

  // Fetch tasks when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const today = new Date().toISOString().split('T')[0];
      fetchTasks(); // Fetch tasks
      filterTasksByDate(today); // Automatically filter tasks for today when the screen is focused
    }, [user])
  );

  // Function to filter and sort tasks by a specific date
  const filterTasksByDate = (dateString) => {
    let filtered = tasks.filter(task => {
      const taskDate = new Date(task.deadline).toISOString().split('T')[0];
      return taskDate === dateString;
    });

    // Sort tasks by priority: High > Medium > Low
    filtered = filtered.sort((a, b) => {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setFilteredTasks(filtered);
  };

  const handleDayPress = (day) => {
    filterTasksByDate(day.dateString);
  };

  const toggleTaskCompletion = async (task) => {
    const updatedCompleted = !task.completed;
    try {
      await db.collection('tasks').doc(task.id).update({
        completed: updatedCompleted, 
      });

      const updatedTasks = tasks.map((t) =>
        t.id === task.id ? { ...t, completed: updatedCompleted } : t
      );
      setTasks(updatedTasks);
      filterTasksByDate(new Date(task.deadline).toISOString().split('T')[0]);
      setIsVisible(false);
    } catch (error) {
      console.error('Error updating task completion: ', error);
    }
  };

  const handleShowTask = (task) => {
    setSelectedTask(task);
    setIsVisible(true); 
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Tasks</Text>

      <Calendar
        style={{
          borderWidth: 1,
          borderColor: 'gray',
          borderRadius: 10,
          marginBottom: 20,
        }}
        markedDates={markedDates}
        onDayPress={handleDayPress}
      />

      {filteredTasks.length > 0 ? (
        filteredTasks.map((task) => (
          <View key={task.id} style={styles.taskContainer}>
            <View style={styles.taskRow}> 
              <TouchableOpacity
                style={[styles.taskTextContainer,{flex:0.95}]}
                onPress={() => handleShowTask(task)}
              >
                <Text
                  style={[
                    styles.taskText,
                    { textDecorationLine: task.completed ? 'line-through' : 'none' },
                  ]}
                >
                  {task.text} - <Text style={styles.priorityText}>({task.priority})</Text>
                </Text>
                <Text style={styles.deadlineText}>{task.deadline.split('T')[0]}</Text>
              </TouchableOpacity>
      
              {/* Delete Button */}
              
            </View>
            <View style={{width:'10%'}}>

            <TouchableOpacity onPress={() => deleteTask(task.id)} style={[styles.deleteButton,{flex:0.05, right:0 }]}>
                <Icon name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noTasksText}>No tasks for the selected day.</Text>
      )}

      <TouchableOpacity
        style={styles.navigateButton}
        onPress={() => router.navigate('/pages/addTask')}
      >
        <Text style={styles.navigateButtonText}>Add New Task</Text>
      </TouchableOpacity>

      {selectedTask && (
        <Modal visible={isVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsVisible(false)}>
                <Icon name="times" size={24} color="red" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>{selectedTask.text}</Text>
              <Text style={styles.modalDeadline}>Deadline: {selectedTask.deadline.split('T')[0]}</Text>
              {isDeadlinePassed(selectedTask.deadline) ? (
                <Text style={styles.passedDeadlineMessage}>Deadline has passed!</Text>
              ) : null}
              <Text style={[styles.priorityText, 
                selectedTask.priority === 'High' ? styles.highPriority :
                selectedTask.priority === 'Medium' ? styles.mediumPriority :
                styles.lowPriority]}>
                Priority: {selectedTask.priority}
              </Text>

              <Text>Status: {selectedTask.completed ? 'Completed' : 'Pending'}</Text>
              
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => toggleTaskCompletion(selectedTask)}
              >
                <Text style={styles.completeButtonText}>
                  {selectedTask.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1, // Ensure the X button is always on top
  },
  closeButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalDeadline: {
    fontSize: 16,
    marginBottom: 20,
  },
  completeButton: {
    backgroundColor: '#00796b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 20,
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
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
  taskContainer: {
    paddingVertical: 10,
    flexDirection:'row',
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
  taskRow: {
    width:'90%',
    flexDirection: 'row',  // Ensure that the task text and delete button are in a single row
    justifyContent: 'space-between', // Add space between the text and the delete button
    alignItems: 'center', // Vertically center the items in the row
  },
  taskTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  deadlineText: {
    fontSize: 14,
    color: '#00796b',
    marginTop: 5,
  },
  noTasksText: {
    textAlign: 'center',
    color: '#333',
    marginTop: 10,
  },
  navigateButton: {
    backgroundColor: '#00796b',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priorityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  highPriority: {
    color: 'red', // Red color for High priority
  },
  mediumPriority: {
    color: 'orange', // Yellow color for Medium priority
  },
  lowPriority: {
    color: 'green', // Green color for Low priority
  },
  passedDeadlineMessage: {
    fontSize: 14,
    color: 'red',
    marginBottom: 10,
  },
});
