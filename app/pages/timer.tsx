import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { db } from '@/firebaseConfig'; // Firebase config
import { AuthContext } from '@/AuthProvider'; // Import Auth context
import firebase from 'firebase/compat';

const PomodoroTimerScreen = () => {
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [isTimerCompleted, setIsTimerCompleted] = useState(false);
  const [customWorkTime, setCustomWorkTime] = useState(25); // Default 25 minutes
  const [customBreakTime, setCustomBreakTime] = useState(5); // Default 5 minutes
  const [isCustomizing, setIsCustomizing] = useState(false); // Custom timer modal state
  const { user } = useContext(AuthContext);

  useEffect(() => {
    let timer;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsTimerCompleted(true);
      if (isWorkTime) {
        addFocusSession(); // Log session to Firestore
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isWorkTime ? 'Work Time' : 'Break Time'}</Text>
      <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>
      <TouchableOpacity  onPress={() => setIsCustomizing(true)} style={{paddingBottom:15}}>
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
            <Text style={styles.modalTitle}>Take a Break!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setIsTimerCompleted(false);
                setSecondsLeft(isWorkTime ? customWorkTime * 60 : customBreakTime * 60);
                toggleTimer()
              }}
            >
              <Text style={{ color: 'white' }}>Start Break</Text>
            </TouchableOpacity>
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 20,
  },
  timer: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    backgroundColor: '#00796b',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: '#004d40',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  customButton: {
    backgroundColor: '#00796b',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cutomButtonText:{
    fontSize: 18,
    color:'blue'
  },
  modalButton:{
    backgroundColor: '#00796b',
    paddingVertical:'3%',
    paddingHorizontal: '3%',
    borderRadius: 25,
    marginHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width:'40%',
    elevation: 5,
  },
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width:'100%',
    justifyContent: 'space-around',
  },
  customButtonText:{
    color:'blue',
    fontSize:16
  }
});

export default PomodoroTimerScreen;
