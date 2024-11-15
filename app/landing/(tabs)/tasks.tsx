import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '@/AuthProvider';
import { db } from '@/firebaseConfig';
import TaskItem from '@/components/TaskItem';
import TaskModal from '@/components/TaskModal';
import SortingControls from '@/components/SortingControls';
import TaskCalendar from '@/components/TaskCalendar';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Task, DateObject, TaskCategoryMap, Priority } from '@/scripts/types';


export default function ViewTasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedTask, setSelectedTask] = useState<Task|null>();
  const [isVisible, setIsVisible] = useState(false);
  const [sortOption, setSortOption] = useState('priority');
  const { user } = useContext(AuthContext);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  

  // Fetch tasks from Firestore
  const fetchTasks = async () => {
    if (!user) return;

    setLoading(true); // Start loading
    try {
      const taskList : Task[] = [];
      const snapshot = await db
        .collection('tasks')
        .where('userId', '==', user.uid)
        .get();

        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Ensure `data` includes all properties of `Task`
          if (
            data.category &&
            typeof data.completed === 'boolean' &&
            data.createdAt &&
            data.deadline &&
            data.priority &&
            data.text &&
            data.userId 
          ) {
            taskList.push({
              id: doc.id,
              category: data.category,
              completed: data.completed,
              createdAt: data.createdAt,
              deadline: data.deadline,
              priority: data.priority,
              text: data.text,
              userId: data.userId,
              totalWorkedTime: data.totalWorkedTime
            });
          } else {
            console.warn(`Missing fields in document with ID: ${doc.id}`, data);
          }
        });

      setTasks(taskList);
      markTaskDates(taskList);
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    }
    setLoading(false); // Stop loading after fetch
  };

  // Trigger filterTasksByDate when `tasks` state updates
  useEffect(() => {
    if (tasks.length > 0) {
      filterTasksByDate(getLocalDateString());
    }
  }, [tasks]);

  const getLocalDateString = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  };

  // Mark task dates in the calendar
  const markTaskDates = (tasksList: Task[]) => {
    const marks: Record<string, { marked: boolean; dotColor: string }> = {};
    tasksList.forEach(task => {
      const taskDate = new Date(task.deadline).toISOString().split('T')[0];
      marks[taskDate] = { marked: true, dotColor: 'blue' };
    });
    setMarkedDates(marks);
  };

  // Function to filter and sort tasks by a specific date
  const filterTasksByDate = (dateString: string) => {
    const filtered = tasks.filter(task => {
      const taskDate = new Date(task.deadline).toISOString().split('T')[0];
      return taskDate === dateString;
    });
    setFilteredTasks(filtered);
  };

  // Delete task from Firestore
  const deleteTask = async (taskId: string) => {
    try {
      await db.collection('tasks').doc(taskId).delete();
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      filterTasksByDate(new Date().toISOString().split('T')[0]); // Re-filter for today's tasks
    } catch (error) {
      console.error('Error deleting task: ', error);
    }
  };

  // Fetch tasks and filter by today's date when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

  const handleDayPress = (day: DateObject) => {
    filterTasksByDate(day.dateString);
  };

  const toggleTaskCompletion = async (task : Task) => {
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

  const handleShowTask = (task: Task) => {
    setSelectedTask(task);
    setIsVisible(true);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => { fetchTasks(); setSortOption('priority'); }} />
      }
    >
      <Text style={styles.title}>Your Tasks</Text>
      <TaskCalendar markedDates={markedDates} onDayPress={handleDayPress} />
      <SortingControls sortOption={sortOption} setSortOption={setSortOption} />

      {loading ? (
        // Show loading indicator while fetching tasks
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00796b" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : filteredTasks.length > 0 ? (
        sortOption === 'category' ? (
          // Group tasks by category when sorting by category
          Object.entries(
            filteredTasks.reduce((acc: TaskCategoryMap, task) => {
              acc[task.category] = [...(acc[task.category] || []), task];
              return acc;
            }, {})
          ).map(([category, tasksInCategory]) => (
            <View key={category}>
              <Text style={styles.categoryHeader}>{category}</Text>
              {tasksInCategory.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  handleShowTask={handleShowTask}
                  deleteTask={deleteTask}
                />
              ))}
            </View>
          ))
        ) : (
          // Sort tasks by priority when not grouped by category
          filteredTasks
            .sort((a, b) => {
              const priorityOrder = { High: 1, Medium: 2, Low: 3 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                handleShowTask={handleShowTask}
                deleteTask={deleteTask}
              />
            ))
        )
      ) : (
        // Show a happy message if there are no tasks
        <View style={styles.noTasksContainer}>
          <Text style={styles.noTasksText}>🎉 You're all caught up! No tasks for today.</Text>
        </View>
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isVisible={isVisible}
          toggleTaskCompletion={toggleTaskCompletion}
          onClose={() => {
            setIsVisible(false);
            setSelectedTask(null);
          }}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.navigate('/pages/addTask')}
      >
        <Text style={styles.addButtonText}>Add New Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#00796b',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796b',
    marginVertical: 10,
  },
  container: {
    flex: 1,
    marginBottom: '20%',
    paddingBottom: '30%',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#00796b',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,

  },
  noTasksContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  noTasksText: {
    fontSize: 18,
    color: '#00796b',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
});
