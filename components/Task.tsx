import React from 'react';
import { Text, StyleSheet, View, Modal, Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type Task = {
  lightColor?: string;
  darkColor?: string;
  name: string;
  description: string;
  deadline: string;
  onClose: () => void;
};

export function TaskCard({
  name,
  description,
  deadline,
  lightColor,
  darkColor,
  onClose,
  ...rest
}: Task) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (

      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={[styles.title, { color }]}>{name}</Text>
          <Text style={[styles.description, { color }]}>{description}</Text>
          <Text style={[styles.deadline, { color }]}>Deadline: {deadline}</Text>
          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </View>

  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: '20%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  deadline: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
