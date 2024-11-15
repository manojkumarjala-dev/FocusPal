import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function TaskModal({ task, isVisible, toggleTaskCompletion, onClose }) {

  const router = useRouter();

  // Handle navigation to the PomodoroTimerScreen
  const handleStartPomodoro = () => {
    // Navigate to PomodoroTimerScreen, passing the task ID and a callback for updating time worked
    router.navigate({
      pathname: `/pages/timer`,
      params: { fromTask: true, taskId: task.id }
    });
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="times" size={24} color="red" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>{task.text}</Text>
          <Text style={styles.modalDeadline}>Deadline: {task.deadline.split('T')[0]}</Text>
          <Text style={styles.modalCategory}>Category: {task.category}</Text>

          {/* Priority with conditional styling */}
          <Text
            style={[
              styles.priorityText,
              task.priority === 'High' ? styles.highPriority :
              task.priority === 'Medium' ? styles.mediumPriority :
              styles.lowPriority,
            ]}
          >
            Priority: {task.priority}
          </Text>

          <Text>Status: {task.completed ? 'Completed' : 'Pending'}</Text>

          {/* Display Time Worked */}
          <Text>Time Worked: {task.totalWorkedTime || 0} minutes</Text>

          <TouchableOpacity style={styles.completeButton} onPress={() => toggleTaskCompletion(task)}>
            <Text style={styles.completeButtonText}>
              {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
            </Text>
          </TouchableOpacity>

          {/* Add button to navigate to the PomodoroTimerScreen */}
          <TouchableOpacity style={styles.pomodoroButton} onPress={handleStartPomodoro}>
            <Text style={styles.pomodoroButtonText}>Start Pomodoro Timer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDeadline: {
    fontSize: 16,
    marginBottom: 5,
  },
  modalCategory: {
    fontSize: 16,
    marginBottom: 5,
  },
  priorityText: {
    fontSize: 16,
    marginBottom: 10,
  },
  highPriority: {
    color: 'red',
  },
  mediumPriority: {
    color: 'orange',
  },
  lowPriority: {
    color: 'green',
  },
  completeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  pomodoroButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  pomodoroButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
