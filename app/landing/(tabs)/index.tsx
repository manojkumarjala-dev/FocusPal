import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Button, Alert, Dimensions } from 'react-native';
import { ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';

const TasksTestingPage = () => {
  const screenWidth = Dimensions.get('window').width; 
  const handleTest = () => {
    // This is where your test logic can go
    Alert.alert('Test Button Clicked', 'Testing logic goes here.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Habits Page</Text>
      <Calendar  style={{
          borderWidth: 1,
          borderColor: 'gray',
          width: screenWidth * 0.9,
        }} onDayPress={(day: any) => {
 
        }}>
        
      </Calendar>
      <Button title="Run Test" onPress={handleTest} />
      {/* <Button title="sign out" onPress={()=>router.navigate('/signout')} /> */}
    </View>

  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
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
  subtitle: {
    fontSize: 18,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 40,
  },
});

export default TasksTestingPage;
