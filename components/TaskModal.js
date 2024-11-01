import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function TaskModal({ task, isVisible, toggleTaskCompletion, onClose }) {
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

      <TouchableOpacity style={styles.completeButton} onPress={() => toggleTaskCompletion(task)}>
        <Text style={styles.completeButtonText}>
          {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

  );
}

const styles = StyleSheet.create({
    modalCategory: {
        fontSize: 16,
        marginBottom: 10,
      },
      priorityText: {
        fontSize: 16,
        fontWeight: 'bold',
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
        zIndex: 1,
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
});
