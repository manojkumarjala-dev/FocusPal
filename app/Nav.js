import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Menu, Divider, Provider } from 'react-native-paper';
import { getAuth, signOut } from 'firebase/auth'; 
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
export default Nav = () => {
    const auth = getAuth();
      const navigate=useNavigation();
      const [visible, setVisible] = useState(false);


  const toggleMenu = () => setVisible((prev) => !prev);
    const handleLogout = () => {
      signOut(auth)
        .then(() => {
          console.log('User signed out successfully');
          router.navigate('/')
        })
        .catch((error) => {
          console.error('Error signing out:', error.message);
        });
    };

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.header}>
          <Menu
            visible={visible}
            onDismiss={() => setVisible(false)}
            anchor={
              <TouchableOpacity onPress={toggleMenu}>
                <Icon name="menu" size={30} color="#000" />
              </TouchableOpacity>
            }
            style={{position:'absolute',left:'2%', top:'27%'}}
          >
            <Menu.Item title="My Profile" />
            <Divider />
            <Menu.Item onPress={()=>router.navigate('/signout')} title="Logout" />
          </Menu>
        </View>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    padding:10,
  },
});