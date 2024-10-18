import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import Nav from '@/app/Nav';
import { ScrollView } from 'react-native';

const TasksTestingPage = () => {
  const handleTest = () => {
    // This is where your test logic can go
    Alert.alert('Test Button Clicked', 'Testing logic goes here.');
  };

  return (
    
    <View style={{flex:0.74}}>
   
    <Nav></Nav>
    <View style={styles.container}>
      <Text style={styles.title}>Habits Testing Page</Text>
      <Text style={styles.subtitle}>This is a placeholder page for testing habits.</Text>

      <Button title="Run Test" onPress={handleTest} />
      {/* <Button title="sign out" onPress={()=>router.navigate('/signout')} /> */}
    </View>
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
