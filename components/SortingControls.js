import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SortingControls({ sortOption, setSortOption }) {
  return (
    <View style={styles.sortContainer}>
      <Text style={styles.sortLabel}>Sort By:</Text>
      <TouchableOpacity
        style={[styles.sortButton, sortOption === 'priority' && styles.selectedSortButton]}
        onPress={() => setSortOption('priority')}
      >
        <Text style={styles.sortButtonText}>Priority</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.sortButton, sortOption === 'category' && styles.selectedSortButton]}
        onPress={() => setSortOption('category')}
      >
        <Text style={styles.sortButtonText}>Category</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        justifyContent: 'center',
      },
      sortLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00796b',
        marginRight: 10,
      },
      sortButton: {
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 15,
        marginHorizontal: 5,
      },
      selectedSortButton: {
        backgroundColor: '#00796b',
      },
      sortButtonText: {
        color: '#333',
        fontWeight: 'bold',
      },
});
