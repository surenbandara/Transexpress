// SuccessPopup.tsx
import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface SuccessPopupProps {
  visible: boolean;
  onClose: () => void;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000); // Auto-close after 1 second
      return () => clearTimeout(timer); // Clean up timer on component unmount
    }
  }, [visible, onClose]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
        <Icon name="check-circle" size={30} color="#28a745" style={styles.icon} />
          <Text style={styles.successText}>Success</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  successText: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: 16,
  },
  icon: {
    marginRight: 10, 
  },
});

export default SuccessPopup;
