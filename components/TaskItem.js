import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function TaskItem({ task, handleShowTask, deleteTask }) {
  const getBackgroundColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return '#FFCDD2'; // Light red
      case 'medium':
        return '#FFF9C4'; // Light yellow
      case 'low':
        return '#C8E6C9'; // Light green
      default:
        return '#E0E0E0'; // Default gray for unknown priority
    }
  };

  return (
    <View
      style={[
        styles.taskContainer,
        { backgroundColor: getBackgroundColor(task.priority) },
      ]}
    >
      <TouchableOpacity
        style={styles.taskTextContainer}
        onPress={() => handleShowTask(task)}
      >
        <Text
          style={[
            styles.taskText,
            { textDecorationLine: task.completed ? 'line-through' : 'none' },
          ]}
        >
          {task.text}
        </Text>
        <Text style={styles.deadlineText}>{task.deadline.split('T')[0]}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => deleteTask(task.id)}
        style={styles.deleteButton}
      >
        <Icon name="trash" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 18,
    color: '#333',
  },
  deadlineText: {
    fontSize: 14,
    color: '#00796b',
  },
  deleteButton: {
    marginLeft: 10,
  },
});
