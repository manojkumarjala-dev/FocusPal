import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, ImageBackground } from 'react-native';
import { db } from '@/firebaseConfig';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { format, startOfWeek, subWeeks, addDays, addWeeks } from 'date-fns';
import { AuthContext } from '@/AuthProvider';

const HomeScreen = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [habits, setHabits] = useState([]);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weekStartDate, setWeekStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const { user } = useContext(AuthContext);

  const fetchHabits = async () => {

      const habitsCollection = collection(db, 'habits');
      const habitSnapshot = await getDocs(habitsCollection);
      const habitList = habitSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setHabits(habitList);

  }

  const openStatusModal = (habit) => {
    setSelectedHabit(habit);
    setModalVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
    }, [])
  );

  const markHabit = async (status, date) => {
    if (!selectedHabit) return;
  
    try {
      const habitRef = doc(db, 'habits', selectedHabit.id);
      const habitSnapshot = await getDoc(habitRef);
      const habitData = habitSnapshot.data();
  
      // Validate if the date is on or after the startDate
      const habitStartDate = new Date(habitData.startDate);
      const selectedDate = new Date(date);
  
      if (selectedDate < habitStartDate) {
        alert("You cannot mark a habit before its start date.");
        return;
      }
  
      const updates = {
        [`dates.${status}`]: arrayUnion(date),
      };
  
      // If marking as 'success', ensure date is removed from 'failure' array, and vice versa
      if (status === 'success') {
        if (habitData.dates?.failure?.includes(date)) {
          updates['dates.failure'] = habitData.dates.failure.filter((d) => d !== date);
        }
      } else if (status === 'failure') {
        if (habitData.dates?.success?.includes(date)) {
          updates['dates.success'] = habitData.dates.success.filter((d) => d !== date);
        }
      }
  
      // Update the database with the new dates
      await updateDoc(habitRef, updates);
  
      // Retrieve updated success dates after change
      const updatedHabitSnapshot = await getDoc(habitRef);
      const updatedHabitData = updatedHabitSnapshot.data();
      const successDates = (updatedHabitData.dates?.success || []).sort();
  
      // Calculate highest streak and current streak from scratch
      let highestStreak = 0;
      let currentStreak = 0;
      let tempStreak = 0;
      let previousDate = null;
  
      successDates.forEach((date) => {
        const currentDate = new Date(date);
        if (previousDate && currentDate.getTime() - previousDate.getTime() === 86400000) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
        currentStreak = tempStreak;
        highestStreak = Math.max(highestStreak, currentStreak);
        previousDate = currentDate;
      });
  
      // Prepare streak updates for Firestore
      updates['streaks.currentStreak'] = currentStreak;
      updates['streaks.highestStreak'] = highestStreak;
  
      // Update streaks in Firestore
      await updateDoc(habitRef, updates);
  
      // Update local state with new dates and streaks
      setHabits((prevHabits) =>
        prevHabits.map((habit) => {
          if (habit.id === selectedHabit.id) {
            const updatedDates = { ...habit.dates };
            if (status === 'success') {
              updatedDates.success = updatedDates.success
                ? [...updatedDates.success, date].filter((d) => d !== date || status === 'success')
                : [date];
              updatedDates.failure = updatedDates.failure ? updatedDates.failure.filter((d) => d !== date) : [];
            } else if (status === 'failure') {
              updatedDates.failure = updatedDates.failure
                ? [...updatedDates.failure, date].filter((d) => d !== date || status === 'failure')
                : [date];
              updatedDates.success = updatedDates.success ? updatedDates.success.filter((d) => d !== date) : [];
            }
            return {
              ...habit,
              dates: updatedDates,
              streaks: {
                currentStreak,
                highestStreak,
              },
            };
          }
          return habit;
        })
      );
    } catch (error) {
      console.error('Error updating habit:', error);
    } finally {
      setModalVisible(false);
    }
  };
  
  
  
  

  const isFutureDate = (date) => {
    const today = new Date();
    const selected = new Date(date);
    return selected > today;
  };

  const isWeeklyHabitDue = (startDate, currentDate) => {
    const start = new Date(startDate);
    const current = new Date(currentDate);
    const diffDays = Math.floor((current - start) / (1000 * 60 * 60 * 24));
    return diffDays % 7 === 0;
  };

  const isCustomDay = (customDays, date) => {
    const dayOfWeekMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOfWeek = dayOfWeekMap[new Date(date).getUTCDay()];
    return customDays?.includes(dayOfWeek);
  };

  const generateWeekDates = () => {
    return Array.from({ length: 7 }).map((_, index) => {
      const date = addDays(weekStartDate, index);
      return {
        formattedDate: format(date, 'dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        month: format(date, 'MMM')
      };
    });
  };

  const getMonthDisplay = () => {
    const weekDates = generateWeekDates();
    const uniqueMonthsYears = Array.from(new Set(weekDates.map(date => `${date.month} ${format(new Date(date.fullDate), 'yyyy')}`)));
    return uniqueMonthsYears.join(' - ');
  };
  

  const goToPreviousWeek = () => {
    const newStartDate = subWeeks(weekStartDate, 1);
    setWeekStartDate(newStartDate);
    setSelectedDate(format(newStartDate, 'yyyy-MM-dd'));
  };

  const goToNextWeek = () => {
    const newStartDate = addWeeks(weekStartDate, 1);
    setWeekStartDate(newStartDate);
    setSelectedDate(format(newStartDate, 'yyyy-MM-dd'));
  };

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const habitsCollection = collection(db, 'habits');
        const habitSnapshot = await getDocs(habitsCollection);
        const habitList = habitSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setHabits(habitList);
      } catch (error) {
        console.error("Error fetching habits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  useEffect(() => {
    const filtered = habits.filter(habit => {
      // Ensure the habit belongs to the current user
      if (habit.userId !== user.uid) {
        return false;
      }
    
      // Filter based on frequency
      if (habit.frequency === 'Daily') {
        return true;
      } else if (habit.frequency === 'Weekly') {
        return isWeeklyHabitDue(habit.startDate, selectedDate);
      } else if (habit.frequency === 'Custom') {
        return isCustomDay(habit.customDays, selectedDate);
      }
      return false;
    });
    
    setFilteredHabits(filtered);
    
  }, [selectedDate, habits]);

  const renderHabit = ({ item }) => {
    const isTodaySuccess = item.dates?.success?.includes(selectedDate);
    const isTodayFailure = item.dates?.failure?.includes(selectedDate);

    return (
      <View key={item.id} style={styles.habitContainer}>
        <TouchableOpacity onPress={() => router.navigate(`/pages/habitPage/${item.id}`)}>
          <Text style={styles.habitName}>{item.name}</Text>
          <Text style={styles.habitFrequency}>{item.frequency}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.checkbox,
            { backgroundColor: isTodaySuccess ? 'green' : isTodayFailure ? 'red' : '#ccc' },
          ]}
          onPress={() => openStatusModal(item)}
        >
          <Text style={styles.checkboxText}>
            {isTodaySuccess ? '✔️' : isTodayFailure ? '❌' : 'Mark'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00796b" />
      </View>
    );
  }

  return (
    <ImageBackground
    source={require('@/assets/images/habitt.webp')} // Ensure the correct path to your assets folder
    style={styles.backgroundImage}
  >
    <ScrollView style={styles.container}>

      <TouchableOpacity
        style={styles.addHabitButton}
        onPress={() => router.navigate('/pages/addHabit')}
      >
        <Text style={styles.addHabitButtonText}>+ Add Habit</Text>
      </TouchableOpacity>

      <View style={styles.weekNavigationContainer}>
        <TouchableOpacity onPress={goToPreviousWeek}>
          <Text style={styles.arrowText}>◀️</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{getMonthDisplay()}</Text>
        <TouchableOpacity onPress={goToNextWeek}>
          <Text style={styles.arrowText}>▶️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekContainer}>
        {generateWeekDates().map(({ formattedDate, fullDate }) => (
          <TouchableOpacity
            key={fullDate}
            style={[
              styles.dateButton,
              selectedDate === fullDate && styles.selectedDateButton,
            ]}
            onPress={() => setSelectedDate(fullDate)}
          >
            <Text style={styles.dateButtonText}>{formattedDate}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.habitList, { marginTop: '10%', marginBottom: '10%' }]}>
        {filteredHabits.map((item) => renderHabit({ item, key: item.id }))}
      </View>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalText}>
              Mark Habit Status for {selectedHabit?.name}
            </Text>
            {!isFutureDate(selectedDate) ? (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: 'green' }]}
                  onPress={() => markHabit('success', selectedDate)}
                >
                  <Text style={styles.buttonText}>✔️ Success</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: 'red' }]}
                  onPress={() => markHabit('failure', selectedDate)}
                >
                  <Text style={styles.buttonText}>❌ Failure</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.futureDateText}>
                Cannot mark status for future dates.
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  </ImageBackground>
  );
};



const styles = StyleSheet.create({
  // Styles for the week navigation container
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', // Cover the entire screen
  },
weekNavigationContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginVertical: 10,
  backgroundColor: '#F1F8E9', // Soft background color
  paddingVertical: 15,
  paddingHorizontal: 20,
  borderRadius: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 5,
  elevation: 4,
},

arrowTextContainer: {
  backgroundColor: '#1DB954',
  padding: 10,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 4,
},

arrowText: {
  fontSize: 20,
  color: '#FFFFFF', // White color for arrow text
},

monthText: {
  fontSize: 20,
  fontWeight: 'bold',

},

  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  dateButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  selectedDateButton: {
    backgroundColor: '#1DB954',
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  container: {
    flex: 1,
    padding: 20,
    marginBottom:'25%'
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  checkbox: {
    width: 60,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 30,
  },
  statusButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addHabitButton: {
    backgroundColor: '#00796b',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addHabitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


export default HomeScreen;
