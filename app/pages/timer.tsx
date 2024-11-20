import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { db } from '@/firebaseConfig'; // Firebase config
import { AuthContext } from '@/AuthProvider'; // Import Auth context
import firebase from 'firebase/compat';
import { useLocalSearchParams } from 'expo-router';

const PomodoroTimerScreen = () => {
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(1500); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isTimerCompleted, setIsTimerCompleted] = useState(false);
  const [customWorkTime, setCustomWorkTime] = useState(25); // Default 25 minutes
  const [customBreakTime, setCustomBreakTime] = useState(5); // Default 5 minutes
  const [isCustomizing, setIsCustomizing] = useState(false); // Custom timer modal state
  const { user } = useContext(AuthContext);
  const [totalWorkedTime, setTotalWorkedTime] = useState(0); // Track total worked time in seconds
  const params = useLocalSearchParams();
  const { fromTask=false, taskId } = params;
  useEffect(() => {
    let timer;

    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsTimerCompleted(true);
      if (isWorkTime) {
        // If working, log the work time session
        addFocusSession();
      }
      setIsWorkTime(!isWorkTime); // Toggle between work and break
      resetTimer();
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft, isWorkTime]);

  const startCustomTimer = () => {
    // Convert minutes to seconds
    const workTimeInSeconds = customWorkTime * 60;
    const breakTimeInSeconds = customBreakTime * 60;

    setSecondsLeft(isWorkTime ? workTimeInSeconds : breakTimeInSeconds);
    setIsRunning(true);
    setIsCustomizing(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(isWorkTime ? customWorkTime * 60 : customBreakTime * 60);
  };

  const addFocusSession = async () => {
    if (!user) return;

    try {
      const sessionQuery = db.collection('focusSessions').where('userId', '==', user.uid);
      const sessionSnapshot = await sessionQuery.get();

      if (sessionSnapshot.empty) {
        await db.collection('focusSessions').add({
          userId: user.uid,
          count: 1,
        });
      } else {
        const doc = sessionSnapshot.docs[0];
        await doc.ref.update({
          count: firebase.firestore.FieldValue.increment(1),
        });
      }
    } catch (error) {
      console.error('Error updating focus session count:', error);
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleTimerCompletion = () => {
    if (fromTask && taskId) {
      // If we are coming from a task and the timer is done, update the task with the time worked
      setTotalWorkedTime(prev => {
        const updatedTime = prev + customWorkTime;
        console.log("Updated Time", updatedTime);
        updateTaskWithTime(updatedTime);
        return updatedTime;
      });
    }
    setIsTimerCompleted(false);
  };

  const updateTaskWithTime = async (workedMinutes) => {
    try {
      const taskRef = db.collection('tasks').doc(taskId);
      const taskDoc = await taskRef.get();
  
      if (taskDoc.exists) {
        const taskData = taskDoc.data();
        const newTotalWorkedTime = (taskData.totalWorkedTime || 0) + workedMinutes;
  
        // Update the task in the database with the new worked time
        await taskRef.update({
          totalWorkedTime: newTotalWorkedTime,
        });
        
        console.log(`Task updated successfully with new total worked time: ${newTotalWorkedTime}`);
      } else {
        console.log("Task not found!");
      }
    } catch (error) {
      console.error("Error updating task with worked time:", error);
    }
  };
  

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isWorkTime ? '#FFE4E1' : '#E0F7FA', // Light pink for work, light blue for break
      },
    ]}>
      <Text style={styles.title}>{isWorkTime ? 'Work Time' : 'Break Time'}</Text>
      <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>
      <TouchableOpacity onPress={() => setIsCustomizing(true)} style={{ paddingBottom: 15 }}>
        <Text style={styles.customButtonText}>Set Custom Timer</Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={toggleTimer}>
          <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={resetTimer}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Completion modal */}
      <Modal visible={isTimerCompleted} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Work time up! Do you want to take a break or continue another session?</Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  // Continue with another work session
                  setIsTimerCompleted(false);
                  setIsWorkTime(true); // Set to work time
                  setSecondsLeft(customWorkTime * 60); // Reset to custom work time
                  setIsRunning(true); // Start the timer
                }}
              >
                <Text style={{ color: 'white' }}>No! Another session</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  // Start a break session
                  setIsTimerCompleted(false);
                  setIsWorkTime(false); // Set to break time
                  setSecondsLeft(customBreakTime * 60); // Reset to custom break time
                  setIsRunning(true); // Start the timer
                  handleTimerCompletion(); // Update task after work session ends
                }}
              >
                <Text style={{ color: 'white' }}>Start Break</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom timer modal */}
      <Modal visible={isCustomizing} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Custom Timer</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Work time (minutes)"
              value={String(customWorkTime)}
              onChangeText={(text) => setCustomWorkTime(Number(text))}
            />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Break time (minutes)"
              value={String(customBreakTime)}
              onChangeText={(text) => setCustomBreakTime(Number(text))}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={startCustomTimer}>
                <Text style={{ color: 'white' }}>Start Timer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setIsCustomizing(false)}>
                <Text style={{ color: 'white' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa', // Light background for the entire screen
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  timer: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#333', // Dark gray for timer
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'space-between',
    width: '80%', // Space buttons evenly
  },
  primaryButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#28a745', // Green for primary action
    marginHorizontal: 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#dc3545', // Red for secondary action
    marginHorizontal: 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  customButtonText: {
    fontSize: 16,
    color: '#007BFF',
    textDecorationLine: 'underline', // Emphasize with underline
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#007BFF', // Blue buttons for modals
    borderRadius: 10,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    width: '100%',
    marginBottom: 15,
  },
});


export default PomodoroTimerScreen;
