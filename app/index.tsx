import React, { useContext, useEffect, useState } from 'react';
import { Image, StyleSheet, ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { AuthContext } from '@/AuthProvider';
import * as Notifications from 'expo-notifications';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { format } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


export default function HomeScreen() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Redirect to main screen if user is already logged in

      setLoading(false); // Stop loading immediately after redirection

      // Initialize the app's features only after redirecting
      (async () => {
        await requestPermissions(); // Request notification permissions
        await fetchTasksAndHabits(); // Fetch tasks and habits due today
        await scheduleDailyNotification(); // Schedule daily notification
      })();
    } else {
      setLoading(false); // Stop loading if there's no user
    }
  }, [user]);

  // Request notification permissions on app startup
  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Please enable notifications in settings to get daily reminders');
      }
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
    }
  };

  // Fetch tasks and habits due today
  const fetchTasksAndHabits = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const tasList = [];
      const habiList = [];
  
      // Fetch tasks due today for the specific user
      if (user) {
        const taskSnapshot = await db
          .collection('tasks')
          .where('userId', '==', user.uid)
          .get();
  
        taskSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.deadline === today) {
            tasList.push({
              id: doc.id,
              category: data.category,
              completed: data.completed,
              createdAt: data.createdAt,
              deadline: data.deadline,
              priority: data.priority,
              text: data.text,
              userId: data.userId,
            });
          }
        });
        setTasks(tasList);
        console.log("TASKS:", tasList);
      }
  
      // Fetch habits for the specific user
      if (user) {
        const habitSnapshot = await db
          .collection('habits')
          .where('userId', '==', user.uid)
          .get();
  
        habitSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(data)
          habiList.push({
            id: doc.id,
            habitName: data.name,
            frequency: data.frequency,
            startDate: data.startDate,
            customDays: data.customDays, // Only for custom frequency
          });
        });
        
        // Filter habits that are due today based on frequency
        const filteredHabits = habiList.filter(habit => {
          if (habit.frequency === 'Daily') {
            return true; // Daily habits are always due
          } else if (habit.frequency === 'Weekly') {
            return isWeeklyHabitDue(habit.startDate, today);
          } else if (habit.frequency === 'Custom') {
            return isCustomDay(habit.customDays, today);
          }
          return false;
        });
  
        setHabits(filteredHabits);
        console.log("HABITS:", filteredHabits);
      }
    } catch (error) {
      console.error("Error fetching tasks or habits:", error);
    }
  };
  
  // Helper function to check if a weekly habit is due today
  const isWeeklyHabitDue = (startDate, selectedDate) => {
    const start = new Date(startDate);
    const selected = new Date(selectedDate);
    const diffInDays = (selected - start) / (1000 * 60 * 60 * 24);
    return diffInDays % 7 === 0; // Due every 7 days
  };
  
  // Helper function to check if a custom habit is due on a specific day
  const isCustomDay = (customDays, selectedDate) => {
    const selectedDay = new Date(selectedDate).getDay(); // 0 for Sunday, 1 for Monday, etc.
    return customDays.includes(selectedDay);
  };
  


  // Schedule a daily notification at a specific time (e.g., 8 am)
  const scheduleDailyNotification = async () => {
    try {
      // Prepare the notification content
      const taskList = tasks.map(task => `• ${task.text}`).join('\n');
      const habitList = habits.map(habit => `• ${habit.habitName}`).join('\n');
      let message = "Tasks and Habits Due Today:\n";

      if (taskList) message += `Tasks:\n${taskList}\n`;
      if (habitList) message += `Habits:\n${habitList}\n`;
      if (!taskList && !habitList) message += "No tasks or habits due today!";

      // Cancel any previously scheduled notifications to avoid duplicates
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule the daily notification at 8 am
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Daily Reminder 📅",
          body: message,
          sound: true,
        },
        trigger: {
          hour: 22, 
          minute: 54,
          repeats: true,
        },
      });
    } catch (error) {
      console.error("Error scheduling daily notification:", error);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.appName}>FocusPal</Text>
        <Text style={styles.tagline}>Master your time, build great habits.</Text>
      </View>

      <View style={styles.illustrationContainer}>
        <Image source={require('@/assets/images/focus.png')} style={styles.illustration} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.navigate('/login')}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.navigate('/signup')}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00796b', // Dark teal color for the app name
  },
  tagline: {
    fontSize: 16,
    color: '#757575',
    marginTop: 8,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  illustration: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
  },
  buttonContainer: {
    flexDirection: 'row', // Make the buttons sit side by side
    justifyContent: 'space-between', // Add space between the buttons
    marginTop: 30,
    width: '100%',
  },
  button: {
    flex: 1, // Make both buttons take equal width
    backgroundColor: '#00796b', // Button background color
    paddingVertical: 15,
    marginHorizontal: 10, // Adds spacing between buttons
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
